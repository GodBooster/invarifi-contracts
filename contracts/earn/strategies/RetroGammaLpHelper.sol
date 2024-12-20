// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/LpHelperBase.sol";
import "../../strategies/Gamma/StrategyRetroGamma.sol";

import "hardhat/console.sol";

contract RetroGammaLpHelper is LpHelperBase {
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

        swapTokens[0] = StrategyRetroGamma(strategy).native();
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyRetroGamma strategyRetro = StrategyRetroGamma(strategy);

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        _swapFromStable(swapTokens[0], amount, minAmountsOut[0]);

        address unirouter = strategyRetro.unirouter();

        IERC20(strategyRetro.native()).approveIfNeeded(unirouter);

        address lpToken0 = strategyRetro.lpToken0();
        address lpToken1 = strategyRetro.lpToken1();

        (uint toLp0, uint toLp1) = strategyRetro.quoteAddLiquidity(
            address(this)
        );

        bytes memory nativeToLp0Path = strategyRetro.nativeToLp0Path();
        bytes memory nativeToLp1Path = strategyRetro.nativeToLp1Path();

        if (nativeToLp0Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(
                unirouter,
                strategyRetro.nativeToLp0Path(),
                toLp0
            );
        }
        if (nativeToLp1Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(
                unirouter,
                strategyRetro.nativeToLp1Path(),
                toLp1
            );
        }

        uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));

        (uint amount1Start, uint amount1End) = strategyRetro
            .gammaProxy()
            .getDepositAmount(strategyRetro.want(), lpToken0, lp0Bal);
        if (lp1Bal > amount1End) {
            lp1Bal = amount1End;
        } else if (lp1Bal < amount1Start) {
            (, lp0Bal) = strategyRetro.gammaProxy().getDepositAmount(
                strategyRetro.want(),
                lpToken1,
                lp1Bal
            );
        }

        uint[4] memory minIn;

        IERC20(lpToken0).approveIfNeeded(strategyRetro.want());
        IERC20(lpToken1).approveIfNeeded(strategyRetro.want());

        StrategyRetroGamma strategyRetroCopy = strategyRetro;

        return
            strategyRetroCopy.gammaProxy().deposit(
                lp0Bal,
                lp1Bal,
                address(this),
                strategyRetroCopy.want(),
                minIn
            );
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
        StrategyRetroGamma strategyRetro = StrategyRetroGamma(strategy);
        address router = strategyRetro.unirouter();

        // IERC20(lp).approveIfNeededLp(router);

        uint256[4] memory minAmounts;

        IHypervisor(strategyRetro.want()).withdraw(
            amount,
            address(this),
            address(this),
            minAmounts
        );

        lpTokens = new address[](2);
        lpTokenAmounts = new uint256[](2);

        lpTokens[0] = strategyRetro.lpToken0();
        lpTokens[1] = strategyRetro.lpToken1();
        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
        lpTokenAmounts[1] = IERC20(lpTokens[1]).balanceOf(address(this));
    }
}
