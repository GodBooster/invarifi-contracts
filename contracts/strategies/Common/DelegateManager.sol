// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/access/Ownable.sol";
import "@openzeppelin-4/contracts/security/Pausable.sol";

import "../../interfaces/common/IDelegateManager.sol";
import "../../utils/access/AccessControlNotUpgradeableAbstract.sol";

contract DelegateManager is
    AccessControlNotUpgradeableAbstract,
    Pausable
{
    /**
     * @dev Contracts:
     * {delegateManager} - Address for Snapshot delegation
     */

    IDelegateManager public delegateManager =
        IDelegateManager(0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446);
    bytes32 public id; // Snapshot ENS

    // Contract Events
    event NewVoter(address newVoter);
    event NewVoterParams(IDelegateManager newDelegateManager, bytes32 newId);

    /**
     * @dev Initializes the base strategy.
     */
    constructor(
        address _ac,
        address _voter,
        bytes32 _id
    ) AccessControlNotUpgradeableAbstract(_ac) {
        id = _id;

        _setVoteDelegation(_voter);
    }

    // set voter params
    function setVoterParams(
        IDelegateManager _delegationManager,
        bytes32 _newId
    ) external onlyManager {
        emit NewVoterParams(_delegationManager, _newId);
        delegateManager = _delegationManager;
        id = _newId;
    }

    // set vote delegation
    function setVoteDelegation(address _voter) external onlyManager {
        _setVoteDelegation(_voter);
    }

    function _setVoteDelegation(address _voter) internal {
        emit NewVoter(_voter);
        delegateManager.setDelegate(id, _voter);
    }

    // clear vote delegation
    function clearVoteDelegation() external onlyManager {
        delegateManager.clearDelegate(id);
    }

    function currentVoter() external view returns (address) {
        return delegateManager.delegation(address(this), id);
    }
}
