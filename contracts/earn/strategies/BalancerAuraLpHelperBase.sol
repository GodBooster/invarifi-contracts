// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {LpHelperBase} from "../base/LpHelperBase.sol";
import "./BalancerAuraLpHelperArb.sol";
import "../../utils/UniswapV3UtilsWithoutDeadline.sol";

contract BalancerAuraLpHelperBase is BalancerAuraLpHelperArb {
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
  ) internal virtual override(LpHelperBase) returns (uint256 amountOut) {
    bytes memory swapPath = EarnConfiguration(earnConfiguration).swapPathes(
      _tokenFrom,
      _tokenTo
    );

    IERC20(_tokenFrom).approveIfNeeded(uniswapV3Router);

    amountOut = UniswapV3UtilsWithoutDeadline.swap(
      uniswapV3Router,
      swapPath,
      _amountIn,
      _receiver
    );
  }
}
