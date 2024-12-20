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
import "../zapInterfaces/IStargateStrategy.sol";

import {StrategyAuraGyroMainnet} from "../../strategies/Balancer/StrategyAuraGyroMainnet.sol";
import "../../strategies/Curve/StrategyConvex.sol";
import {StrategyCurveConvex, CurveRoute} from "../../strategies/Curve/StrategyCurveConvex.sol";

import {IBalancerPool} from "../../strategies/Balancer/StrategyAuraMainnet.sol";
import "../../utils/UniswapV3Utils.sol";

import "hardhat/console.sol";

// Aggregator Zap compatible with all single asset, uniswapv2, and solidly router Vaults.
contract CommonZapOneInch is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    enum WantType {
        WANT_TYPE_SINGLE,
        WANT_TYPE_SINGLE_GOV,
        WANT_TYPE_UNISWAP_V2,
        WANT_TYPE_SOLIDLY_STABLE,
        WANT_TYPE_SOLIDLY_VOLATILE,
        WANT_TYPE_STARGATE
    }

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address want,
        address,
        uint256,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        WantTypeBaseParams memory params = abi.decode(
            data,
            (WantTypeBaseParams)
        );

        if (
            _type == WantType.WANT_TYPE_UNISWAP_V2 ||
            _type == WantType.WANT_TYPE_SOLIDLY_STABLE ||
            _type == WantType.WANT_TYPE_SOLIDLY_VOLATILE
        ) {
            return
                _handleBeefInTypeLp(
                    params._inputToken0,
                    params._inputToken1,
                    params._token0,
                    params._token1,
                    _type,
                    _vault,
                    IUniswapV2Pair(want)
                );
        } else {
            return
                _handleBeefInTypeSingle(
                    address(_vault),
                    params._inputToken0,
                    params._token0,
                    _type
                );
        }
    }

    function _beefOut(
        IVault _vault,
        address want,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata
    ) internal override returns (address[] memory tokens) {
        WantType _type = _parseType(type_);

        if (_type == WantType.WANT_TYPE_SINGLE_GOV) {
            return
                _beefOutWantTypeSingleGov(
                    address(_vault),
                    _withdrawAmount
                );
        } else if (_type == WantType.WANT_TYPE_STARGATE) {
            return _beefOutWantTypeStargate(_vault, _withdrawAmount);
        } else {
            return _beefOutWantTypeLp(want, address(this));
        }
    }

    function _beefOutAndSwap(
        IVault _vault,
        address want,
        address _desiredToken,
        uint256 _withdrawAmount,
        uint8 type_,
        bytes calldata data
    ) internal override returns (address[] memory path) {
        WantType _type = _parseType(type_);

        WantTypeBaseOutParams memory params = abi.decode(
            data,
            (WantTypeBaseOutParams)
        );

        if (
            _type == WantType.WANT_TYPE_SINGLE ||
            _type == WantType.WANT_TYPE_STARGATE
        ) {
            path = new address[](2);

            if (_type == WantType.WANT_TYPE_STARGATE) {
                path[0] = _beefOutWantTypeStargate(
                    _vault,
                    _withdrawAmount
                )[0];
            } else {
                path[0] = _vault.want();
            }

            path[1] = _desiredToken;

            _approveTokenIfNeeded(path[0], address(oneInchRouter));

            _swapViaOneInch(path[0], params.token0);
        } else if (_type == WantType.WANT_TYPE_SINGLE_GOV) {
            path = _beefOutWantTypeSingleGov(
                address(_vault),
                _withdrawAmount
            );

            if (params.token0.length != 0) {
                _swapViaOneInch(path[0], params.token0);
            }

            if (params.token1.length != 0) {
                _swapViaOneInch(path[1], params.token1);
            }
        } else {
            path = _beefOutWantTypeLp(address(want), address(this));

            _approveTokenIfNeeded(path[0], address(oneInchRouter));
            _approveTokenIfNeeded(path[1], address(oneInchRouter));

            if (_desiredToken != path[0]) {
                _swapViaOneInch(path[0], params.token0);
            }

            if (_desiredToken != path[1]) {
                _swapViaOneInch(path[0], params.token1);
            }
        }
    }

    function _handleBeefInTypeSingle(
        address _vault,
        address _inputToken,
        bytes memory _token0,
        WantType _type
    ) private returns (address[] memory) {
        if (_token0.length != 0) {
            _swapViaOneInch(_inputToken, _token0);
        }

        if (_type == WantType.WANT_TYPE_STARGATE) {
            IVault vault = IVault(_vault);
            IStargateStrategy strat = IStargateStrategy(
                payable(address(vault.strategy()))
            );
            address depositToken = strat.depositToken();

            address router = strat.stargateRouter();
            uint256 bal = IERC20(depositToken).balanceOf(address(this));
            if (depositToken == WETH) {
                IWrappedNative(depositToken).withdraw(bal);
                IStargateRouterETH(router).addLiquidityETH{value: bal}();
            } else {
                _approveTokenIfNeeded(depositToken, address(router));

                IStargateRouter(router).addLiquidity(
                    strat.routerPoolId(),
                    bal,
                    address(this)
                );
            }
        }
    }

    function _handleBeefInTypeLp(
        address _inputToken0,
        address _inputToken1,
        bytes memory _token0,
        bytes memory _token1,
        WantType _type,
        IVault vault,
        IUniswapV2Pair pair
    ) internal returns (address[] memory path) {
        if (_inputToken0 == _inputToken1) {
            path = new address[](3);
            path[0] = pair.token0();
            path[1] = pair.token1();
            path[2] = _inputToken0;
        } else {
            path = new address[](4);
            path[0] = pair.token0();
            path[1] = pair.token1();
            path[2] = _inputToken0;
            path[3] = _inputToken1;
        }

        if (_inputToken0 != path[0]) {
            _swapViaOneInch(_inputToken0, _token0);
        }

        if (_inputToken1 != path[1]) {
            _swapViaOneInch(_inputToken1, _token1);
        }

        address router = IZapStrategy(vault.strategy()).unirouter();

        _approveTokenIfNeeded(path[0], address(router));
        _approveTokenIfNeeded(path[1], address(router));
        uint256 lp0Amt = IERC20(path[0]).balanceOf(address(this));
        uint256 lp1Amt = IERC20(path[1]).balanceOf(address(this));

        uint256 amountLiquidity;
        if (
            _type == WantType.WANT_TYPE_SOLIDLY_STABLE ||
            _type == WantType.WANT_TYPE_SOLIDLY_VOLATILE
        ) {
            bool stable = _type == WantType.WANT_TYPE_SOLIDLY_STABLE
                ? true
                : false;
            (, , amountLiquidity) = ISolidlyRouter(router).addLiquidity(
                path[0],
                path[1],
                stable,
                lp0Amt,
                lp1Amt,
                1,
                1,
                address(this),
                block.timestamp
            );
        } else {
            (, , amountLiquidity) = IUniswapRouterETH(router).addLiquidity(
                path[0],
                path[1],
                lp0Amt,
                lp1Amt,
                1,
                1,
                address(this),
                block.timestamp
            );
        }
    }

    function _beefOutWantTypeSingleGov(
        address _vault,
        uint256
    ) private view returns (address[] memory tokens) {
        // transfer reward pool tokens from user, withdraw staked tokens and claim rewards

        tokens = new address[](2);
        tokens[0] = address(RewardPool(_vault).stakedToken());
        tokens[1] = address(RewardPool(_vault).rewardToken());
    }

    function _beefOutWantTypeStargate(
        IVault _vault,
        uint256 _withdrawAmount
    ) private returns (address[] memory tokens) {
        tokens = new address[](1);

        IStargateStrategy strat = IStargateStrategy(
            payable(address(_vault.strategy()))
        );
        tokens[0] = strat.depositToken();
        address router = strat.stargateRouter();
        uint16 routerPooldId;
        address withdrawToken;

        if (tokens[0] == WETH) {
            routerPooldId = IStargateRouterETH(router).poolId();
            withdrawToken = IStargateRouterETH(router).stargateEthVault();
            router = IStargateRouterETH(router).stargateRouter();
        } else {
            routerPooldId = uint16(strat.routerPoolId());
            withdrawToken = tokens[0];
        }

        IStargateRouter(router).instantRedeemLocal(
            routerPooldId,
            _withdrawAmount,
            address(this)
        );

        // covert Stargate`s wrapped eth pool into regular WETH
        if (tokens[0] == WETH) {
            uint256 bal = address(this).balance;
            IWrappedNative(WETH).deposit{value: bal}();
        }
    }

    function _beefOutWantTypeLp(
        address _pair,
        address _to
    ) private returns (address[] memory tokens) {
        IERC20(_pair).safeTransfer(
            _pair,
            IERC20(_pair).balanceOf(address(this))
        );
        (uint256 amount0, uint256 amount1) = IUniswapV2Pair(_pair).burn(_to);

        require(
            amount0 >= minimumAmount,
            "UniswapV2Router: INSUFFICIENT_A_AMOUNT"
        );
        require(
            amount1 >= minimumAmount,
            "UniswapV2Router: INSUFFICIENT_B_AMOUNT"
        );

        tokens = new address[](2);
        tokens[0] = IUniswapV2Pair(_pair).token0();
        tokens[1] = IUniswapV2Pair(_pair).token1();
    }

    function _parseType(uint8 type_) private pure returns (WantType) {
        return WantType(type_);
    }
}
