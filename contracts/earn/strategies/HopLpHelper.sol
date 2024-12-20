// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../strategies/Curve/StrategyConvex.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";
import "../../strategies/Hop/StrategyHop.sol";
import "../../interfaces/common/IWrappedNative.sol";
import "../../interfaces/stargate/IStargateRouter.sol";
import "../../interfaces/stargate/IStargateRouterETH.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

contract HopLpHelper is LpHelperBase {
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

        swapTokens[0] = StrategyHop(payable(strategy)).depositToken();

        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyHop strat = StrategyHop(payable(strategy));

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        uint bal = _swapFromStable(swapTokens[0], amount, minAmountsOut[0]);

        address router = strat.stableRouter();
        uint256 depositIndex = strat.depositIndex();

        uint256[] memory inputs = new uint256[](2);
        inputs[depositIndex] = bal;

        IERC20(swapTokens[0]).approveIfNeeded(router);

        return IStableRouter(router).addLiquidity(inputs, 1, block.timestamp);
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
        StrategyHop strat = StrategyHop(payable(strategy));

        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);
        lpTokens[0] = strat.depositToken();
        address router = strat.stableRouter();

        IERC20(lp).approveIfNeeded(router);

        IStableRouter(router).removeLiquidityOneToken(
            amount,
            uint8(strat.depositIndex()),
            1,
            block.timestamp
        );

        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
    }

    receive() external payable {}
}
