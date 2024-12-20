// SPDX-License-Identifier: UNLICENSED
import "./AccessControlMain.sol";

abstract contract AccessControlNotUpgradeableAbstract {
    AccessControlMain internal accessControlMain;

    constructor(address _accessControlMain) {
        accessControlMain = AccessControlMain(
            _accessControlMain
        );
    }

    modifier onlyManager() {
        _mustHaveRole(accessControlMain.KEEPER_ROLE(), msg.sender);

        _;
    }

    modifier onlyOwner() {
        _mustHaveRole(accessControlMain.OWNER_ROLE(), msg.sender);

        _;
    }

    modifier onlyVoter() {
        _mustHaveRole(accessControlMain.VOTER_ROLE(), msg.sender);

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
