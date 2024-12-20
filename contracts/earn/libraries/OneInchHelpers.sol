// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

import "./ERC20Helpers.sol";

library OneInchHelpers {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;

    function swap(
        address _oneInchRouter,
        address _inputToken,
        uint256 _inputAmount,
        bytes memory _callData
    ) internal {
        if (_callData.length == 0) return;

        IERC20(_inputToken).approveIfNeeded(_oneInchRouter, _inputAmount);

        (bool success, bytes memory retData) = _oneInchRouter.call(_callData);

        propagateError(success, retData, "1inch");

        require(success == true, "calling 1inch got an error");
    }

    function propagateError(
        bool success,
        bytes memory data,
        string memory errorMessage
    ) internal pure {
        // Forward error message from call/delegatecall
        if (!success) {
            if (data.length == 0) revert(errorMessage);
            assembly {
                revert(add(32, data), mload(data))
            }
        }
    }
}
