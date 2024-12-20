// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import "@openzeppelin-4/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";

import "./VaultV7.sol";

contract VaultFactory is Initializable {
    using ClonesUpgradeable for address;

    struct VaultParams {
        address _strategy;
        string _name;
        string _symbol;
        address _feeRecipient;
        address _ac;
    }

    mapping(uint256 => address) public deployed;

    address public vaultBeacon;

    uint256 public deployedCount;

    mapping(uint256 => address) public deployedStrats;
    uint256 public deployedStratsCount;

    event VaultDeployed(address indexed vault);
    event StrategyDeployed(address indexed strategy);
    event StrategyProxyDeployed(address indexed strategy);
    event ContractCloned(address indexed cloned);

    uint256[48] private __gap;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _vaultBeacon) external initializer {
        vaultBeacon = _vaultBeacon;
    }

    function deployVault(
        VaultParams calldata vaultParams
    ) external returns (address) {
        address vaultProxy = address(
            new BeaconProxy(
                address(vaultBeacon),
                abi.encodeCall(
                    VaultV7(address(0)).initialize,
                    (
                        vaultParams._strategy,
                        vaultParams._name,
                        vaultParams._symbol,
                        vaultParams._feeRecipient,
                        vaultParams._ac
                    )
                )
            )
        );

        deployed[deployedCount++] = vaultProxy;

        emit VaultDeployed(vaultProxy);

        return vaultProxy;
    }

    function deployStrategy(
        address stratBeacon,
        bytes calldata callData
    ) external returns (address) {
        address stratProxy = address(
            new BeaconProxy(address(stratBeacon), callData)
        );

        deployedStrats[deployedStratsCount++] = stratProxy;

        emit StrategyProxyDeployed(stratProxy);

        return stratProxy;
    }

    function cloneStrategy(address impl) external returns (address) {
        address proxy = impl.clone();
        emit StrategyDeployed(proxy);
        return proxy;
    }

    function clone(address impl) external returns (address) {
        address proxy = impl.clone();
        emit ContractCloned(proxy);
        return proxy;
    }
}
