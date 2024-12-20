// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

interface IBalancerComposablePool {
    function getTokenRate(IERC20 token) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function getVault() external view returns (address);

    function getPoolId() external view returns (bytes32);
}
