// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract AccessControlMain is AccessControlUpgradeable {
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    bytes32 public constant EARN_MANAGER_ROLE = keccak256("EARN_MANAGER_ROLE");

    address public strategist;

    uint256[50] private __gap;

    function initialize() external initializer {
        __AccessControl_init();

        address sender = msg.sender;

        _setupRole(DEFAULT_ADMIN_ROLE, sender);
        _setupRole(OWNER_ROLE, sender);
        _setupRole(KEEPER_ROLE, sender);
        _setupRole(EARN_MANAGER_ROLE, sender);
        strategist = sender;
    }

    function setStrategist(address newStrategist) public {
        require(hasRole(OWNER_ROLE, msg.sender), "Doesn't have role");
        require(newStrategist != address(0), "Zero address");

        strategist = newStrategist;
    }
}
