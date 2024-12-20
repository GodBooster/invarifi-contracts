// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/common/IMasterChef.sol";
import "../../interfaces/stargate/IStargateRouter.sol";
import "../Common/StratFeeManager.sol";
import "../../utils/BalancerUtils.sol";
import "../../utils/StringUtils.sol";
import "../../utils/GasFeeThrottler.sol";
import "../../utils/UniswapV3Utils.sol";
import "../../utils/StringUtils.sol";
import "../Common/StratFeeManagerAccessableInitializable.sol";

contract StrategyStargateArb is StratFeeManagerAccessableInitializable {
    using SafeERC20 for IERC20;

    // Tokens used
    address public native;
    address public output;
    address public want;
    address public depositToken;

    // Third party contracts
    address public chef;
    uint256 public poolId;
    address public stargateRouter;
    uint256 public routerPoolId;

    bool public harvestOnDeposit;
    uint256 public lastHarvest;
    string public pendingRewardsFunctionName;

    bytes public outputToNativePath;
    bytes public outputToDepositPath;

    event StratHarvest(
        address indexed harvester,
        uint256 wantHarvested,
        uint256 tvl
    );
    event Deposit(uint256 tvl);
    event Withdraw(uint256 tvl);
    event ChargedFees(
        uint256 callFees,
        uint256 batcherFees,
        uint256 strategistFees
    );

    function initialize(
        address _want,
        uint256 _poolId,
        address _chef,
        address _stargateRouter,
        uint256 _routerPoolId,
        bytes memory _outputToNativePath,
        bytes memory _outputToDepositPath,
        CommonAddressesAccessable calldata _commonAddresses
    ) external initializer {
        __StratFeeManagerAccessableInitializable_init(_commonAddresses);

        want = _want;
        poolId = _poolId;
        chef = _chef;
        stargateRouter = _stargateRouter;
        routerPoolId = _routerPoolId;

        address[] memory outputToNativeRoute = UniswapV3Utils.pathToRoute(
            _outputToNativePath
        );
        address[] memory outputToDepositRoute = UniswapV3Utils.pathToRoute(
            _outputToDepositPath
        );

        output = outputToNativeRoute[0];
        native = outputToNativeRoute[outputToNativeRoute.length - 1];
        depositToken = outputToDepositRoute[outputToDepositRoute.length - 1];

        outputToNativePath = _outputToNativePath;
        outputToDepositPath = _outputToDepositPath;

        _giveAllowances();
    }

    // puts the funds to work
    function deposit() public whenNotPaused {
        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal > 0) {
            IMasterChef(chef).deposit(poolId, wantBal);
            emit Deposit(balanceOf());
        }
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal < _amount) {
            IMasterChef(chef).withdraw(poolId, _amount - wantBal);
            wantBal = IERC20(want).balanceOf(address(this));
        }

        if (wantBal > _amount) {
            wantBal = _amount;
        }

        IERC20(want).safeTransfer(vault, wantBal);

        emit Withdraw(balanceOf());
    }

    function beforeDeposit() external virtual override {
        if (harvestOnDeposit) {
            require(msg.sender == vault, "!vault");
            _harvest(tx.origin);
        }
    }

    function harvest() external virtual {
        _harvest(tx.origin);
    }

    function harvest(address callFeeRecipient) external virtual {
        _harvest(callFeeRecipient);
    }

    function managerHarvest() external onlyManager {
        _harvest(tx.origin);
    }

    // compounds earnings and charges performance fee
    function _harvest(address callFeeRecipient) internal whenNotPaused {
        IMasterChef(chef).deposit(poolId, 0);
        uint256 outputBal = IERC20(output).balanceOf(address(this));
        if (outputBal > 0) {
            chargeFees(callFeeRecipient);
            addLiquidity();
            uint256 wantHarvested = balanceOfWant();
            deposit();

            lastHarvest = block.timestamp;
            emit StratHarvest(msg.sender, wantHarvested, balanceOf());
        }
    }

    // performance fees
    function chargeFees(address callFeeRecipient) internal {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 toNative = (IERC20(output).balanceOf(address(this)) *
            fees.total) / DIVISOR;
        UniswapV3Utils.swap(unirouter, outputToNativePath, toNative);

        uint256 nativeFeeBal = IERC20(native).balanceOf(address(this));

        uint256 callFeeAmount = (nativeFeeBal * fees.call) / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 batcherFeeAmount = (nativeFeeBal * fees.batcher) / DIVISOR;
        IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

        uint256 strategistFeeAmount = (nativeFeeBal * fees.strategist) /
            DIVISOR;
        IERC20(native).safeTransfer(getStrategist(), strategistFeeAmount);

        emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFeeAmount);
    }

    // Adds liquidity to AMM and gets more LP tokens.
    function addLiquidity() internal {
        uint256 toDeposit = IERC20(output).balanceOf(address(this));
        UniswapV3Utils.swap(unirouter, outputToDepositPath, toDeposit);

        uint256 depositBal = IERC20(depositToken).balanceOf(address(this));
        IStargateRouter(stargateRouter).addLiquidity(
            routerPoolId,
            depositBal,
            address(this)
        );
    }

    // calculate the total underlaying 'want' held by the strat.
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() + balanceOfPool();
    }

    // it calculates how much 'want' this contract holds.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    // it calculates how much 'want' the strategy has working in the farm.
    function balanceOfPool() public view returns (uint256) {
        (uint256 _amount, ) = IMasterChef(chef).userInfo(poolId, address(this));
        return _amount;
    }

    function setPendingRewardsFunctionName(
        string calldata _pendingRewardsFunctionName
    ) external onlyManager {
        pendingRewardsFunctionName = _pendingRewardsFunctionName;
    }

    // returns rewards unharvested
    function rewardsAvailable() public view returns (uint256) {
        string memory signature = StringUtils.concat(
            pendingRewardsFunctionName,
            "(uint256,address)"
        );
        bytes memory result = Address.functionStaticCall(
            chef,
            abi.encodeWithSignature(signature, poolId, address(this))
        );
        return abi.decode(result, (uint256));
    }

    // native reward amount for calling harvest
    function callReward() external pure returns (uint256) {
        return 0;
    }

    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
        harvestOnDeposit = _harvestOnDeposit;
    }

    // called as part of strat migration. Sends all the available funds back to the vault.
    function retireStrat() external {
        require(msg.sender == vault, "!vault");

        IMasterChef(chef).emergencyWithdraw(poolId);

        uint256 wantBal = IERC20(want).balanceOf(address(this));
        IERC20(want).transfer(vault, wantBal);
    }

    // pauses deposits and withdraws all funds from third party systems.
    function panic() public onlyManager {
        pause();
        IMasterChef(chef).emergencyWithdraw(poolId);
    }

    function pause() public onlyManager {
        _pause();

        _removeAllowances();
    }

    function unpause() external onlyManager {
        _unpause();

        _giveAllowances();

        deposit();
    }

    function _giveAllowances() internal {
        IERC20(want).safeApprove(chef, type(uint).max);
        IERC20(output).safeApprove(unirouter, type(uint).max);
        IERC20(depositToken).safeApprove(stargateRouter, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(want).safeApprove(chef, 0);
        IERC20(output).safeApprove(unirouter, 0);
        IERC20(depositToken).safeApprove(stargateRouter, 0);
    }

    function outputToNative() external view returns (address[] memory) {
        return UniswapV3Utils.pathToRoute(outputToNativePath);
    }

    function outputToDeposit() external view returns (address[] memory) {
        return UniswapV3Utils.pathToRoute(outputToDepositPath);
    }
}
