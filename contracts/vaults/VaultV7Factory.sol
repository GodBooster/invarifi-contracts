// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./VaultV7.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";

// Vault V7 Proxy Factory
// Minimal proxy pattern for creating new vaults
contract VaultV7Factory {
  using ClonesUpgradeable for address;

  // Contract template for deploying proxied vaults
  VaultV7 public instance;

  event ProxyCreated(address proxy);

  // Initializes the Factory with an instance of the Vault V7
  constructor(address _instance) {
    if (_instance == address(0)) {
      instance = new VaultV7();
    } else {
      instance = VaultV7(_instance);
    }
  }

  // Creates a new Vault V7 as a proxy of the template instance
  // A reference to the new proxied Vault V7
  function cloneVault() external returns (VaultV7) {
    return VaultV7(cloneContract(address(instance)));
  }
  
  function cloneVaultAndCall(bytes calldata _calldata) external returns (VaultV7) {
    address clone = cloneContract(address(instance));
    (bool successful, ) = clone.call(_calldata);
    assert(successful);

    return VaultV7(clone);
  }

  // Deploys and returns the address of a clone that mimics the behaviour of `implementation`
  function cloneContract(address implementation) public returns (address) {
    address proxy = implementation.clone();
    emit ProxyCreated(proxy);
    return proxy;
  }

  function cloneContractAndCall(address implementation, bytes calldata _calldata) external returns (address) {
    address cloned = cloneContract(implementation);

    (bool successful, ) = cloned.call(_calldata);
    assert(successful);
    
    return cloned;
  }
}