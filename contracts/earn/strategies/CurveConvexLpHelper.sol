// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../strategies/Curve/StrategyCurveConvex.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";

contract CurveConvexLpHelper is LpHelperBase {
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

        StrategyCurveConvex strategyCurveConvex = StrategyCurveConvex(
            payable(strategy)
        );

        (address[9] memory route, , ) = strategyCurveConvex
            .depositToWantRoute();

        swapTokens[0] = route[0];
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address,
        address strategy,
        address,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyCurveConvex strategyCurveConvex = StrategyCurveConvex(
            payable(strategy)
        );

        (
            address[9] memory route,
            uint256[3][4] memory swapParams,

        ) = strategyCurveConvex.depositToWantRoute();

        // we dont use _buildLpSwaps here for gas efficiency
        uint bal = _swapFromStable(route[0], amount, minAmountsOut[0]);

        IERC20(route[0]).approveIfNeeded(strategyCurveConvex.curveRouter());

        return
            ICurveRouter(strategyCurveConvex.curveRouter()).exchange_multiple(
                route,
                swapParams,
                bal,
                0
            );
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
        StrategyCurveConvex strategy = StrategyCurveConvex(
            payable(IVault(vault).strategy())
        );

        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);

        lpTokens[0] = ICurveSwap(lp).coins(0);

        ICurveSwap(strategy.want()).remove_liquidity_one_coin(
            amount,
            uint256(0),
            0,
            false,
            address(this)
        );

        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
    }
}
