// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../../interfaces/common/IFeeConfig.sol";
import {AccessControlAbstract} from "../../utils/access/AccessControlAbstract.sol";

contract StratFeeManagerAccessableInitializable is
    PausableUpgradeable,
    AccessControlAbstract
{
    struct CommonAddressesAccessable {
        address vault;
        address unirouter;
        address ac;
        address feeRecipient;
        address feeConfig;
    }

    // common addresses for the strategy
    address public vault;
    address public unirouter;
    address public keeper;
    address public feeRecipient;
    IFeeConfig public feeConfig;

    uint256 constant DIVISOR = 1 ether;

    event SetStratFeeId(uint256 feeId);
    event SetVault(address vault);
    event SetUnirouter(address unirouter);
    event SetKeeper(address keeper);
    event SetStrategist(address strategist);
    event SetFeeRecipient(address feeRecipient);
    event SetFeeConfig(address feeConfig);

    function __StratFeeManagerAccessableInitializable_init(
        CommonAddressesAccessable calldata _commonAddresses
    ) internal onlyInitializing {
        __Pausable_init();
        __AccessAccessControlAbstract_init(_commonAddresses.ac);
        vault = _commonAddresses.vault;
        unirouter = _commonAddresses.unirouter;
        feeRecipient = _commonAddresses.feeRecipient;
        feeConfig = IFeeConfig(_commonAddresses.feeConfig);
    }

    // fetch fees from config contract
    function getFees() internal view returns (IFeeConfig.FeeCategory memory) {
        return feeConfig.getFees(address(this));
    }

    // fetch fees from config contract and dynamic deposit/withdraw fees
    function getAllFees() external view returns (IFeeConfig.AllFees memory) {
        return IFeeConfig.AllFees(getFees(), 0, 0);
    }

    function getStratFeeId() external view returns (uint256) {
        return feeConfig.stratFeeId(address(this));
    }

    function setStratFeeId(uint256 _feeId) external onlyManager {
        feeConfig.setStratFeeId(_feeId);
        emit SetStratFeeId(_feeId);
    }

    // set new vault (only for strategy upgrades)
    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit SetVault(_vault);
    }

    // set new unirouter
    function setUnirouter(address _unirouter) external onlyOwner {
        unirouter = _unirouter;
        emit SetUnirouter(_unirouter);
    }

    // set new fee address to receive fees
    function setFeeRecipient(
        address _feeRecipient
    ) external onlyOwner {
        feeRecipient = _feeRecipient;
        emit SetFeeRecipient(_feeRecipient);
    }

    // set new fee config address to fetch fees
    function setFeeConfig(address _feeConfig) external onlyOwner {
        feeConfig = IFeeConfig(_feeConfig);
        emit SetFeeConfig(_feeConfig);
    }

    function beforeDeposit() external virtual {}
}
