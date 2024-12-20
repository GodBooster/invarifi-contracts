// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../../interfaces/base/IStrategyV7.sol";

contract VaultV7Test is ERC20Upgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    address public token;
    IStrategyV7 public strategy;

    function initialize(address _token) public initializer {
        token = _token;
    }

    function want() public view returns (IERC20Upgradeable) {
        return IERC20Upgradeable(token);
    }

    function balance() public view returns (uint) {
        return want().balanceOf(address(this));
    }

    function available() public view returns (uint256) {
        return want().balanceOf(address(this));
    }

    function getPricePerFullShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : (balance() * 1e18) / totalSupply();
    }

    function depositAll() external {
        deposit(want().balanceOf(msg.sender));
    }

    function deposit(uint _amount) public {
        want().safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
    }

    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    function withdraw(uint256 _shares) public {
        _burn(msg.sender, _shares);
        want().safeTransfer(msg.sender, _shares);
    }
}
