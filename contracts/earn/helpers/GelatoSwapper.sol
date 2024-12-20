// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../EarnConfiguration.sol";
import "../EarnPool.sol";
import "../base/Constants.sol";

import "../../utils/UniswapV3Utils.sol";
import "../libraries/ERC20Helpers.sol";

contract GelatoSwapper is Initializable {
    using ERC20Helpers for IERC20;

    bytes public stableToWNativeSwapPath;
    address public router;

    uint256[50] private _gap;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _router,
        bytes calldata _stableToWNativeSwapPath
    ) external initializer {
        stableToWNativeSwapPath = _stableToWNativeSwapPath;
        router = _router;
    }

    function swap(
        address stable,
        uint256 minAmountOut
    ) external returns (uint256 returnAmount) {
        IERC20(stable).approveIfNeeded(router);

        returnAmount = _swap(
            stable,
            IERC20(stable).balanceOf(address(this)),
            msg.sender
        );

        require(returnAmount >= minAmountOut, "GS: !minAmountOut");
    }

    function _swap(
        address,
        uint256 amountStable,
        address receiver
    ) internal virtual returns (uint256) {
        return
            UniswapV3Utils.swap(
                router,
                stableToWNativeSwapPath,
                amountStable,
                receiver
            );
    }
}
