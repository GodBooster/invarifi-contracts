// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import {BaseZapOneInch} from "../base/BaseZapOneInch.sol";
import {IVault} from "./../zapInterfaces/IVault.sol";
import {WantTypeBaseSwapParams} from "../structs/BeefInParams/WantTypeBaseSwapParams.sol";
import {WantTypeBaseSwapOutParams} from "../structs/BeefOutParams/WantTypeBaseSwapOutParams.sol";
import {StrategyBaseSwap} from "../../strategies/BaseSwap/StrategyBaseSwap.sol";
import {IUniswapRouterETH} from "../../interfaces/common/IUniswapRouterETH.sol";

contract BaseSwapZapOneInchBase is BaseZapOneInch {
  using SafeERC20 for IVault;
  using SafeERC20 for IERC20;

  constructor(
    address _oneInchRouter,
    address _WETH
  ) BaseZapOneInch(_oneInchRouter, _WETH) {}

  function _beefIn(
    IVault _vault,
    address,
    address _inputToken,
    uint256,
    uint8,
    bytes calldata data
  ) internal override returns (address[] memory tokens) {
    WantTypeBaseSwapParams memory params = abi.decode(data, (WantTypeBaseSwapParams));

    if (params.inputToken.length != 0) {
      _swapViaOneInch(_inputToken, params.inputToken);
    }

    StrategyBaseSwap strategy = StrategyBaseSwap(payable(_vault.strategy()));

    address lpToken0 = strategy.lpToken0();
    address lpToken1 = strategy.lpToken1();
    tokens = _addLiquidity(strategy, lpToken0, lpToken1);
  }

  function _beefOut(
    IVault _vault,
    address,
    uint256 _withdrawAmount,
    uint8,
    bytes calldata
  ) internal override returns (address[] memory tokens) {
    tokens = _removeLiquidity(StrategyBaseSwap(payable(_vault.strategy())), _withdrawAmount);
  }

  function _beefOutAndSwap(
    IVault _vault,
    address,
    address,
    uint256 _withdrawAmount,
    uint8,
    bytes calldata data
  ) internal override returns (address[] memory tokens) {
    WantTypeBaseSwapOutParams memory params = abi.decode(data, (WantTypeBaseSwapOutParams));
    tokens = _removeLiquidity(StrategyBaseSwap(payable(_vault.strategy())), _withdrawAmount);
    _swapViaOneInch(tokens[0], params.inputToken0);
    _swapViaOneInch(tokens[1], params.inputToken1);
  }

  function _addLiquidity(
    StrategyBaseSwap strategy,
    address lpToken0,
    address lpToken1
  ) private returns (address[] memory) {
    address native = strategy.native();
    address unirouter = strategy.unirouter();
    address[] memory nativeToLp0Route = strategy.nativeToLp0();
    address[] memory nativeToLp1Route = strategy.nativeToLp1();
  
    uint256 nativeHalf = IERC20(native).balanceOf(address(this)) / 2;
    _approveTokenIfNeeded(native, unirouter);
    if(lpToken0 != native) {
      IUniswapRouterETH(unirouter).swapExactTokensForTokens(
        nativeHalf, 0, nativeToLp0Route, address(this), block.timestamp
      );
    }
    if(lpToken1 != native) {
      IUniswapRouterETH(unirouter).swapExactTokensForTokens(
        nativeHalf, 0, nativeToLp1Route, address(this), block.timestamp
      );
    }


    uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
    uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));
    _approveTokenIfNeeded(lpToken0, unirouter);
    _approveTokenIfNeeded(lpToken1, unirouter);
    IUniswapRouterETH(unirouter).addLiquidity(
      lpToken0, lpToken1, lp0Bal, lp1Bal, 1, 1, address(this), block.timestamp
    );
    address[] memory tokens = new address[](2);
    tokens[0] = lpToken0;
    tokens[1] = lpToken1;
    return tokens;
  }

  function _removeLiquidity(
    StrategyBaseSwap strategy,
    uint256 withdrawAmount
  ) private returns (address[] memory tokens) {
    address lpToken0 = strategy.lpToken0();
    address lpToken1 = strategy.lpToken1();
    address unirouter = strategy.unirouter();
    address want = strategy.want();
    _approveTokenIfNeeded(want, unirouter);
    IUniswapRouterETH(unirouter).removeLiquidity(
      lpToken0, lpToken1, withdrawAmount, 1, 1, address(this), block.timestamp
    );
    tokens = new address[](2);
    tokens[0] = lpToken0;
    tokens[1] = lpToken1;
  }
}