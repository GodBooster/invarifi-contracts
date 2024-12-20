// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

library ERC20Helpers {
    using SafeERC20 for IERC20;

    function approveIfNeeded(
        IERC20 _token,
        address _spender,
        uint256 _amount
    ) internal {
        _token.safeApprove(_spender, 0);
        _token.safeApprove(_spender, _amount);
    }

    function approveIfNeededLp(IERC20 _token, address _spender) internal {
        if (_token.allowance(address(this), _spender) == 0) {
            _token.safeApprove(_spender, type(uint256).max);
        }
    }

    function approveIfNeeded(IERC20 _token, address _spender) internal {
        approveIfNeeded(_token, _spender, type(uint256).max);
    }
}
