// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

library UniswapV2Utils {
  function swap(
    address _router,
    address[] memory _path,
    uint256 _amountIn
  ) internal returns (uint256) {
    return swap(_router, _path, _amountIn, address(this));
  }

  function swap(
    address _router,
    address[] memory _path,
    uint256 _amountIn,
    address _receiver
  ) internal returns (uint256 amountOut) {
    uint256[] memory amounts = IUniswapV2Router02(_router).swapExactTokensForTokens(
      _amountIn,
      1,
      _path,
      _receiver,
      block.timestamp
    );
    amountOut = amounts.length == 0 ? 0 : amounts[amounts.length - 1];
  }
}