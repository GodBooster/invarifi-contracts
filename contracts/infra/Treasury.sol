// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/access/Ownable.sol";
import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControlAbstract} from "../utils/access/AccessControlAbstract.sol";

contract Treasury is AccessControlAbstract {
    using SafeERC20 for IERC20;

    function initialize(address _ac) public initializer {
        __AccessAccessControlAbstract_init(_ac);
    }

    function withdrawTokens(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function withdrawNative(
        address payable _to,
        uint256 _amount
    ) external onlyOwner {
        _to.transfer(_amount);
    }

    receive() external payable {}
}
