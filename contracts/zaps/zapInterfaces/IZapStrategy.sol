// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IZapStrategy {
    function withdrawalFee() external view returns (uint256);
    function unirouter() external view returns (address);
}