// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/access/Ownable.sol";
import "@openzeppelin-4/contracts/security/Pausable.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../utils/access/AccessControlNotUpgradeableAbstract.sol";

contract BeSolidManager is AccessControlNotUpgradeableAbstract, Pausable {
    using SafeERC20 for IERC20;

    constructor(address _ac) AccessControlNotUpgradeableAbstract(_ac) {}
}
