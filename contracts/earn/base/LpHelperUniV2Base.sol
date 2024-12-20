// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";
import {EarnConfiguration} from "../EarnConfiguration.sol";
import {ERC20Helpers} from "../libraries/ERC20Helpers.sol";
import {UniswapV2Utils} from "../../utils/UniswapV2Utils.sol";
import {LpHelperBase} from "./LpHelperBase.sol";

abstract contract LpHelperUniV2Base is LpHelperBase {
  using ERC20Helpers for IERC20;

  function _swap(
    address _tokenFrom,
    address _tokenTo,
    uint256 _amountIn,
    address _receiver
  ) internal virtual override returns (uint256 amountOut) {
    bytes memory swapPath = EarnConfiguration(earnConfiguration).swapPathes(
      _tokenFrom,
      _tokenTo
    );

    address[] memory path = abi.decode(swapPath, (address[]));

    IERC20(_tokenFrom).approveIfNeeded(uniswapV3Router);

    amountOut = UniswapV2Utils.swap(
      uniswapV3Router,
      path,
      _amountIn,
      _receiver
    );
  }
}
