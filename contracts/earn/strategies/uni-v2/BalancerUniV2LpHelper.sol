// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {LpHelperUniV2BaseBase} from "../../base/LpHelperUniV2BaseBase.sol";
import "../BalancerAuraLpHelperArb.sol";

contract BalancerUniV2LpHelper is BalancerAuraLpHelperArb, LpHelperUniV2BaseBase {
  using SafeERC20 for IERC20;
  using ERC20Helpers for IERC20;

  constructor(
    address _earnConfiguration,
    address _uniswapV2Router,
    address _ac
  ) BalancerAuraLpHelperArb(_earnConfiguration, _uniswapV2Router, _ac) {}

  function _swap(
    address _tokenFrom,
    address _tokenTo,
    uint256 _amountIn,
    address _receiver
  )
    internal
    virtual
    override(LpHelperUniV2BaseBase, LpHelperBase)
    returns (uint256)
  {
    return LpHelperUniV2BaseBase._swap(_tokenFrom, _tokenTo, _amountIn, _receiver);
  }
}
