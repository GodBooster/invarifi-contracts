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
import "../../strategies/Hop/StrategyHop.sol";
import "../../infra/RewardPool.sol";
import "../base/BaseZapOneInch.sol";

import {StrategyAuraGyroMainnet} from "../../strategies/Balancer/StrategyAuraGyroMainnet.sol";
import "../../strategies/Curve/StrategyConvex.sol";
import {StrategyCurveConvex, CurveRoute} from "../../strategies/Curve/StrategyCurveConvex.sol";

import {IBalancerPool} from "../../strategies/Balancer/StrategyAuraMainnet.sol";
import "../../utils/UniswapV3Utils.sol";

import "hardhat/console.sol";

contract HopZapOneInch is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    enum WantType {
        WANT_TYPE_HOP
    }

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address,
        address tokenIn,
        uint256,
        uint8,
        bytes calldata _swapData
    ) internal override returns (address[] memory tokens) {
        return _handleBeefInTypeHop(address(_vault), tokenIn, _swapData);
    }

    function _beefOut(
        IVault _vault,
        address _want,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata
    ) internal override returns (address[] memory tokens) {
        return _beefOutWantTypeHop(_vault, _want, _withdrawAmount);
    }

    function _beefOutAndSwap(
        IVault _vault,
        address _want,
        address _desiredToken,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata swapData
    ) internal override returns (address[] memory path) {
        path = new address[](2);

        path[0] = _beefOutWantTypeHop(_vault, _want, _withdrawAmount)[0];
        path[1] = _desiredToken;

        if (swapData.length != 0) {
            _swapViaOneInch(path[0], swapData);
        }
    }

    function _handleBeefInTypeHop(
        address _vault,
        address _inputToken,
        bytes memory _swapData
    ) private returns (address[] memory) {
        if (_swapData.length != 0) {
            _swapViaOneInch(_inputToken, _swapData);
        }

        IVault vault = IVault(_vault);

        StrategyHop strat = StrategyHop(payable(address(vault.strategy())));

        address depositToken = strat.depositToken();
        address router = strat.stableRouter();
        uint256 depositIndex = strat.depositIndex();

        uint256[] memory inputs = new uint256[](2);
        inputs[depositIndex] = IERC20(depositToken).balanceOf(address(this));

        _approveTokenIfNeeded(depositToken, address(router));
        IStableRouter(router).addLiquidity(inputs, 1, block.timestamp);
    }

    function _beefOutWantTypeHop(
        IVault _vault,
        address _want,
        uint256 _withdrawAmount
    ) private returns (address[] memory tokens) {
        tokens = new address[](1);

        StrategyHop strat = StrategyHop(payable(address(_vault.strategy())));
        address router = strat.stableRouter();
        tokens[0] = strat.depositToken();

        _approveTokenIfNeeded(_want, router);

        IStableRouter(router).removeLiquidityOneToken(
            _withdrawAmount,
            uint8(strat.depositIndex()),
            1,
            block.timestamp
        );
    }

    function _parseType(uint8 type_) private pure returns (WantType) {
        return WantType(type_);
    }
}
