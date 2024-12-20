// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../strategies/Curve/StrategyConvex.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";
import "../../strategies/Curve/StrategyConvex.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

contract CurveLpHelper is LpHelperBase {
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

        swapTokens[0] = StrategyConvex(payable(strategy)).depositToken();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyConvex strategyConvex = StrategyConvex(payable(strategy));

        address native = strategyConvex.native();

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        uint256 depositBal = _swapFromStable(
            swapTokens[0],
            amount,
            minAmountsOut[0]
        );

        uint256 depositNativeAmount;

        if (strategyConvex.depositNative()) {
            IWrappedNative(native).withdraw(depositBal);
        }

        uint256 poolSize = strategyConvex.poolSize();
        address pool = strategyConvex.pool();
        address zap = strategyConvex.zap();
        uint256 depositIndex = strategyConvex.depositIndex();
        bool useUnderlying = strategyConvex.useUnderlying();

        IERC20(swapTokens[0]).approveIfNeeded(pool);
        IERC20(swapTokens[0]).approveIfNeeded(zap);

        if (poolSize == 2) {
            uint256[2] memory amounts;
            amounts[depositIndex] = depositBal;

            if (useUnderlying) ICurveSwap(pool).add_liquidity(amounts, 0, true);
            else
                ICurveSwap(pool).add_liquidity{value: depositNativeAmount}(
                    amounts,
                    0
                );
        } else if (poolSize == 3) {
            uint256[3] memory amounts;
            amounts[depositIndex] = depositBal;

            if (useUnderlying) ICurveSwap(pool).add_liquidity(amounts, 0, true);
            else if (zap != address(0))
                ICurveSwap(zap).add_liquidity{value: depositNativeAmount}(
                    pool,
                    amounts,
                    0
                );
            else
                ICurveSwap(pool).add_liquidity{value: depositNativeAmount}(
                    amounts,
                    0
                );
        } else if (poolSize == 4) {
            uint256[4] memory amounts;
            amounts[depositIndex] = depositBal;

            if (zap != address(0))
                ICurveSwap(zap).add_liquidity(pool, amounts, 0);
            else ICurveSwap(pool).add_liquidity(amounts, 0);
        } else if (poolSize == 5) {
            uint256[5] memory amounts;
            amounts[depositIndex] = depositBal;

            if (zap != address(0))
                ICurveSwap(zap).add_liquidity(pool, amounts, 0);
            else ICurveSwap(pool).add_liquidity(amounts, 0);
        }

        return IERC20(strategyConvex.want()).balanceOf(address(this));
    }

    function _destroyLp(
        address,
        address _strategy,
        address,
        uint256 amount
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        StrategyConvex strategy = StrategyConvex(payable(_strategy));

        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);
        lpTokens[0] = strategy.depositToken();

        address pool = strategy.pool();
        address zap = strategy.zap();

        if (zap != address(0)) {
            if (IERC20(pool).allowance(address(this), zap) == 0) {
                IERC20(pool).safeApprove(zap, type(uint).max);
            }
            int128 depositIndex = int128(uint128(strategy.depositIndex()));
            ICurveSwap(zap).remove_liquidity_one_coin(
                pool,
                amount,
                depositIndex,
                0,
                address(this)
            );
        } else {
            uint256 depositIndex = strategy.depositIndex();
            ICurveSwap(pool).remove_liquidity_one_coin(
                amount,
                depositIndex,
                0,
                false
            );
        }

        lpTokenAmounts = new uint256[](1);
        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
    }

    receive() external payable {}
}
