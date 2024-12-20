// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/LpHelperBase.sol";
import "../../strategies/Velodrome/StrategyCommonVelodromeGaugeV2.sol";

contract VelodromeOpLpHelper is LpHelperBase {
    using ERC20Helpers for IERC20;
    using SafeERC20 for IERC20;

    constructor(
        address _poolConfiguration,
        address _uniswapV3Router,
        address _ac
    ) LpHelperBase(_poolConfiguration, _uniswapV3Router, _ac) {}

    function _buildLpSwaps(
        address,
        address strategy,
        address lp,
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

        swapTokens[0] = StrategyCommonVelodromeGaugeV2(strategy).output();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyCommonVelodromeGaugeV2 strategyVelodrome = StrategyCommonVelodromeGaugeV2(
                strategy
            );

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        _swapFromStable(swapTokens[0], amount, minAmountsOut[0]);

        address output = strategyVelodrome.output();
        address lpToken0 = strategyVelodrome.lpToken0();
        address lpToken1 = strategyVelodrome.lpToken1();

        address unirouter = strategyVelodrome.unirouter();

        uint256 outputBal = IERC20(output).balanceOf(address(this));
        uint256 lp0Amt = outputBal / 2;
        uint256 lp1Amt = outputBal - lp0Amt;

        StrategyCommonVelodromeGaugeV2 strategyCopy = StrategyCommonVelodromeGaugeV2(
                address(strategy)
            );

        IERC20(output).approveIfNeeded(unirouter);

        if (strategyVelodrome.stable()) {
            uint256 lp0Decimals = 10 ** IERC20Extended(lpToken0).decimals();
            uint256 lp1Decimals = 10 ** IERC20Extended(lpToken1).decimals();
            uint256 out0 = lpToken0 != output
                ? (ISolidlyRouter(unirouter).getAmountsOut(
                    lp0Amt,
                    strategyCopy.getOutputToLp0Route()
                )[strategyCopy.getOutputToLp0Route().length] * 1e18) /
                    lp0Decimals
                : lp0Amt;
            uint256 out1 = lpToken1 != output
                ? (ISolidlyRouter(unirouter).getAmountsOut(
                    lp1Amt,
                    strategyCopy.getOutputToLp1Route()
                )[strategyCopy.getOutputToLp1Route().length] * 1e18) /
                    lp1Decimals
                : lp1Amt;
            (uint256 amountA, uint256 amountB, ) = ISolidlyRouter(unirouter)
                .quoteAddLiquidity(
                    lpToken0,
                    lpToken1,
                    strategyCopy.stable(),
                    strategyCopy.factory(),
                    out0,
                    out1
                );
            amountA = (amountA * 1e18) / lp0Decimals;
            amountB = (amountB * 1e18) / lp1Decimals;
            uint256 ratio = (((out0 * 1e18) / out1) * amountB) / amountA;
            lp0Amt = (outputBal * 1e18) / (ratio + 1e18);
            lp1Amt = outputBal - lp0Amt;
        }

        {
            if (lpToken0 != output) {
                ISolidlyRouter(unirouter).swapExactTokensForTokens(
                    lp0Amt,
                    0,
                    strategyCopy.getOutputToLp0Route(),
                    address(this),
                    block.timestamp
                );
            }

            if (lpToken1 != output) {
                ISolidlyRouter(unirouter).swapExactTokensForTokens(
                    lp1Amt,
                    0,
                    strategyCopy.getOutputToLp1Route(),
                    address(this),
                    block.timestamp
                );
            }
        }

        uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));

        IERC20(lpToken0).approveIfNeeded(unirouter);
        IERC20(lpToken1).approveIfNeeded(unirouter);

        console.log(lp0Bal);
        console.log(lp1Bal);

        (, , uint256 liquidity) = ISolidlyRouter(unirouter).addLiquidity(
            lpToken0,
            lpToken1,
            strategyCopy.stable(),
            lp0Bal,
            lp1Bal,
            1,
            1,
            address(this),
            block.timestamp
        );

        console.log(IERC20(lpToken0).balanceOf(address(this)));
        console.log(IERC20(lpToken1).balanceOf(address(this)));

        return liquidity;
    }

    function _destroyLp(
        address,
        address strategy,
        address lp,
        uint256 amount
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        StrategyCommonVelodromeGaugeV2 strategyVelodrome = StrategyCommonVelodromeGaugeV2(
                strategy
            );

        console.log("STRATEGY", strategy);

        address router = strategyVelodrome.unirouter();

        address token0 = strategyVelodrome.lpToken0();
        address token1 = strategyVelodrome.lpToken1();

        console.log(token0);
        console.log(token1);

        IERC20(lp).approveIfNeededLp(router);

        ISolidlyRouter(strategyVelodrome.unirouter()).removeLiquidity(
            strategyVelodrome.lpToken0(),
            strategyVelodrome.lpToken1(),
            strategyVelodrome.stable(),
            IERC20(lp).balanceOf(address(this)),
            1,
            1,
            address(this),
            block.timestamp
        );
        lpTokens = new address[](2);
        lpTokenAmounts = new uint256[](2);

        lpTokens[0] = token0;
        lpTokens[1] = token1;
        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
        lpTokenAmounts[1] = IERC20(lpTokens[1]).balanceOf(address(this));

        console.log("TOKEN0", token0);
        console.log("TOKEN1", token1);
        console.log("TOKEN0 BALANCE", lpTokenAmounts[0]);
        console.log("TOKEN1 BALANCE", lpTokenAmounts[1]);
    }
}
