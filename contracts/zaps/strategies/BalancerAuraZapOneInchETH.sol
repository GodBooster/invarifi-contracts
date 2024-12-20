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
contract BalancerAuraZapOneInchETH is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    enum WantType {
        WANT_TYPE_BALANCER_AURA,
        WANT_TYPE_BALANCER_AURA_MULTI_REWARD,
        WANT_TYPE_BALANCER_AURA_GYRO
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

        if (
            _type == WantType.WANT_TYPE_BALANCER_AURA ||
            _type == WantType.WANT_TYPE_BALANCER_AURA_MULTI_REWARD
        ) {
            return
                _handleWantTypeBalancerAuraBeefIn(
                    _vault,
                    _inputToken,
                    data
                );
        } else if (_type == WantType.WANT_TYPE_BALANCER_AURA_GYRO) {
            return
                _handleWantTypeBalancerAuraGyroBeefIn(
                    _vault,
                    _inputToken,
                    data
                );
        }
    }

    function _beefOut(
        IVault _vault,
        address want,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (
            _type == WantType.WANT_TYPE_BALANCER_AURA ||
            _type == WantType.WANT_TYPE_BALANCER_AURA_MULTI_REWARD
        ) {
            WantTypeBalancerAuraOutParams memory params = abi.decode(
                data,
                (WantTypeBalancerAuraOutParams)
            );
            // swap want (bpt) to any token in lpTokens
            return
                _removeBalancerAuraLiquidity(
                    _vault,
                    _withdrawAmount,
                    want,
                    params.tokenIndexRoute
                );
        } else {
            return
                _removeBalancerAuraGyroLiquidity(
                    _vault,
                    _withdrawAmount,
                    want
                );
        }
    }

    function _beefOutAndSwap(
        IVault _vault,
        address want,
        address,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (
            _type == WantType.WANT_TYPE_BALANCER_AURA ||
            _type == WantType.WANT_TYPE_BALANCER_AURA_MULTI_REWARD
        ) {
            WantTypeBalancerAuraOutParams memory params = abi.decode(
                data,
                (WantTypeBalancerAuraOutParams)
            );

            // swap bpt to any lp token
            tokens = _removeBalancerAuraLiquidity(
                _vault,
                _withdrawAmount,
                want,
                params.tokenIndexRoute
            );

            // swap lp token to token and send to user
            _swapViaOneInch(params.tokenOut, params.inputToken);
        } else {
            WantTypeBalancerAuraGyroOutParams memory params = abi.decode(
                data,
                (WantTypeBalancerAuraGyroOutParams)
            );

            // swap want (bpt) to any token in lpTokens
            tokens = _removeBalancerAuraGyroLiquidity(
                _vault,
                _withdrawAmount,
                want
            );

            _swapViaOneInch(tokens[0], params.token0);
            _swapViaOneInch(tokens[1], params.token1);
        }
    }

    function _handleWantTypeBalancerAuraBeefIn(
        IVault vault,
        address _tokenIn,
        bytes calldata data
    ) internal returns (address[] memory tokens) {
        WantTypeBalancerAuraParams memory params = abi.decode(
            data,
            (WantTypeBalancerAuraParams)
        );

        IBalancerAuraStrategy strategy = IBalancerAuraStrategy(
            vault.strategy()
        );

        // Todo change to normal tokens
        tokens = new address[](2);
        tokens[0] = _tokenIn;
        tokens[1] = strategy.getNative();

        // swap token to wETH
        _swapViaOneInch(_tokenIn, params.inputToken);

        address balancerRouter = strategy.getUniRouter();

        _approveTokenIfNeeded(tokens[1], balancerRouter);

        address input = strategy.getInputAddress();

        if (WETH != input) {
            _approveTokenIfNeeded(WETH, balancerRouter);

            uint256 nativeBalance = IERC20(tokens[1]).balanceOf(address(this));
            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(
                    strategy.getNativeToInputRoute(),
                    nativeBalance
                );
            IBalancerVault.FundManagement memory funds = IBalancerVault
                .FundManagement(
                    address(this),
                    false,
                    payable(address(this)),
                    false
                );
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategy.getSwapKind(),
                _swaps,
                strategy.getNativeToInputAssets(),
                funds,
                int256(nativeBalance)
            ); // swap wETH to btp (balancer lp token)
        }

        if (!strategy.isComposable()) {
            uint256 inputBal = IERC20(input).balanceOf(address(this));
            // add liquidity
            _approveTokenIfNeeded(input, balancerRouter);
            BalancerActionsLib.balancerJoin(
                balancerRouter,
                IBalancerPool(strategy.getWant()).getPoolId(),
                input,
                inputBal
            );
        }
    }

    function _handleWantTypeBalancerAuraGyroBeefIn(
        IVault vault,
        address _inputToken,
        bytes calldata data
    ) internal returns (address[] memory) {
        WantTypeBalancerAuraGyroParams memory params = abi.decode(
            data,
            (WantTypeBalancerAuraGyroParams)
        );

        StrategyAuraGyroMainnet strategy = StrategyAuraGyroMainnet(
            vault.strategy()
        );
        address balancerRouter = strategy.getUniRouter();
        address native = strategy.getNative();

        // Todo change to normal tokens
        address[] memory _returnTokens = new address[](2);
        _returnTokens[0] = _inputToken;
        _returnTokens[1] = native;

        _swapViaOneInch(_inputToken, params.inputToken); // swap token to wETH

        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        bytes32 poolId = IBalancerPool(strategy.getWant()).getPoolId();
        (address[] memory lpTokens, , ) = IBalancerVault(balancerRouter)
            .getPoolTokens(poolId);

        IBalancerVault.FundManagement memory funds = IBalancerVault
            .FundManagement(
                address(this),
                false,
                payable(address(this)),
                false
            );

        if (lpTokens[0] != native) {
            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(
                    strategy.getNativeToLp0Route(),
                    nativeBal
                );
            _approveTokenIfNeeded(native, balancerRouter);
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategy.swapKind(),
                _swaps,
                strategy.getNativeToLp0Assets(),
                funds,
                int256(nativeBal)
            );
        }

        if (nativeBal > 0) {
            uint256 lp0Bal = IERC20(lpTokens[0]).balanceOf(address(this));
            (uint256 lp0Amt, uint256 lp1Amt) = strategy.calcSwapAmount(lp0Bal);

            _approveTokenIfNeeded(lpTokens[0], balancerRouter);

            IBalancerVault.BatchSwapStep[] memory _swaps = BalancerActionsLib
                .buildSwapStructArray(strategy.getLp0ToLp1Route(), lp1Amt);
            BalancerActionsLib.balancerSwap(
                balancerRouter,
                strategy.swapKind(),
                _swaps,
                strategy.getLp0ToLp1Assets(),
                funds,
                int256(lp1Amt)
            );

            _approveTokenIfNeeded(lpTokens[1], balancerRouter);

            BalancerActionsLib.multiJoin(
                balancerRouter,
                strategy.want(),
                poolId,
                lpTokens[0],
                lpTokens[1],
                lp0Amt,
                IERC20(lpTokens[1]).balanceOf(address(this))
            );
        }

        _returnAssets(_returnTokens);

        return lpTokens;
    }

    function _removeBalancerAuraLiquidity(
        IVault vault,
        uint256 withdrawAmount,
        address want,
        uint256 tokenIndexRoute
    ) private returns (address[] memory tokens) {
        address balancerRouter = IZapStrategy(vault.strategy()).unirouter();

        _approveTokenIfNeeded(want, address(balancerRouter));

        // remove liquidity
        BalancerActionsLib.balancerExit(
            balancerRouter,
            IBalancerPool(want).getPoolId(),
            tokenIndexRoute,
            withdrawAmount
        );

        bytes32 poolId = IBalancerPool(want).getPoolId();

        (tokens, , ) = IBalancerVault(balancerRouter).getPoolTokens(poolId);
    }

    function _removeBalancerAuraGyroLiquidity(
        IVault vault,
        uint256 withdrawAmount,
        address want
    ) private returns (address[] memory tokens) {
        address balancerRouter = IZapStrategy(vault.strategy()).unirouter();

        _approveTokenIfNeeded(want, address(balancerRouter));
        BalancerActionsLib.balancerExitGyro(
            balancerRouter,
            IBalancerPool(want).getPoolId(),
            withdrawAmount
        ); // remove liquidity

        bytes32 poolId = IBalancerPool(want).getPoolId();

        (tokens, , ) = IBalancerVault(balancerRouter).getPoolTokens(poolId);
    }

    function _parseType(uint8 type_) private pure returns (WantType) {
        return WantType(type_);
    }
}
