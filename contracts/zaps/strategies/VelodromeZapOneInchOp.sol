// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/BaseZapOneInch.sol";
import "../../strategies/Velodrome/StrategyCommonVelodromeGaugeV2.sol";
import "../structs/BeefOutParams/WantTypeBaseOutParams.sol";

contract VelodromeZapOneInchOp is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address,
        address tokenIn,
        uint256,
        uint8,
        bytes calldata _swapData
    ) internal override returns (address[] memory tokens) {
        if (_swapData.length != 0) {
            _swapViaOneInch(tokenIn, _swapData);
        }

        StrategyCommonVelodromeGaugeV2 strategy = StrategyCommonVelodromeGaugeV2(
                _vault.strategy()
            );

        address output = strategy.output();
        address lpToken0 = strategy.lpToken0();
        address lpToken1 = strategy.lpToken1();

        console.log("LPTOKEN0", lpToken0);
        console.log("LPTOKEN1", lpToken1);
        console.log("OUTPUT", output);
        address unirouter = strategy.unirouter();

        uint256 outputBal = IERC20(output).balanceOf(address(this));
        console.log("OUTPUT BAL", outputBal);
        uint256 lp0Amt = outputBal / 2;
        uint256 lp1Amt = outputBal - lp0Amt;

        StrategyCommonVelodromeGaugeV2 strategyCopy = StrategyCommonVelodromeGaugeV2(
                address(strategy)
            );

        _approveTokenIfNeeded(output, unirouter);
        _approveTokenIfNeeded(lpToken0, unirouter);
        _approveTokenIfNeeded(lpToken1, unirouter);

        if (strategy.stable()) {
            uint256 lp0Decimals = 10 ** IERC20Extended(lpToken0).decimals();
            uint256 lp1Decimals = 10 ** IERC20Extended(lpToken1).decimals();
            uint256 out0 = lpToken0 != output
                ? (ISolidlyRouter(unirouter).getAmountsOut(
                    lp0Amt,
                    strategy.getOutputToLp0Route()
                )[strategy.getOutputToLp0Route().length] * 1e18) / lp0Decimals
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

        _approveTokenIfNeeded(lpToken0, unirouter);
        _approveTokenIfNeeded(lpToken1, unirouter);

        ISolidlyRouter(unirouter).addLiquidity(
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

        tokens = new address[](2);
        tokens[0] = lpToken0;
        tokens[1] = lpToken1;
    }

    function _beefOut(
        IVault _vault,
        address _want,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata
    ) internal override returns (address[] memory tokens) {
        tokens = _beefOutVelodrome(_vault, _want);
    }

    function _beefOutAndSwap(
        IVault _vault,
        address _want,
        address _desiredToken,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata swapData
    ) internal override returns (address[] memory path) {
        WantTypeBaseOutParams memory params = abi.decode(
            swapData,
            (WantTypeBaseOutParams)
        );
        path = _beefOutVelodrome(_vault, _want);

        if (params.token0.length != 0) {
            _swapViaOneInch(path[0], params.token0);
        }

        if (params.token1.length != 0) {
            _swapViaOneInch(path[1], params.token1);
        }
    }

    function _beefOutVelodrome(
        IVault _vault,
        address _want
    ) internal returns (address[] memory tokens) {
        StrategyCommonVelodromeGaugeV2 strategy = StrategyCommonVelodromeGaugeV2(
                _vault.strategy()
            );

        _approveTokenIfNeeded(_want, strategy.unirouter());

        ISolidlyRouter(strategy.unirouter()).removeLiquidity(
            strategy.lpToken0(),
            strategy.lpToken1(),
            strategy.stable(),
            IERC20(_want).balanceOf(address(this)),
            1,
            1,
            address(this),
            block.timestamp
        );

        tokens = new address[](2);
        tokens[0] = strategy.lpToken0();
        tokens[1] = strategy.lpToken1();
    }
}
