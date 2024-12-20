// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin-4/contracts/proxy/beacon/BeaconProxy.sol";
import "../EarnPool.sol";

contract EarnFactory is Initializable {
    struct EarnParams {
        address _ac;
        address _earnConfiguration;
        address _oneInchRouter;
        address _wETH;
        address _automate;
        address _resolver;
        EarnPool.Fees _fees;
    }

    mapping(uint256 => address) public deployed;

    address public earnBeacon;

    uint256 public deployedCount;

    uint256[50] private _gap;

    event EarnDeployed(address indexed earn);

    constructor() {
        _disableInitializers();
    }

    function initialize(address _earnBeacon) external initializer {
        earnBeacon = _earnBeacon;
    }

    function deploy(
        EarnParams calldata earnParams,
        VaultConfig[] calldata _vaultConfigs
    ) external returns (address) {
        address earnProxy = address(
            new BeaconProxy(
                address(earnBeacon),
                abi.encodeCall(
                    EarnPool(payable(address(0))).initialize,
                    (
                        earnParams._ac,
                        earnParams._earnConfiguration,
                        earnParams._oneInchRouter,
                        earnParams._wETH,
                        earnParams._automate,
                        earnParams._resolver,
                        _vaultConfigs,
                        earnParams._fees
                    )
                )
            )
        );

        deployed[deployedCount++] = earnProxy;

        emit EarnDeployed(earnProxy);

        return earnProxy;
    }
}
