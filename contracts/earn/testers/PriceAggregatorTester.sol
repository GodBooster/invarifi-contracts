// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../PriceAggregator.sol";

contract PriceAggregatorTester is PriceAggregator {
    function _disableInitializers() internal override {}
}
