// eslint-disable-next-line node/no-missing-import
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeBalancerAuraEth } from "../../../types/vault-deployer";
// eslint-disable-next-line camelcase
import {
    StrategyAuraGyroMainnet,
    // eslint-disable-next-line camelcase
    StrategyAuraGyroMainnet__factory,
} from "../../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";
//
// Function: initialize(address, (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], address, uint256, address[], address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xf01b0684C98CD7aDA480BFDF6e43876422fa1Fc1
// 1	_nativeToLp0Route.poolId	bytes32	0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2
// 1	_nativeToLp0Route.assetInIndex	uint256	0
// 1	_nativeToLp0Route.assetOutIndex	uint256	1
// 2	_lp0ToLp1Route.poolId	bytes32	0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2
// 2	_lp0ToLp1Route.assetInIndex	uint256	0
// 2	_lp0ToLp1Route.assetOutIndex	uint256	1
// 3	_outputToNativeRoute.poolId	bytes32	0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014
// 3	_outputToNativeRoute.assetInIndex	uint256	0
// 3	_outputToNativeRoute.assetOutIndex	uint256	1
// 5	_booster	address	0xA57b8d98dAE62B26Ec3bcC4a365338157060B234
// 6	_pid	uint256	162
// 6	_nativeToLp0	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 7	_nativeToLp0	address	0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0
// 8	_lp0ToLp1	address	0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0
// 9	_lp0ToLp1	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 10	_outputToNative	address	0xba100000625a3754423978a60c9317c58a424e3D
// 11	_outputToNative	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 12	_commonAddresses.vault	address	0xc2f9C3F4e4cdE519D5DeA9880C1CA6614E4b3d61
// 12	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 12	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 12	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
// 12	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 12	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getBalancerAuraWSTETH_ETHInitializeParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xf01b0684C98CD7aDA480BFDF6e43876422fa1Fc1", // _want
    [
      {
        poolId: "0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ], // _nativeToLp0Route
    [
      {
        poolId: "0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ], // _lp0ToLp1Route
    [
      {
        poolId: "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ], // _outputToNativeRoute
    "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234", // _booster
    162, // _pid
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"], // _nativeToLp0
    ["0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _lp0ToLp1
    ["0xba100000625a3754423978a60c9317c58a424e3D", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _outputToNative
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraGyroMainnet>;

// eslint-disable-next-line camelcase
export class BalancerAuraWSTETH_ETHDeployer extends VaultDeployer<
  StrategyAuraGyroMainnet,
  // eslint-disable-next-line camelcase
  StrategyAuraGyroMainnet__factory,
  StrategyConstructorParams<StrategyAuraGyroMainnet>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyAuraGyroMainnet>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Balancer Aura wstETH-ETH";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyAuraGyroMainnet> {
    return getBalancerAuraWSTETH_ETHInitializeParams(commonParameters);
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }
  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aura-gyro-wsteth-eth",
      name: "Gyroscope wstETH-ETH",
      token: "Gyroscrope wstETH-ETH eth",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "aura-gyro-wsteth-eth",
      status: "active",
      platformId: "aura",
      assets: ["wstETH", "ETH"],
      risks: ["COMPLEXITY_MID", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp-locked",
      addLiquidityUrl: "https://app.gyro.finance/pools/ethereum/e-clp/0xf01b0684C98CD7aDA480BFDF6e43876422fa1Fc1/",
      removeLiquidityUrl: "https://app.gyro.finance/pools/ethereum/e-clp/0xf01b0684C98CD7aDA480BFDF6e43876422fa1Fc1/",
      earnLpHelperType: LpHelperType.BALANCER_AURA_GYRO,
      ...getZapMetadata(ZapCategory.BALANCER_AURA_ETH, ZapTypeBalancerAuraEth.BALANCER_AURA_GYRO),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyAuraGyroMainnet__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyAuraGyroMainnet__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BalancerAuraWSTETH_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new BalancerAuraWSTETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BalancerAuraWSTETH_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BalancerAuraWSTETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...(this.strategyConfig ?? {}),
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
