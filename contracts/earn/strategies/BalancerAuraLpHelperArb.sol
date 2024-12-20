// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/LpHelperBase.sol";
import "../../strategies/Balancer/StrategyAuraSideChain.sol";
import "../../interfaces/beethovenx/IBalancerComposablePool.sol";

contract BalancerAuraLpHelperArb is LpHelperBase {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;

    constructor(
        address _poolConfiguration,
        address _uniswapV3Router,
        address _ac
    ) LpHelperBase(_poolConfiguration, _uniswapV3Router, _ac) {}

    function _buildLpSwaps(
        address,
        address strategy,
        address,
        uint256 amount
    )
        public
        view
        virtual
        override
        returns (address[] memory swapTokens, uint256[] memory swapTokenAmount)
    {
        swapTokens = new address[](1);
        swapTokenAmount = new uint256[](1);

        swapTokens[0] = StrategyAuraSideChain(strategy).native();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyAuraSideChain auraStrategy = StrategyAuraSideChain(strategy);

        address router = auraStrategy.unirouter();

        IERC20(stable()).approveIfNeeded(router);

        address input = auraStrategy.getInputAddress();
        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );
        uint256 amountIn = _swapFromStable(
            swapTokens[0],
            amount,
            minAmountsOut[0]
        );
        IERC20(swapTokens[0]).approveIfNeeded(router);

        if (swapTokens[0] != input) {
            uint256 nativeBalance = IERC20(swapTokens[0]).balanceOf(
                address(this)
            );
            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(
                    auraStrategy.getNativeToInputRoute(),
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
                router,
                auraStrategy.getSwapKind(),
                _swaps,
                auraStrategy.getNativeToInputAssets(),
                funds,
                int256(nativeBalance)
            ); // swap wETH to btp (balancer lp token)
        }

        if (auraStrategy.want() != input) {
            uint256 inputBal = IERC20(input).balanceOf(address(this));
            // add liquidity
            IERC20(input).approveIfNeeded(router);
            BalancerActionsLib.balancerJoin(
                router,
                IBalancerPool(auraStrategy.want()).getPoolId(),
                input,
                inputBal
            );
        }

        return IERC20(auraStrategy.want()).balanceOf(address(this));
    }

    function _destroyLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        address balancerRouter = StrategyAuraSideChain(strategy).unirouter();

        IERC20(lp).approveIfNeededLp(balancerRouter);

        // remove liquidity
        BalancerActionsLib.balancerExit(
            balancerRouter,
            IBalancerComposablePool(lp).getPoolId(),
            0,
            amount
        );

        bytes32 poolId = IBalancerComposablePool(lp).getPoolId();

        (address[] memory tokens, , ) = IBalancerVault(balancerRouter)
            .getPoolTokens(poolId);

        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);

        if (tokens[0] == lp) {
            lpTokens[0] = tokens[1];
            lpTokenAmounts[0] = IERC20(tokens[1]).balanceOf(address(this));
        } else {
            lpTokens[0] = tokens[0];
            lpTokenAmounts[0] = IERC20(tokens[0]).balanceOf(address(this));
        }
    }
}
