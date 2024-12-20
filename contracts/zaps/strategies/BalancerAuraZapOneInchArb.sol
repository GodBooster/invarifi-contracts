// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/BaseZapOneInch.sol";
import "../../interfaces/beethovenx/IBalancerVault.sol";
import "../../strategies/Balancer/StrategyAuraSideChain.sol";
import "../structs/BeefInParams/WantTypeBalancerAuraParams.sol";
import "../structs/BeefOutParams/WantTypeBalancerAuraOutParams.sol";

import "hardhat/console.sol";

contract BalancerAuraZapOneInchArb is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address,
        address _inputToken,
        uint256,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        StrategyAuraSideChain strategy = StrategyAuraSideChain(
            _vault.strategy()
        );

        WantTypeBalancerAuraParams memory params = abi.decode(
            data,
            (WantTypeBalancerAuraParams)
        );

        address native = strategy.native();

        // Todo change to normal tokens
        tokens = new address[](2);
        tokens[0] = _inputToken;
        tokens[1] = native;

        // swap token to wETH
        _swapViaOneInch(_inputToken, params.inputToken);

        address balancerRouter = strategy.unirouter();

        _approveTokenIfNeeded(tokens[1], balancerRouter);

        address input = strategy.getInputAddress();

        if (native != input) {
            _approveTokenIfNeeded(native, balancerRouter);

            uint256 nativeBalance = IERC20(tokens[1]).balanceOf(address(this));
            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(
                    strategy.getNativeToInputRoute(),
                    nativeBalance
                );
            IBalancerVault.FundManagement memory funds = IBalancerVault
                .FundManagement(
                    address(this),
                    false,
                    payable(address(this)),
                    false
                );
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategy.getSwapKind(),
                _swaps,
                strategy.getNativeToInputAssets(),
                funds,
                int256(nativeBalance)
            ); // swap wETH to btp (balancer lp token)
        }

        if (input != strategy.want()) {
            uint256 inputBal = IERC20(input).balanceOf(address(this));
            BalancerActionsLib.balancerJoin(
                balancerRouter,
                IBalancerPool(strategy.want()).getPoolId(),
                input,
                inputBal
            );
        }
    }

    function _beefOut(
        IVault _vault,
        address want,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantTypeBalancerAuraOutParams memory params = abi.decode(
            data,
            (WantTypeBalancerAuraOutParams)
        );

        return
            _removeLiquidity(
                _vault,
                _withdrawAmount,
                want,
                params.tokenIndexRoute
            );
    }

    function _beefOutAndSwap(
        IVault _vault,
        address want,
        address,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantTypeBalancerAuraOutParams memory params = abi.decode(
            data,
            (WantTypeBalancerAuraOutParams)
        );

        tokens = _removeLiquidity(
            _vault,
            _withdrawAmount,
            want,
            params.tokenIndexRoute
        );

        _swapViaOneInch(params.tokenOut, params.inputToken);
    }

    function _removeLiquidity(
        IVault vault,
        uint256 withdrawAmount,
        address want,
        uint256 tokenIndexRoute
    ) private returns (address[] memory tokens) {
        address balancerRouter = StrategyAuraSideChain(vault.strategy())
            .unirouter();

        _approveTokenIfNeeded(want, address(balancerRouter));

        // remove liquidity
        BalancerActionsLib.balancerExit(
            balancerRouter,
            IBalancerPool(want).getPoolId(),
            tokenIndexRoute,
            withdrawAmount
        );

        bytes32 poolId = IBalancerPool(want).getPoolId();

        (tokens, , ) = IBalancerVault(balancerRouter).getPoolTokens(poolId);
    }
}
