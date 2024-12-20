// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../helpers/GelatoSwapper.sol";

contract GelatoSwapperTester is GelatoSwapper {
    function _disableInitializers() internal override {}
}
