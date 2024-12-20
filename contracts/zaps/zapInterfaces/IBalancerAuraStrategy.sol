// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../strategies/Balancer/BalancerStructs.sol";
import "../../interfaces/beethovenx/IBalancerVault.sol";

interface IBalancerAuraStrategy {
    function getNativeToInputRoute() external view returns (BalancerStructs.BatchSwapStruct[] memory);

    function getOutputTonativeRoute() external view returns (BalancerStructs.BatchSwapStruct[] memory);

    function getNativeToInputAssets() external view returns (address[] memory);

    function getOutputToNativeAssets() external view returns (address[] memory);

    function getFunds() external view returns (IBalancerVault.FundManagement memory);

    function getWant() external view returns (address);
    
    function getUniRouter() external view returns (address);

    function getInputAddress() external view returns (address);

    function isComposable() external view returns (bool);

    function getNative() external view returns (address);

    function getSwapKind() external view returns(IBalancerVault.SwapKind);
}