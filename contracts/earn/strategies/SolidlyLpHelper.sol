// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../interfaces/common/ISolidlyPair.sol";
import "../../interfaces/common/ISolidlyRouter.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";
import "../../strategies/Common/StrategyCommonSolidlyStakerLP.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

contract SolidlyLpHelper is LpHelperBase {
    using ERC20Helpers for IERC20;
    using SafeERC20 for IERC20;

    constructor(
        address _poolConfiguration,
        address _uniswapV3Router,
        address _ac
    ) LpHelperBase(_poolConfiguration, _uniswapV3Router, _ac) {}

    function _buildLpSwaps(
        address,
        address,
        address lp,
        uint256 amount
    )
        public
        view
        virtual
        override
        returns (address[] memory swapTokens, uint256[] memory swapTokenAmount)
    {
        swapTokens = new address[](2);
        swapTokenAmount = new uint256[](2);

        ISolidlyPair pair = ISolidlyPair(lp);

        swapTokens[0] = pair.token0();
        swapTokens[1] = pair.token1();

        swapTokenAmount[0] = amount / 2;
        swapTokenAmount[1] = amount - swapTokenAmount[0];
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        ISolidlyPair pair = ISolidlyPair(lp);
        address router = IStrategyV7(strategy).unirouter();
        bool stable = StrategyCommonSolidlyStakerLP(strategy).stable();

        require(!stable, "SLH: !stable");

        (
            address[] memory swapTokens,
            uint256[] memory swapAmounts
        ) = _buildLpSwaps(vault, strategy, lp, amount);

        uint256 lp0Amt = _swapFromStable(
            swapTokens[0],
            swapAmounts[0],
            minAmountsOut[0]
        );
        uint256 lp1Amt = _swapFromStable(
            swapTokens[1],
            swapAmounts[1],
            minAmountsOut[1]
        );

        IERC20(swapTokens[0]).approveIfNeeded(router);
        IERC20(swapTokens[1]).approveIfNeeded(router);

        (, , uint256 liquidity) = ISolidlyRouter(router).addLiquidity(
            swapTokens[0],
            swapTokens[1],
            stable,
            lp0Amt,
            lp1Amt,
            1,
            1,
            address(this),
            block.timestamp
        );

        return liquidity;
    }

    function _destroyLp(
        address,
        address,
        address lp,
        uint256
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        lpTokens = new address[](2);
        lpTokenAmounts = new uint256[](2);

        ISolidlyPair pair = ISolidlyPair(lp);
        IERC20(lp).safeTransfer(lp, IERC20(lp).balanceOf(address(this)));

        (uint a0, uint a1) = pair.burn(address(this));

        lpTokens[0] = pair.token0();
        lpTokens[1] = pair.token1();

        lpTokenAmounts[0] = uint256(a0);
        lpTokenAmounts[1] = uint256(a1);
    }
}
