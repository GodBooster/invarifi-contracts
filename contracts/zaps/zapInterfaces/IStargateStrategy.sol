// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStargateStrategy {

  function depositToken() external view returns (address);
  function stargateRouter() external view returns (address);
  function routerPoolId() external view returns (uint256);

}