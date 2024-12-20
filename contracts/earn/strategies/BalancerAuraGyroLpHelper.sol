// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../interfaces/beethovenx/IBalancerComposablePool.sol";
import "../../interfaces/beethovenx/IBalancerVault.sol";
import "../../interfaces/gmx/IVault.sol";
import "../../strategies/Balancer/BalancerActionsLib.sol";
import "../../strategies/Balancer/StrategyAuraGyroMainnet.sol";
import "../base/LpHelperBase.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

contract BalancerAuraGyroLpHelper is LpHelperBase {
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

        swapTokens[0] = StrategyAuraGyroMainnet(strategy).getNative();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyAuraGyroMainnet strategyGyro = StrategyAuraGyroMainnet(
            strategy
        );

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        address balancerRouter = strategyGyro.getUniRouter();

        uint256 nativeBal = _swapFromStable(
            swapTokens[0],
            amount,
            minAmountsOut[0]
        );

        bytes32 poolId = IBalancerPool(strategyGyro.getWant()).getPoolId();
        (address[] memory lpTokens, , ) = IBalancerVault(balancerRouter)
            .getPoolTokens(poolId);

        IBalancerVault.FundManagement memory funds = IBalancerVault
            .FundManagement(
                address(this),
                false,
                payable(address(this)),
                false
            );

        if (lpTokens[0] != swapTokens[0]) {
            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(
                    strategyGyro.getNativeToLp0Route(),
                    nativeBal
                );
            IERC20(swapTokens[0]).approveIfNeeded(balancerRouter);
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategyGyro.swapKind(),
                _swaps,
                strategyGyro.getNativeToLp0Assets(),
                funds,
                int256(nativeBal)
            );
        }

        if (nativeBal > 0) {
            uint256 lp0Bal = IERC20(lpTokens[0]).balanceOf(address(this));
            (uint256 lp0Amt, uint256 lp1Amt) = strategyGyro.calcSwapAmount(
                lp0Bal
            );

            IERC20(lpTokens[0]).approveIfNeeded(balancerRouter);

            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(strategyGyro.getLp0ToLp1Route(), lp1Amt);
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategyGyro.swapKind(),
                _swaps,
                strategyGyro.getLp0ToLp1Assets(),
                funds,
                int256(lp1Amt)
            );

            IERC20(lpTokens[1]).approveIfNeeded(balancerRouter);

            BalancerActionsLib.multiJoin(
                balancerRouter,
                strategyGyro.want(),
                poolId,
                lpTokens[0],
                lpTokens[1],
                lp0Amt,
                IERC20(lpTokens[1]).balanceOf(address(this))
            );
        }

        return IERC20(strategyGyro.getWant()).balanceOf(address(this));
    }

    function _destroyLp(
        address vault,
        address,
        address lp,
        uint256 amount
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        address balancerRouter = StrategyAuraGyroMainnet(
            IVault(vault).strategy()
        ).unirouter();

        IERC20(lp).approveIfNeededLp(balancerRouter);

        // remove liquidity
        BalancerActionsLib.balancerExitGyro(
            balancerRouter,
            IBalancerPool(lp).getPoolId(),
            amount
        );

        bytes32 poolId = IBalancerComposablePool(lp).getPoolId();

        (address[] memory tokens, , ) = IBalancerVault(balancerRouter)
            .getPoolTokens(poolId);

        lpTokens = new address[](tokens.length);
        lpTokenAmounts = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            lpTokens[i] = tokens[i];
            lpTokenAmounts[i] = IERC20(tokens[i]).balanceOf(address(this));
        }
    }
}
