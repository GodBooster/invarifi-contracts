// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Route {
  address from;
  address to;
  bool stable;
  address factory;
}

interface IAerodromeRouter {
  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    Route[] calldata routes,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts);

  function poolFor(
    address tokenA,
    address tokenB,
    bool stable,
    address _factory
  ) external view returns (address pool);
}
