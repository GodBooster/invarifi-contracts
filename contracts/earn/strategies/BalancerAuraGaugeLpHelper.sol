// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../interfaces/beethovenx/IBalancerComposablePool.sol";
import "../../interfaces/beethovenx/IBalancerVault.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";
import "../../strategies/Balancer/BalancerActionsLib.sol";
import "../../strategies/Balancer/StrategyBalancerMultiRewardGaugeUniV3.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../zaps/zapInterfaces/IBalancerAuraStrategy.sol";

contract BalancerAuraGaugeLpHelper is LpHelperBase {
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

        swapTokens[0] = IBalancerAuraStrategy(strategy).getInputAddress();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        IBalancerAuraStrategy auraStrategy = IBalancerAuraStrategy(strategy);

        address router = auraStrategy.getUniRouter();

        IERC20(stable()).approveIfNeeded(router);

        address input = IBalancerAuraStrategy(strategy).getInputAddress();

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

        if (!auraStrategy.isComposable()) {
            uint256 inputBal = IERC20(input).balanceOf(address(this));
            // add liquidity
            IERC20(input).approveIfNeeded(router);
            BalancerActionsLib.balancerJoin(
                router,
                IBalancerPool(auraStrategy.getWant()).getPoolId(),
                input,
                inputBal
            );
        }

        return IERC20(auraStrategy.getWant()).balanceOf(address(this));
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
        address balancerRouter = StrategyBalancerMultiRewardGaugeUniV3(
            IVault(vault).strategy()
        ).unirouter();

        IERC20(lp).approveIfNeeded(balancerRouter);

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

        lpTokens[0] = tokens[0];
        lpTokenAmounts[0] = IERC20(tokens[0]).balanceOf(address(this));
    }
}
