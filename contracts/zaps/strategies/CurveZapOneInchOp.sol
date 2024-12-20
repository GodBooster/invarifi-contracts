// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import {BaseZapOneInch} from "../base/BaseZapOneInch.sol";
import {WantTypeCurveParams} from "../structs/BeefInParams/WantTypeCurveParams.sol";
import {WantTypeCurveOutParams} from "../structs/BeefOutParams/WantTypeCurveOutParams.sol";
import {StrategyCurveLPUniV3Router} from "../../strategies/Curve/StrategyCurveLPUniV3Router.sol";
import {IWrappedNative} from "../../interfaces/common/IWrappedNative.sol";
import {ICurveSwap} from "../../interfaces/curve/ICurveSwap.sol";
import {IVault} from "./../zapInterfaces/IVault.sol";

import "hardhat/console.sol";

contract CurveZapOneInchOp is BaseZapOneInch {
  using SafeERC20 for IVault;
  using SafeERC20 for IERC20;

  constructor(
    address _oneInchRouter,
    address _WETH
  ) BaseZapOneInch(_oneInchRouter, _WETH) {}

  function _beefIn(
    IVault _vault,
    address want,
    address _inputToken,
    uint256,
    uint8,
    bytes calldata data
  ) internal override returns (address[] memory tokens) {
    WantTypeCurveParams memory params = abi.decode(data, (WantTypeCurveParams));
    if (params.inputToken.length != 0) {
      _swapViaOneInch(_inputToken, params.inputToken);
    }
    StrategyCurveLPUniV3Router strategy = StrategyCurveLPUniV3Router(
      payable(_vault.strategy())
    );
    return _addLiquidity(strategy, want);
  }

  function _beefOut(
    IVault _vault,
    address,
    uint256 _withdrawAmount,
    uint8,
    bytes calldata data
  ) internal override returns (address[] memory tokens) {
    WantTypeCurveOutParams memory params = abi.decode(
      data,
      (WantTypeCurveOutParams)
    );
    tokens = _removeCurveLiquidity(
      _vault,
      params.tokenIndex,
      params.token,
      _withdrawAmount
    );
  }

  function _beefOutAndSwap(
    IVault _vault,
    address,
    address,
    uint256 _withdrawAmount,
    uint8,
    bytes calldata data
  ) internal override returns (address[] memory tokens) {
    WantTypeCurveOutParams memory params = abi.decode(
      data,
      (WantTypeCurveOutParams)
    );
    tokens = _removeCurveLiquidity(
      _vault,
      params.tokenIndex,
      params.token,
      _withdrawAmount
    );
    _swapViaOneInch(tokens[0], params.inputToken);
  }

  function _addLiquidity(
    StrategyCurveLPUniV3Router strategy,
    address want
  ) private returns (address[] memory) {
    uint256 depositBal;
    bool depositNative = strategy.depositNative();
    address deposit = strategy.depositToken();
    address native = strategy.native();
    uint256 depositNativeAmount;
    uint256 nativeBal = IERC20(native).balanceOf(address(this));

    if (deposit != native) {
      depositBal = IERC20(deposit).balanceOf(address(this));
    } else {
      depositBal = nativeBal;
      if (depositNative) {
        depositNativeAmount = nativeBal;
        IWrappedNative(native).withdraw(depositNativeAmount);
      }
    }

    uint256 poolSize = strategy.poolSize();
    uint256 depositIndex = strategy.depositIndex();
    bool useUnderlying = strategy.useUnderlying();
    address pool = strategy.pool();
    bool useMetapool = strategy.useMetapool();

    _approveTokenIfNeeded(deposit, pool);

    if (poolSize == 2) {
      uint256[2] memory amounts;
      amounts[depositIndex] = depositBal;
      if (useUnderlying) {
        ICurveSwap(pool).add_liquidity(amounts, 0, true);
      } else {
        console.log("DEPOSIT_NATIVE_AMOUNT", depositNativeAmount);
        console.log("DEPOSIT_BAL", depositBal);
        console.log("pool", pool);
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
  }

  function _removeCurveLiquidity(
    IVault vault,
    uint256 tokenIndex,
    address token,
    uint256 withdrawAmount
  ) private returns (address[] memory tokens) {
    tokens = new address[](1);
    tokens[0] = token;

    StrategyCurveLPUniV3Router strategy = StrategyCurveLPUniV3Router(
      payable(vault.strategy())
    );

    console.log("WITHDRAW_AMOUNT", withdrawAmount);
    console.log("TOKEN_INDEX", tokenIndex);
    console.log("WANT", strategy.want());
    console.log(
      "TOKEN",
      ICurveSwap(ICurveSwap(strategy.want()).coins(tokenIndex)).coins(
        tokenIndex
      )
    );
    console.log(
      "BALANCE TOKEN BEFORE",
      IERC20(
        ICurveSwap(ICurveSwap(strategy.want()).coins(tokenIndex)).coins(
          tokenIndex
        )
      ).balanceOf(address(this))
    );

    console.log(IERC20(strategy.want()).balanceOf(address(this)));

    uint256 received = ICurveSwap(strategy.want()).remove_liquidity_one_coin(
      withdrawAmount,
      int128(uint128(tokenIndex)),
      0,
      address(this)
    );

    if (strategy.poolSize() > 2) {
      ICurveSwap(ICurveSwap(strategy.want()).coins(1))
        .remove_liquidity_one_coin(
          received,
          int128(uint128(tokenIndex)),
          0,
          address(this)
        );
    }

    console.log(
      "BALANCE TOKEN AFTEr",
      IERC20(ICurveSwap(ICurveSwap(strategy.want()).coins(1)).coins(1))
        .balanceOf(address(this))
    );

    console.log("SWAPPED");
  }
}
