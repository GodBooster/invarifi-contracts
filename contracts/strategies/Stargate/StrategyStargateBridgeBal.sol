// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/stargate/IStargateRouter.sol";
import "../../interfaces/stargate/IStargateRouterETH.sol";
import "../../interfaces/common/IWrappedNative.sol";
import "../../utils/BalancerUtils.sol";

import "../Common/StratFeeManagerAccessableInitializable.sol";

interface IStargateChef {
    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function userInfo(
        uint256 _pid,
        address _user
    ) external view returns (uint256, uint256);

    function emergencyWithdraw(uint256 _pid) external;

    function pendingStargate(
        uint256 _pid,
        address _user
    ) external view returns (uint256);

    function pendingEmissionToken(
        uint256 _pid,
        address _user
    ) external view returns (uint256);
}

interface ISrcSwapper {
    function swapReward(uint256 _amount) external payable;

    function estimate(
        uint256 _amount
    ) external view returns (uint256 gasNeeded);
}

contract StrategyStargateBridgeBal is StratFeeManagerAccessableInitializable {
    using SafeERC20 for IERC20;
    using BalancerUtils for IBalancerVault;

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
    uint256 public minSwap;
    address public srcSwapper;

    bool public harvestOnDeposit;
    uint256 public lastHarvest;
    uint256 public minNative;
    uint256 public totalLocked;
    uint256 public duration;

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

    BalancerUtils.BatchSwapInfo public nativeToDepositPath;

    function initialize(
        address _want,
        address _output,
        uint256 _poolId,
        address _chef,
        address _stargateRouter,
        uint256 _routerPoolId,
        uint256 _minSwap,
        address _srcSwapper,
        bytes32[] memory _nativeToDepositPools,
        address[] memory _nativeToDepositRoute,
        CommonAddressesAccessable calldata _commonAddresses
    ) public initializer {
        __StratFeeManagerAccessableInitializable_init(_commonAddresses);

        want = _want;
        output = _output;
        poolId = _poolId;
        chef = _chef;
        stargateRouter = _stargateRouter;
        routerPoolId = _routerPoolId;
        minSwap = _minSwap;
        srcSwapper = _srcSwapper;

        minNative = 0.01 ether;
        duration = 24 hours;

        native = _nativeToDepositRoute[0];
        depositToken = _nativeToDepositRoute[_nativeToDepositRoute.length - 1];

        BalancerUtils.assignBatchSwapInfo(
            nativeToDepositPath,
            _nativeToDepositPools,
            _nativeToDepositRoute
        );

        _giveAllowances();
    }

    // add liquidity to Stargate pool
    function _addLiquidity() internal {
        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        if (depositToken != native) {
            IBalancerVault(unirouter).swap(nativeToDepositPath, nativeBal);
            uint256 depositBal = IERC20(depositToken).balanceOf(address(this));
            IStargateRouter(stargateRouter).addLiquidity(
                routerPoolId,
                depositBal,
                address(this)
            );
        } else {
            IWrappedNative(native).withdraw(nativeBal);
            IStargateRouterETH(stargateRouter).addLiquidityETH{
                value: nativeBal
            }();
        }
    }

    function nativeToDeposit() external view returns (address[] memory) {
        return nativeToDepositPath.route;
    }

    function deposit() public whenNotPaused {
        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal > 0) {
            IStargateChef(chef).deposit(poolId, wantBal);
            emit Deposit(balanceOf());
        }
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal < _amount) {
            IStargateChef(chef).withdraw(poolId, _amount - wantBal);
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
        _bridgeRewards();
        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        if (nativeBal > 0) {
            chargeFees(callFeeRecipient);
            _addLiquidity();
            uint256 wantHarvested = balanceOfWant();
            totalLocked = wantHarvested + lockedProfit();
            deposit();

            lastHarvest = block.timestamp;
            emit StratHarvest(msg.sender, wantHarvested, balanceOf());
        }
    }

    // bridge rewards using unwrapped ETH on this contract
    function _bridgeRewards() internal {
        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        if (nativeBal > 0 && address(this).balance < minNative) {
            uint256 deficit = minNative - address(this).balance;
            uint256 nativeToWithdraw = nativeBal > deficit
                ? deficit
                : nativeBal;
            IWrappedNative(native).withdraw(nativeToWithdraw);
        }

        if (rewardsAvailable() > minSwap) {
            IStargateChef(chef).deposit(poolId, 0);
            uint256 outputBal = IERC20(output).balanceOf(address(this));
            uint256 bridgeCost = ISrcSwapper(srcSwapper).estimate(outputBal);
            if (bridgeCost < address(this).balance) {
                ISrcSwapper(srcSwapper).swapReward{value: bridgeCost}(
                    outputBal
                );
            }
        }
    }

    // performance fees
    function chargeFees(address callFeeRecipient) internal {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 nativeFeeBal = (IERC20(native).balanceOf(address(this)) *
            fees.total) / DIVISOR;

        uint256 callFeeAmount = (nativeFeeBal * fees.call) / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 batcherFeeAmount = (nativeFeeBal * fees.batcher) / DIVISOR;
        IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

        uint256 strategistFeeAmount = (nativeFeeBal * fees.strategist) /
            DIVISOR;
        IERC20(native).safeTransfer(getStrategist(), strategistFeeAmount);

        emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFeeAmount);
    }

    // calculate the total underlaying 'want' held by the strat.
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() + balanceOfPool() - lockedProfit();
    }

    // it calculates how much 'want' this contract holds.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    // it calculates how much 'want' the strategy has working in the farm.
    function balanceOfPool() public view returns (uint256) {
        (uint256 _amount, ) = IStargateChef(chef).userInfo(
            poolId,
            address(this)
        );
        return _amount;
    }

    function lockedProfit() public view returns (uint256) {
        uint256 elapsed = block.timestamp - lastHarvest;
        uint256 remaining = elapsed < duration ? duration - elapsed : 0;
        return (totalLocked * remaining) / duration;
    }

    // returns rewards unharvested
    function rewardsAvailable() public view returns (uint256) {
        return
            IStargateChef(chef).pendingEmissionToken(poolId, address(this)) +
            IERC20(output).balanceOf(address(this));
    }

    // native reward amount for calling harvest
    function callReward() public view returns (uint256) {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        nativeBal = nativeBal > minNative ? nativeBal - minNative : 0;

        return (((nativeBal * fees.total) / DIVISOR) * fees.call) / DIVISOR;
    }

    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
        harvestOnDeposit = _harvestOnDeposit;
    }

    function setMinimums(
        uint256 _minSwap,
        uint256 _minNative
    ) external onlyManager {
        minSwap = _minSwap;
        minNative = _minNative;
    }

    function setDuration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    function setSrcSwapper(address _srcSwapper) external onlyOwner {
        IERC20(output).safeApprove(srcSwapper, 0);
        srcSwapper = _srcSwapper;
        IERC20(output).safeApprove(srcSwapper, type(uint).max);
    }

    // called as part of strat migration. Sends all the available funds back to the vault.
    function retireStrat() external {
        require(msg.sender == vault, "!vault");

        IStargateChef(chef).emergencyWithdraw(poolId);

        uint256 wantBal = IERC20(want).balanceOf(address(this));
        IERC20(want).transfer(vault, wantBal);
    }

    // pauses deposits and withdraws all funds from third party systems.
    function panic() public onlyManager {
        pause();
        IStargateChef(chef).emergencyWithdraw(poolId);
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
        IERC20(output).safeApprove(srcSwapper, type(uint).max);
        IERC20(native).safeApprove(unirouter, type(uint).max);
        IERC20(depositToken).safeApprove(stargateRouter, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(want).safeApprove(chef, 0);
        IERC20(output).safeApprove(srcSwapper, 0);
        IERC20(native).safeApprove(unirouter, 0);
        IERC20(depositToken).safeApprove(stargateRouter, 0);
    }

    receive() external payable {}
}
