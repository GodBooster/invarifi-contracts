// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./StrategyStargateAccessableInitializable.sol";
import "../../interfaces/common/IUniswapRouterETH.sol";
import "../../interfaces/common/IMasterChef.sol";
import "../../interfaces/stargate/IStargateRouter.sol";
import "../../utils/StringUtils.sol";

contract StrategyStargateStaking is StrategyStargateAccessableInitializable {
    // Routes
    address[] public outputToNativeRoute;
    address[] public outputToDepositRoute;

    function initialize(
        address _want,
        uint256 _poolId,
        address _chef,
        address _stargateRouter,
        uint256 _routerPoolId,
        address[] calldata _outputToNativeRoute,
        address[] calldata _outputToDepositRoute,
        CommonAddressesAccessable calldata _commonAddresses
    ) external initializer {
        __StrategyStargate_init(
            _want,
            _poolId,
            _chef,
            _stargateRouter,
            _routerPoolId,
            _commonAddresses
        );

        output = _outputToNativeRoute[0];
        native = _outputToNativeRoute[_outputToNativeRoute.length - 1];
        outputToNativeRoute = _outputToNativeRoute;

        // setup lp routing
        outputToDepositRoute = _outputToDepositRoute;
        depositToken = _outputToDepositRoute[_outputToDepositRoute.length - 1];

        _giveAllowances();
    }

    // Adds liquidity to AMM and gets more LP tokens.
    function _addLiquidity() internal override {
        uint256 outputBal = IERC20(output).balanceOf(address(this));

        if (depositToken != output) {
            IUniswapRouterETH(unirouter).swapExactTokensForTokens(
                outputBal,
                0,
                outputToDepositRoute,
                address(this),
                block.timestamp
            );
        }

        uint256 depositBalalance = IERC20(depositToken).balanceOf(
            address(this)
        );
        IStargateRouter(stargateRouter).addLiquidity(
            routerPoolId,
            depositBalalance,
            address(this)
        );
    }

    function outputToNative() external view returns (address[] memory) {
        return outputToNativeRoute;
    }

    function outputToLp0() external view returns (address[] memory) {
        return outputToDepositRoute;
    }
}
