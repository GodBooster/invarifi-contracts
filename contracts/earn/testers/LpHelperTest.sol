// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "../base/LpHelperBase.sol";
import "hardhat/console.sol";

contract LpHelperTest is LpHelperBase {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;

    constructor(
        address _poolConfiguration,
        address _uniswapV3Router,
        address _ac
    ) LpHelperBase(_poolConfiguration, _uniswapV3Router, _ac) {}

    function _buildLpSwaps(
        address vault,
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

        swapTokens[0] = lp;
        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        return _swapFromStable(swapTokens[0], amount, minAmountsOut[0]);
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
        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);

        lpTokens[0] = lp;
        lpTokenAmounts[0] = amount;
    }
}
