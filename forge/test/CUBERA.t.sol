// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../node_modules/forge-std/src/Test.sol";
import "../../contracts/infra/CUBERA.sol";

contract CUBERATest is Test {

    function test_mint() public {
        CUBERA cubera = new CUBERA(address(this));
        assertEq(cubera.totalSupply(), 80_000*1e18);
        assertEq(cubera.balanceOf(address(this)), 80_000*1e18);
    }

}