// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";

interface IVault is IERC20 {
    function deposit(uint256 amount) external;
    function deposit(uint256 amount, address user) external;
    function depositAll() external;
    function depositAll(address user) external;
    function withdraw(uint256 shares) external;
    function withdraw(uint256 shares, address user) external;
    function want() external pure returns (address); // Vault V6
    function token() external pure returns (address); // Vault V5
    function balance() external pure returns (uint256);
    function totalSupply() external pure returns (uint256);
    function strategy() external pure returns (address);
}