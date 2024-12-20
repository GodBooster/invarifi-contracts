// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract CUBERA is ERC20Upgradeable {
  function initialize(address treasury) external initializer {
    __ERC20_init("Invarifi", "INV");
    _mint(treasury, 80_000 ether);
  }
}
