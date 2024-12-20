// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../EarnPool.sol";

contract EarnPoolTester is EarnPool {
    function _disableInitializers() internal override {}
}
