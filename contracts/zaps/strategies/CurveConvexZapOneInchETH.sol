// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/utils/math/Math.sol";

import "../../interfaces/common/IUniswapRouterETH.sol";
import "../../interfaces/common/IUniswapV2Pair.sol";
import "../../interfaces/common/ISolidlyPair.sol";
import "../../interfaces/common/ISolidlyRouter.sol";
import "../../interfaces/beethovenx/IBalancerVault.sol";
import "../../interfaces/curve/ICurveRouter.sol";
import "../../strategies/Balancer/StrategyAuraMainnet.sol";
import "./../zapInterfaces/IWETH.sol";
import "./../zapInterfaces/IVault.sol";
import "./../zapInterfaces/IZapStrategy.sol";
import "./../zapInterfaces/IERC20Extended.sol";
import "./../structs/BeefInParams/WantTypeBaseParams.sol";
import "./../structs/BeefInParams/WantTypeBalancerAuraParams.sol";
import "./../structs/BeefInParams/WantTypeBalancerAuraGyroParams.sol";
import "./../structs/BeefInParams/WantTypeConvexParams.sol";
import "./../structs/BeefInParams/WantTypeCurveConvexParams.sol";
import "./../structs/BeefOutParams/WantTypeBaseOutParams.sol";
import "./../structs/BeefOutParams/WantTypeSingleGovPoolParams.sol";

import "./../structs/BeefOutParams/WantTypeBalancerAuraOutParams.sol";
import "./../structs/BeefOutParams/WantTypeBalancerAuraGyroOutParams.sol";
import "./../structs/BeefOutParams/WantTypeConvexOutParams.sol";
import "./../structs/BeefOutParams/WantTypeCurveConvexOutParams.sol";

import "../../strategies/Balancer/BalancerActionsLib.sol";
import "../../strategies/Stargate/StrategyStargateBal.sol";
import "../../infra/RewardPool.sol";
import "../base/BaseZapOneInch.sol";

import {StrategyAuraGyroMainnet} from "../../strategies/Balancer/StrategyAuraGyroMainnet.sol";
import "../../strategies/Curve/StrategyConvex.sol";
import {StrategyCurveConvex, CurveRoute} from "../../strategies/Curve/StrategyCurveConvex.sol";

import {IBalancerPool} from "../../strategies/Balancer/StrategyAuraMainnet.sol";
import "../../utils/UniswapV3Utils.sol";

import "hardhat/console.sol";

