// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

import "./libraries/OneInchHelpers.sol";
import "./libraries/ERC20Helpers.sol";

import "./base/LpHelperBase.sol";
import "./base/Constants.sol";

import "./gelato/upgradeable/AutomateTaskCreatorUpgradeable.sol";
import "./gelato/Types.sol";
import "../interfaces/common/IWrappedNative.sol";

import "./structs/VaultConfig.sol";
import "./EarnConfiguration.sol";
import "./EarnPoolChecker.sol";
import "./helpers/GelatoSwapper.sol";

contract EarnPool is
    AutomateTaskCreatorUpgradeable,
    AccessControlAbstract,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    Constants
{
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;
    using OneInchHelpers for address;
    using DecimalsCorrectionLibrary for uint256;

    struct UserDepositPosition {
        bytes32 automationTaskId;
        uint256 reservedForAutomation;
        uint256 size;
        uint256 stopLossCost;
        mapping(address => uint256) vaultDeposited;
        uint256 stopLossPercent;
    }

    struct WithdrawParams {
        address withdrawalToken;
        bool unwrapNative;
        uint256 withdrawCost;
        uint256 stopLossCost;
        uint256 minStableOut;
        bytes oneInchSwapData;
    }

    struct DepositParams {
        uint256 amountTokenIn;
        uint256 stopLossCost;
        address tokenIn;
        bytes oneInchSwapData;
        uint256 stopLossPercent;
    }

    struct DepositETHParams {
        uint256 stopLossCost;
        bytes oneInchSwapData;
        uint256 stopLossPercent;
    }

    struct CloseParams {
        address user;
        uint256 minStableOut;
    }

    struct Fees {
        uint256 depositFee;
        uint256 withdrawalFee;
    }

    uint256 public constant MAX_DEPOSIT_FEE = 10e18;
    uint256 public constant MAX_WITHDRAWAL_FEE = 10e18;

    address public wETH;
    address public oneInchRouter;
    address public earnConfiguration;
    address public resolver;
    Fees public fees;

    mapping(address => UserDepositPosition) public positions;

    VaultConfig[] public vaultConfigs;

    uint256[50] private _gap;

    event Deposit(
        address indexed user,
        uint256 indexed timestamp,
        uint256 amountStable,
        uint256 totalSize,
        uint256 stopLossUsd
    );

    event Withdraw(
        address indexed user,
        uint256 indexed timestamp,
        uint256 amountStable,
        uint256 totalSize,
        uint256 stopLossUsd
    );

    event CloseByStopLoss(
        address indexed user,
        uint256 indexed timestamp,
        uint256 amountStable,
        uint256 feeTaken
    );

    uint256[50] private __gap;

    constructor() {
        _disableInitializers();
    }

    receive() external payable {}

    function initialize(
        address _ac,
        address _earnConfiguration,
        address _oneInchRouter,
        address _wETH,
        address _automate,
        address _resolver,
        VaultConfig[] calldata _vaultConfigs,
        Fees calldata _fees
    ) external initializer {
        __AccessAccessControlAbstract_init(_ac);
        __AutomateTaskCreator_init(_automate);
        __ReentrancyGuard_init();

        earnConfiguration = _earnConfiguration;

        oneInchRouter = _oneInchRouter;

        wETH = _wETH;
        resolver = _resolver;

        _validateFees(_fees);
        fees = _fees;

        uint256 totalPercentage;

        for (uint256 index; index < _vaultConfigs.length; index++) {
            vaultConfigs.push(_vaultConfigs[index]);
            totalPercentage += _vaultConfigs[index].poolPart;
        }

        require(totalPercentage == PERCENTS_100, "!totalPercentage");
    }

    function setFees(Fees calldata _fees) external onlyEarnManager {
        _validateFees(_fees);
        fees = _fees;
    }

    function pause() external onlyEarnManager {
        _pause();
    }

    function unpause() external onlyEarnManager {
        _unpause();
    }

    function depositETH(
        DepositETHParams calldata params,
        uint256[][] calldata minAmountsOut
    ) external payable {
        require(params.oneInchSwapData.length != 0, "EP: !swapData");

        address weth = wETH;

        IWrappedNative(weth).deposit{value: msg.value}();

        _deposit(
            DepositParams({
                amountTokenIn: msg.value,
                stopLossCost: params.stopLossCost,
                tokenIn: weth,
                oneInchSwapData: params.oneInchSwapData,
                stopLossPercent: params.stopLossPercent
            }),
            true,
            minAmountsOut
        );
    }

    function deposit(
        DepositParams calldata params,
        uint256[][] calldata minAmountsOut
    ) external {
        _deposit(params, false, minAmountsOut);
    }

    function withdraw(
        WithdrawParams calldata params
    ) external returns (uint256 stableReceived) {
        stableReceived = _withdraw(params, msg.sender); // 900

        if (params.oneInchSwapData.length != 0) {
            uint256 stableBalanceBefore = IERC20(stable()).balanceOf(
                address(this)
            ); // 2000

            uint256 balanceBefore = IERC20(params.withdrawalToken).balanceOf(
                address(this)
            );
            _swapViaOneInch(stable(), stableReceived, params.oneInchSwapData); // Swap only 800 and 100 tokens left
            uint256 stableBalanceAfter = IERC20(stable()).balanceOf(
                address(this)
            ); // 1200

            // If 1inch swapped not all stableReceived due calldata
            if (stableReceived > stableBalanceBefore - stableBalanceAfter) {
                IERC20(stable()).safeTransfer(
                    msg.sender,
                    stableReceived - (stableBalanceBefore - stableBalanceAfter)
                );
            }

            uint256 balanceAfter = IERC20(params.withdrawalToken).balanceOf(
                address(this)
            );

            uint256 amountToSend = balanceAfter - balanceBefore;

            if (params.unwrapNative) {
                address weth = wETH;
                require(params.withdrawalToken == weth, "EP: !wt");

                IWrappedNative(weth).withdraw(amountToSend);
                payable(msg.sender).transfer(amountToSend);
            } else {
                IERC20(params.withdrawalToken).safeTransfer(
                    msg.sender,
                    amountToSend
                );
            }
        } else {
            IERC20(stable()).safeTransfer(msg.sender, stableReceived);
        }

        emit Withdraw(
            msg.sender,
            block.timestamp,
            stableReceived,
            positions[msg.sender].size,
            params.stopLossCost
        );
    }

    function closeByStopLoss(
        CloseParams calldata params
    ) external onlyDedicatedMsgSender {
        UserDepositPosition storage userPos = positions[params.user];

        WithdrawParams memory withdrawParams = WithdrawParams({
            withdrawCost: userPos.size,
            minStableOut: params.minStableOut,
            stopLossCost: 0,
            oneInchSwapData: "",
            withdrawalToken: address(0),
            unwrapNative: false
        });

        uint256 reserved = userPos.reservedForAutomation;
        uint256 stableReceived = _withdraw(withdrawParams, params.user);
        require(stableReceived >= params.minStableOut, "!closeByStopLoss");
        uint256 amountToReturn = stableReceived;

        GelatoSwapper swapper = GelatoSwapper(
            EarnConfiguration(earnConfiguration).gelatoSwapper()
        );

        delete userPos.reservedForAutomation;

        address _stable = stable();

        IERC20(_stable).safeTransfer(address(swapper), reserved);
        uint256 receivedForFee = swapper.swap(_stable, 1);

        amountToReturn -= reserved;
        IERC20(_stable).safeTransfer(params.user, amountToReturn);
        emit CloseByStopLoss(
            params.user,
            block.timestamp,
            amountToReturn,
            receivedForFee
        );

        (uint256 fee, address feeToken) = _getFeeDetails();
        require(fee <= receivedForFee, "EP: fee>reserved");
        _transfer(fee, feeToken);

        if (receivedForFee > fee) {
            IERC20(feeToken).safeTransfer(params.user, receivedForFee - fee);
        }
    }

    /**
        @dev designed to be called on-chain as a call
        on a non-view function to be able to precisly calculate
        usd amount of a position. Currently used only in gelator checker
        function that should be called off-chain only using static call
     */
    function getPositionCost(address user) external {
        UserDepositPosition storage userPos = positions[user];

        if (userPos.size == 0) {
            _revertPosCost(0, 0, 0, 0);
        }

        WithdrawParams memory withdrawParams = WithdrawParams({
            withdrawCost: userPos.size,
            minStableOut: 0,
            stopLossCost: 0,
            oneInchSwapData: "",
            withdrawalToken: address(0),
            unwrapNative: false
        });

        uint256 stopLoss = userPos.stopLossCost;
        uint256 reserved = userPos.reservedForAutomation;

        uint256 stableReceived = _withdraw(withdrawParams, user);
        uint256 stableWithoutReserved = stableReceived - reserved;

        PriceAggregator priceAggregator = PriceAggregator(
            EarnConfiguration(earnConfiguration).priceAggregator()
        );

        address stableCached = stable();
        uint256 decimals = IERC20Extended(stableCached).decimals();

        uint256 stableReceivedUsd = _convertStableToUsd(
            priceAggregator,
            stableCached,
            decimals,
            stableReceived
        );

        uint256 stableWithoutReservedUsd = _convertStableToUsd(
            priceAggregator,
            stableCached,
            decimals,
            stableWithoutReserved
        );

        _revertPosCost(
            stableReceivedUsd,
            stableWithoutReservedUsd,
            stableWithoutReserved,
            stopLoss
        );
    }

    function getPositionCost(
        address user,
        uint256 withdrawCost,
        uint256 stopLossCost
    ) external {
        UserDepositPosition storage userPos = positions[user];

        if (userPos.size == 0) {
            revert(string(abi.encode(uint256(0))));
        }

        WithdrawParams memory withdrawParams = WithdrawParams({
            withdrawCost: withdrawCost,
            minStableOut: 0,
            stopLossCost: stopLossCost,
            oneInchSwapData: "",
            withdrawalToken: address(0),
            unwrapNative: false
        });

        uint256 stableReceived = _withdraw(withdrawParams, user);

        revert(string(abi.encode(stableReceived)));
    }

    function vaultDeposited(
        address user,
        address vault
    ) external view returns (uint256) {
        return positions[user].vaultDeposited[vault];
    }

    function userStopLossCost(address user) external view returns (uint256) {
        return positions[user].stopLossCost;
    }

    function stable() public view returns (address) {
        return EarnConfiguration(earnConfiguration).stableToken();
    }

    function getVaultConfigs() public view returns (VaultConfig[] memory) {
        return vaultConfigs;
    }

    function _withdraw(
        WithdrawParams memory params,
        address _user
    ) private returns (uint256 stableReceived) {
        uint256 size = positions[_user].size;
        uint256 toWithdrawReserved;

        require(size != 0, "EP: !pos");
        require(params.withdrawCost <= size, "EP: !withdrawCost");

        // check if we close pos fully
        // or the stop loss is set to 0
        if (size - params.withdrawCost == 0 || params.stopLossCost == 0) {
            _removeUserAutomation(_user);

            toWithdrawReserved = positions[_user].reservedForAutomation;
            delete positions[_user].reservedForAutomation;
        }

        VaultConfig[] memory poolConfigs = getVaultConfigs();

        // what part of a deposited amounts we should withdraw from each pool
        uint256 partToWithdraw = (params.withdrawCost * PERCENTS_100) / size;

        for (uint256 i; i < poolConfigs.length; i++) {
            address vault = poolConfigs[i].vault;
            uint256 depositedToVault = positions[_user].vaultDeposited[vault];

            uint256 amountToWithdraw = (depositedToVault * partToWithdraw) /
                PERCENTS_100;

            positions[_user].vaultDeposited[vault] -= amountToWithdraw;

            address depositHelper = EarnConfiguration(earnConfiguration)
                .lpHelpers(vault);

            require(depositHelper != address(0), "EP: !depositHelper");

            IERC20(vault).safeTransfer(depositHelper, amountToWithdraw);

            stableReceived += LpHelperBase(depositHelper).withdraw(
                vault,
                amountToWithdraw
            );
        }

        require(stableReceived >= params.minStableOut, "EP: !stableReceived");

        // check if we need to fund automation
        // when switching from 0 stop loss to non-zero
        if (
            params.stopLossCost != 0 &&
            positions[_user].reservedForAutomation == 0
        ) {
            _registerUserAutomation(_user);
            uint256 toReserve = EarnConfiguration(earnConfiguration)
                .toReserveForAutomation();
            require(stableReceived > toReserve, "EP: !toReserve");
            positions[_user].reservedForAutomation = toReserve;
            stableReceived -= toReserve;
        }

        stableReceived = _takeWithdrawalFee(stableReceived);
        stableReceived += toWithdrawReserved;

        positions[_user].size -= params.withdrawCost;
        positions[_user].stopLossCost = params.stopLossCost;
    }

    function _deposit(
        DepositParams memory params,
        bool ethDeposit,
        uint256[][] calldata minAmountsOut
    ) internal whenNotPaused {
        EarnConfiguration _configurationCached = EarnConfiguration(
            earnConfiguration
        );

        IERC20 cachedStable = IERC20(stable());
        uint256 stableAmountToDeposit;

        {
            uint256 stableAmountToDepositBefore = cachedStable.balanceOf(
                address(this)
            );

            if (!ethDeposit) {
                IERC20(params.tokenIn).safeTransferFrom(
                    msg.sender,
                    address(this),
                    params.amountTokenIn
                );
            }

            _swapViaOneInch(
                params.tokenIn,
                params.amountTokenIn,
                params.oneInchSwapData
            );

            stableAmountToDeposit =
                cachedStable.balanceOf(address(this)) -
                stableAmountToDepositBefore;

            stableAmountToDeposit = _takeDepositFee(stableAmountToDeposit);
        }

        uint256 toReserveForAutomation = EarnConfiguration(earnConfiguration)
            .toReserveForAutomation();

        UserDepositPosition storage userPos = positions[msg.sender];
        uint256 alreadyReserved = userPos.reservedForAutomation;

        if (params.stopLossCost != 0) {
            _registerUserAutomation(msg.sender);

            if (alreadyReserved == 0) {
                require(
                    stableAmountToDeposit > toReserveForAutomation,
                    "EP: !reserve"
                );
                userPos.reservedForAutomation = toReserveForAutomation;
                stableAmountToDeposit -= toReserveForAutomation;
            }
        } else {
            if (alreadyReserved != 0) {
                // if reserved but stop loss is not set
                // put reserved money to the current deposit
                stableAmountToDeposit += alreadyReserved;
                delete userPos.reservedForAutomation;
            }
        }

        require(stableAmountToDeposit > 0, "EP: !deposit");

        VaultConfig[] memory poolConfigs = getVaultConfigs();

        require(poolConfigs.length > 0, "EP: !configs");

        for (uint256 i; i < poolConfigs.length; i++) {
            uint256[] memory _minAmountsOut = minAmountsOut[i];
            uint256 amountToDeposit = (poolConfigs[i].poolPart *
                stableAmountToDeposit) / PERCENTS_100;

            address depositHelper = _configurationCached.lpHelpers(
                poolConfigs[i].vault
            );

            require(depositHelper != address(0), "EP: !depositHelper");

            IERC20(stable()).safeTransfer(depositHelper, amountToDeposit);

            uint256 deposited = LpHelperBase(depositHelper).deposit(
                poolConfigs[i].vault,
                amountToDeposit,
                _minAmountsOut
            );

            userPos.vaultDeposited[poolConfigs[i].vault] += deposited;
        }

        userPos.size += stableAmountToDeposit;
        userPos.stopLossCost = params.stopLossCost;
        userPos.stopLossPercent = params.stopLossPercent;

        emit Deposit(
            msg.sender,
            block.timestamp,
            stableAmountToDeposit,
            userPos.size,
            params.stopLossCost
        );
    }

    function _swapViaOneInch(
        address _inputToken,
        uint256 _inputAmount,
        bytes memory _callData
    ) private {
        oneInchRouter.swap(_inputToken, _inputAmount, _callData);
    }

    function _takeDepositFee(
        uint256 amountStable
    ) private returns (uint256 _amountFeeExcluded) {
        return _takeFee(amountStable, fees.depositFee);
    }

    function _takeWithdrawalFee(
        uint256 amountStable
    ) private returns (uint256) {
        return _takeFee(amountStable, fees.withdrawalFee);
    }

    function _takeFee(
        uint256 amountStable,
        uint256 feePercent
    ) private returns (uint256 _amountFeeExcluded) {
        uint256 fee = (amountStable * feePercent) / PERCENTS_100;
        _amountFeeExcluded = amountStable - fee;

        if (fee != 0) {
            IERC20(stable()).safeTransfer(
                EarnConfiguration(earnConfiguration).feeRecipient(),
                fee
            );
        }
    }

    function _registerUserAutomation(address user) private {
        if (positions[user].automationTaskId != bytes32(0)) return;

        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.RESOLVER;
        moduleData.modules[1] = Module.PROXY;

        moduleData.args[0] = _resolverModuleArg(
            resolver,
            abi.encodeCall(
                EarnPoolChecker(resolver).checkUpkeep,
                (payable(address(this)), user)
            )
        );
        moduleData.args[1] = _proxyModuleArg();

        positions[user].automationTaskId = _createTask(
            address(this),
            abi.encodePacked(this.closeByStopLoss.selector),
            moduleData,
            wETH
        );
    }

    function _removeUserAutomation(address user) private {
        bytes32 taskId = positions[user].automationTaskId;
        if (taskId == bytes32(0)) return;
        _cancelTask(taskId);
        delete positions[user].automationTaskId;
    }

    function _convertStableToUsd(
        PriceAggregator _priceAggregator,
        address _stable,
        uint256 _stableDecimals,
        uint256 _amount
    ) private view returns (uint256) {
        return
            (_priceAggregator.getPrice(_stable) *
                _amount.convertToBase18(_stableDecimals)) / 1e18;
    }

    function _validateFees(Fees calldata _fees) private pure {
        require(_fees.depositFee < MAX_DEPOSIT_FEE, "EP: !depFee");
        require(_fees.withdrawalFee < MAX_WITHDRAWAL_FEE, "EP: !wFee");
    }

    function _revertPosCost(
        uint256 stableReceivedUsd,
        uint256 stableWithoutReservedUsd,
        uint256 stableWithoutReserved,
        uint256 stopLoss
    ) private pure {
        revert(
            string(
                abi.encodePacked(
                    stableReceivedUsd,
                    stableWithoutReservedUsd,
                    stableWithoutReserved,
                    stopLoss
                )
            )
        );
    }
}
