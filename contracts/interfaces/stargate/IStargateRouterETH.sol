// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

interface IStargateRouterETH {
  function addLiquidityETH() external payable;
  function stargateEthVault() external view returns (address);  
  function stargateRouter() external view returns (address);  
  function poolId() external view returns (uint16);
}