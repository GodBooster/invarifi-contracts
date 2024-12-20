// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {LpHelperBase} from "../base/LpHelperBase.sol";
import {IERC20, SafeERC20} from "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20Helpers} from "../libraries/ERC20Helpers.sol";
import {StrategyCurveLPUniV3Router} from "../../strategies/Curve/StrategyCurveLPUniV3Router.sol";
import {IWrappedNative} from "../../interfaces/common/IWrappedNative.sol";
import {ICurveSwap} from "../../interfaces/curve/ICurveSwap.sol";

import "hardhat/console.sol";

contract CurveOpLpHelper is LpHelperBase {
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

    swapTokens[0] = StrategyCurveLPUniV3Router(payable(strategy))
      .depositToken();
    swapTokenAmount[0] = amount;
  }

  function _buildLp(
    address vault,
    address strategy,
    address lp,
    uint256 amount,
    uint256[] memory minAmountsOut
  ) internal override returns (uint256) {
    StrategyCurveLPUniV3Router strategyCurve = StrategyCurveLPUniV3Router(
      payable(strategy)
    );

    address native = strategyCurve.native();

    (address[] memory swapTokens, ) = _buildLpSwaps(
      vault,
      strategy,
      lp,
      amount
    );

    uint256 depositBal = _swapFromStable(
      swapTokens[0],
      amount,
      minAmountsOut[0]
    );

    bool depositNative = strategyCurve.depositNative();
    uint256 depositNativeAmount;
    uint256 nativeBal = IERC20(native).balanceOf(address(this));

    if (swapTokens[0] != native) {
      depositBal = IERC20(swapTokens[0]).balanceOf(address(this));
    } else {
      depositBal = nativeBal;
      if (depositNative) {
        depositNativeAmount = nativeBal;
        IWrappedNative(native).withdraw(depositNativeAmount);
      }
    }
    uint256 poolSize = strategyCurve.poolSize();
    uint256 depositIndex = strategyCurve.depositIndex();
    bool useUnderlying = strategyCurve.useUnderlying();
    address pool = strategyCurve.pool();
    address want = strategyCurve.want();
    bool useMetapool = strategyCurve.useMetapool();

    IERC20(swapTokens[0]).approveIfNeeded(pool);

    if (poolSize == 2) {
      uint256[2] memory amounts;
      amounts[depositIndex] = depositBal;
      if (useUnderlying) {
        ICurveSwap(pool).add_liquidity(amounts, 0, true);
      } else {
        ICurveSwap(pool).add_liquidity{value: depositNativeAmount}(amounts, 0);
      }
    } else if (poolSize == 3) {
      uint256[3] memory amounts;
      amounts[depositIndex] = depositBal;
      if (useUnderlying) ICurveSwap(pool).add_liquidity(amounts, 0, true);
      else if (useMetapool) ICurveSwap(pool).add_liquidity(want, amounts, 0);
      else ICurveSwap(pool).add_liquidity(amounts, 0);
    } else if (poolSize == 4) {
      uint256[4] memory amounts;
      amounts[depositIndex] = depositBal;
      if (useMetapool) ICurveSwap(pool).add_liquidity(want, amounts, 0);
      else ICurveSwap(pool).add_liquidity(amounts, 0);
    } else if (poolSize == 5) {
      uint256[5] memory amounts;
      amounts[depositIndex] = depositBal;
      ICurveSwap(pool).add_liquidity(amounts, 0);
    }

    return IERC20(want).balanceOf(address(this));
  }

  function _destroyLp(
    address,
    address _strategy,
    address lp,
    uint256 amount
  )
    internal
    override
    returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
  {
    StrategyCurveLPUniV3Router strategy = StrategyCurveLPUniV3Router(
      payable(_strategy)
    );

    address coin = ICurveSwap(lp).coins(0);
    address want = strategy.want();
    address badWeth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 tokenIndex;
    address eligibleCoin;

    if (strategy.poolSize() == 2) {
      (tokenIndex, eligibleCoin) = (
        coin == want || coin == badWeth ? 1 : 0,
        coin == want || coin == badWeth ? ICurveSwap(lp).coins(1) : coin
      );

      ICurveSwap(strategy.want()).remove_liquidity_one_coin(
        amount,
        int128(uint128(tokenIndex)),
        0,
        address(this)
      );
    } else {
      tokenIndex = 1;
      eligibleCoin = ICurveSwap(ICurveSwap(strategy.want()).coins(1)).coins(
        tokenIndex
      );

      uint256 received = ICurveSwap(strategy.want()).remove_liquidity_one_coin(
        amount,
        int128(uint128(tokenIndex)),
        0,
        address(this)
      );
      ICurveSwap(ICurveSwap(strategy.want()).coins(tokenIndex))
        .remove_liquidity_one_coin(
          received,
          int128(uint128(tokenIndex)),
          0,
          address(this)
        );
    }

    lpTokens = new address[](1);
    lpTokenAmounts = new uint256[](1);
    lpTokens[0] = eligibleCoin;
    lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
  }

  receive() external payable {}
}
