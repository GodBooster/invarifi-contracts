// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/common/IUniswapRouterETH.sol";
import "../../interfaces/sushi/ITridentRouter.sol";
import "../../interfaces/sushi/IBentoPool.sol";
import "../../interfaces/sushi/IBentoBox.sol";
import "../../interfaces/common/IMasterChef.sol";
import "../../interfaces/stargate/IStargateRouter.sol";
import "../Common/StratFeeManagerAccessableInitializable.sol";

contract StrategyStargatePoly is StratFeeManagerAccessableInitializable {
    using SafeERC20 for IERC20;

    struct Routes {
        address[] outputToStableRoute;
        address outputToStablePool;
        address[] stableToNativeRoute;
        address[] stableToInputRoute;
    }

    // Tokens used
    address public native;
    address public output;
    address public want;
    address public stable;
    address public depositToken;

    // Third party contracts
    address public constant chef =
        address(0x8731d54E9D02c286767d56ac03e8037C07e01e98);
    uint256 public poolId;
    address public constant stargateRouter =
        address(0x45A01E4e04F14f7A4a6702c74187c5F6222033cd);
    address public constant quickRouter =
        address(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);
    uint256 public routerPoolId;
    address public constant bentoBox =
        address(0x0319000133d3AdA02600f0875d2cf03D442C3367);

    bool public harvestOnDeposit;
    uint256 public lastHarvest;
    string public pendingRewardsFunctionName;

    // Routes
    address[] public outputToStableRoute;
    ITridentRouter.ExactInputSingleParams public outputToStableParams;
    address[] public stableToNativeRoute;
    address[] public stableToInputRoute;

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
        uint256 _routerPoolId,
        Routes calldata _routes,
        CommonAddressesAccessable calldata _commonAddresses
    ) external initializer {
        __StratFeeManagerAccessableInitializable_init(_commonAddresses);

        want = _want;
        poolId = _poolId;
        routerPoolId = _routerPoolId;

        output = _routes.outputToStableRoute[0];
        stable = _routes.outputToStableRoute[
            _routes.outputToStableRoute.length - 1
        ];
        native = _routes.stableToNativeRoute[
            _routes.stableToNativeRoute.length - 1
        ];
        depositToken = _routes.stableToInputRoute[
            _routes.stableToInputRoute.length - 1
        ];

        require(
            _routes.stableToNativeRoute[0] == stable,
            "stableToNativeRoute[0] != stable"
        );
        require(
            _routes.stableToInputRoute[0] == stable,
            "stableToInputRoute[0] != stable"
        );
        outputToStableRoute = _routes.outputToStableRoute;
        stableToNativeRoute = _routes.stableToNativeRoute;
        stableToInputRoute = _routes.stableToInputRoute;

        outputToStableParams = ITridentRouter.ExactInputSingleParams(
            0,
            1,
            _routes.outputToStablePool,
            output,
            abi.encode(output, address(this), true)
        );

        IBentoBox(bentoBox).setMasterContractApproval(
            address(this),
            unirouter,
            true,
            0,
            bytes32(0),
            bytes32(0)
        );

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

    function beforeDeposit() external override {
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
        outputToStableParams.amountIn = IERC20(output).balanceOf(address(this));
        ITridentRouter(unirouter).exactInputSingleWithNativeToken(
            outputToStableParams
        );

        uint256 toNative = (IERC20(stable).balanceOf(address(this)) *
            fees.total) / DIVISOR;
        IUniswapRouterETH(quickRouter).swapExactTokensForTokens(
            toNative,
            0,
            stableToNativeRoute,
            address(this),
            block.timestamp
        );

        uint256 nativeBal = IERC20(native).balanceOf(address(this));

        uint256 callFeeAmount = (nativeBal * fees.call) / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 batcherFeeAmount = (nativeBal * fees.batcher) / DIVISOR;
        IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

        uint256 strategistFeeAmount = (nativeBal * fees.strategist) / DIVISOR;
        IERC20(native).safeTransfer(getStrategist(), strategistFeeAmount);

        emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFeeAmount);
    }

    // Adds liquidity to AMM and gets more LP tokens.
    function addLiquidity() internal {
        if (stable != depositToken) {
            uint256 toInput = IERC20(stable).balanceOf(address(this));
            IUniswapRouterETH(quickRouter).swapExactTokensForTokens(
                toInput,
                0,
                stableToInputRoute,
                address(this),
                block.timestamp
            );
        }

        uint256 inputBal = IERC20(depositToken).balanceOf(address(this));
        IStargateRouter(stargateRouter).addLiquidity(
            routerPoolId,
            inputBal,
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

    // returns rewards unharvested
    function rewardsAvailable() public view returns (uint256) {
        return 0;
    }

    // native reward amount for calling harvest
    function callReward() external view returns (uint256) {
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
        IERC20(output).safeApprove(bentoBox, type(uint).max);
        IERC20(stable).safeApprove(quickRouter, type(uint).max);
        IERC20(depositToken).safeApprove(stargateRouter, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(want).safeApprove(chef, 0);
        IERC20(output).safeApprove(bentoBox, 0);
        IERC20(stable).safeApprove(quickRouter, 0);
        IERC20(depositToken).safeApprove(stargateRouter, 0);
    }

    function outputToStable() external view returns (address[] memory) {
        return outputToStableRoute;
    }

    function stableToNative() external view returns (address[] memory) {
        return stableToNativeRoute;
    }

    function stableToInput() external view returns (address[] memory) {
        return stableToInputRoute;
    }
}
