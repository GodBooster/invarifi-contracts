// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlMain} from "./AccessControlMain.sol";

abstract contract AccessControlAbstract is Initializable {
    AccessControlMain internal accessControlMain;

    uint256[50] private __gap;

    function __AccessAccessControlAbstract_init(
        address _accessControlMain
    ) internal onlyInitializing {
        accessControlMain = AccessControlMain(_accessControlMain);
    }

    modifier onlyManager() {
        _mustHaveRole(accessControlMain.KEEPER_ROLE(), msg.sender);

        _;
    }

    modifier onlyOwner() {
        _mustHaveRole(accessControlMain.OWNER_ROLE(), msg.sender);

        _;
    }

    modifier onlyEarnManager() {
        _mustHaveRole(accessControlMain.EARN_MANAGER_ROLE(), msg.sender);

        _;
    }

    function _mustHaveRole(bytes32 role, address user) internal view {
        require(userHasRole(role, user), "!role");
    }

    function userHasRole(
        bytes32 role,
        address user
    ) public view returns (bool) {
        return accessControlMain.hasRole(role, user);
    }

    function getStrategist() public view returns (address) {
        return accessControlMain.strategist();
    }
}