// Aggregator Zap compatible with all single asset, uniswapv2, and solidly router Vaults.
contract CurveConvexZapOneInchETH is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    enum WantType {
        WANT_TYPE_CONVEX,
        WANT_TYPE_CURVE_CONVEX
    }

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address,
        address _inputToken,
        uint256,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (_type == WantType.WANT_TYPE_CONVEX) {
            return _handleWantTypeConvexBeefIn(_vault, _inputToken, data);
        } else {
            return
                _handleWantTypeCurveConvexBeefIn(
                    _vault,
                    _inputToken,
                    data
                );
        }
    }

    function _beefOut(
        IVault _vault,
        address,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (_type == WantType.WANT_TYPE_CONVEX) {
            tokens = _removeConvexLiquidity(_vault, _withdrawAmount);
        } else if (_type == WantType.WANT_TYPE_CURVE_CONVEX) {
            WantTypeCurveConvexOutParams memory params = abi.decode(
                data,
                (WantTypeCurveConvexOutParams)
            );

            tokens = _removeCurveConvexLiquidity(
                _vault,
                params.tokenIndex,
                params.token,
                _withdrawAmount
            );
        }
    }

    function _beefOutAndSwap(
        IVault _vault,
        address,
        address,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (_type == WantType.WANT_TYPE_CONVEX) {
            WantTypeConvexOutParams memory params = abi.decode(
                data,
                (WantTypeConvexOutParams)
            );

            tokens = _removeConvexLiquidity(_vault, _withdrawAmount);
            _swapViaOneInch(tokens[0], params.inputToken);
        } else if (_type == WantType.WANT_TYPE_CURVE_CONVEX) {
            WantTypeCurveConvexOutParams memory params = abi.decode(
                data,
                (WantTypeCurveConvexOutParams)
            );

            tokens = _removeCurveConvexLiquidity(
                _vault,
                params.tokenIndex,
                params.token,
                _withdrawAmount
            );

            _swapViaOneInch(params.token, params.inputToken);
        }
    }

    function _removeCurveConvexLiquidity(
        IVault vault,
        uint256 tokenIndex,
        address token,
        uint256 withdrawAmount
    ) private returns (address[] memory tokens) {
        tokens = new address[](1);
        tokens[0] = token;

        StrategyCurveConvex strategy = StrategyCurveConvex(
            payable(vault.strategy())
        );

        ICurveSwap(strategy.want()).remove_liquidity_one_coin(
            withdrawAmount,
            tokenIndex,
            0,
            false,
            address(this)
        );
    }

    function _removeConvexLiquidity(
        IVault vault,
        uint256 withdrawAmount
    ) private returns (address[] memory tokens) {
        StrategyConvex strategy = StrategyConvex(payable(vault.strategy()));

        tokens = new address[](1);
        tokens[0] = strategy.depositToken();

        address pool = strategy.pool();
        address zap = strategy.zap();

        if (zap != address(0)) {
            _approveTokenIfNeeded(pool, zap);
            int128 depositIndex = int128(uint128(strategy.depositIndex()));
            ICurveSwap(zap).remove_liquidity_one_coin(
                pool,
                withdrawAmount,
                depositIndex,
                0,
                address(this)
            );
        } else {
            uint256 depositIndex = strategy.depositIndex();
            ICurveSwap(pool).remove_liquidity_one_coin(
                withdrawAmount,
                depositIndex,
                0,
                false
            );
        }
    }

    function _handleWantTypeCurveConvexBeefIn(
        IVault vault,
        address _inputToken,
        bytes calldata data
    ) internal returns (address[] memory) {
        WantTypeCurveConvexParams memory params = abi.decode(
            data,
            (WantTypeCurveConvexParams)
        );

        if (params.inputToken.length != 0) {
            _swapViaOneInch(_inputToken, params.inputToken); // swap token to wETH
        }

        StrategyCurveConvex strategy = StrategyCurveConvex(
            payable(vault.strategy())
        );

        (address[9] memory route, uint256[3][4] memory swapParams, ) = strategy
            .depositToWantRoute();

        uint bal = IERC20(route[0]).balanceOf(address(this));
        _approveTokenIfNeeded(route[0], strategy.curveRouter());
        ICurveRouter(strategy.curveRouter()).exchange_multiple(
            route,
            swapParams,
            bal,
            0
        );
    }

    function _handleWantTypeConvexBeefIn(
        IVault vault,
        address _inputToken,
        bytes calldata data
    ) internal returns (address[] memory tokens) {
        WantTypeConvexParams memory params = abi.decode(
            data,
            (WantTypeConvexParams)
        );

        if (params.inputToken.length != 0) {
            _swapViaOneInch(_inputToken, params.inputToken); // swap token to wETH
        }

        StrategyConvex strategy = StrategyConvex(payable(vault.strategy()));
        address native = strategy.native();
        address deposit = strategy.depositToken();

        uint256 depositBal;
        uint256 depositNativeAmount;
        uint256 nativeBal = IERC20(native).balanceOf(address(this));

        if (deposit != native) {
            depositBal = IERC20(strategy.depositToken()).balanceOf(
                address(this)
            );
        } else {
            depositBal = nativeBal;
            if (strategy.depositNative()) {
                depositNativeAmount = nativeBal;
                IWrappedNative(native).withdraw(depositNativeAmount);
            }
        }

        uint256 poolSize = strategy.poolSize();
        address pool = strategy.pool();
        address zap = strategy.zap();
        uint256 depositIndex = strategy.depositIndex();
        bool useUnderlying = strategy.useUnderlying();

        _approveTokenIfNeeded(deposit, pool);
        _approveTokenIfNeeded(deposit, zap);

        if (poolSize == 2) {
            uint256[2] memory amounts;
            amounts[depositIndex] = depositBal;

            if (useUnderlying) ICurveSwap(pool).add_liquidity(amounts, 0, true);
            else
                ICurveSwap(pool).add_liquidity{value: depositNativeAmount}(
                    amounts,
                    0
                );
        } else if (poolSize == 3) {
            uint256[3] memory amounts;
            amounts[depositIndex] = depositBal;

            if (useUnderlying) ICurveSwap(pool).add_liquidity(amounts, 0, true);
            else if (zap != address(0))
                ICurveSwap(zap).add_liquidity{value: depositNativeAmount}(
                    pool,
                    amounts,
                    0
                );
            else
                ICurveSwap(pool).add_liquidity{value: depositNativeAmount}(
                    amounts,
                    0
                );
        } else if (poolSize == 4) {
            uint256[4] memory amounts;
            amounts[depositIndex] = depositBal;

            if (zap != address(0))
                ICurveSwap(zap).add_liquidity(pool, amounts, 0);
            else ICurveSwap(pool).add_liquidity(amounts, 0);
        } else if (poolSize == 5) {
            uint256[5] memory amounts;
            amounts[depositIndex] = depositBal;

            if (zap != address(0))
                ICurveSwap(zap).add_liquidity(pool, amounts, 0);
            else ICurveSwap(pool).add_liquidity(amounts, 0);
        }
    }

    function _parseType(uint8 type_) private pure returns (WantType) {
        return WantType(type_);
    }
}
