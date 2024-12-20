// Function: initialize(address, bool, (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], address, uint256, bool, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7
// 2	_inputIsComposable	bool	true
// 2	_nativeToInputRoute.poolId	bytes32	0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080
// 2	_nativeToInputRoute.assetInIndex	uint256	0
// 2	_nativeToInputRoute.assetOutIndex	uint256	1
// 3	_nativeToInputRoute.poolId	bytes32	0x42ed016f826165c2e5976fe5bc3df540c5ad0af700000000000000000000058b
// 3	_nativeToInputRoute.assetInIndex	uint256	1
// 3	_nativeToInputRoute.assetOutIndex	uint256	2
// 4	_outputToNativeRoute.poolId	bytes32	0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014
// 4	_outputToNativeRoute.assetInIndex	uint256	0
// 4	_outputToNativeRoute.assetOutIndex	uint256	1
// 6	_booster	address	0xA57b8d98dAE62B26Ec3bcC4a365338157060B234
// 7	_pid	uint256	139
// 8	_composable	bool	true
// 8	_nativeToInput	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 9	_nativeToInput	address	0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0
// 10	_nativeToInput	address	0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7
// 11	_outputToNative	address	0xba100000625a3754423978a60c9317c58a424e3D
// 12	_outputToNative	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 13	_commonAddresses.vault	address	0xd4D620B23E91031fa08045b6083878f42558d6b9
// 13	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 13	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 13	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
// 13	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 13	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line node/no-missing-import
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeBalancerAuraEth } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import,camelcase
import { StrategyAuraMainnet, StrategyAuraMainnet__factory } from "../../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// eslint-disable-next-line camelcase
export const getBalancerAuraWSTETH_RETH_SFRXETHInitializeParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7", // _want
    false, // _inputIsComposable
    [
      {
        poolId: "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080",
        assetInIndex: 0, // wstETH
        assetOutIndex: 1, // wETH
      },
      {
        poolId: "0x42ed016f826165c2e5976fe5bc3df540c5ad0af700000000000000000000058b",
        assetInIndex: 1, // wstETH
        assetOutIndex: 2, // sfrxETH
      },
    ], // _nativeToInputRoute
    [
      {
        poolId: "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ], // _outputToNativeRoute
    "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234", // _booster
    139, // _pid
    true, // composable
    [
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      "0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7",
      "0xba100000625a3754423978a60c9317c58a424e3D",
    ], // _nativeToInput
    ["0xba100000625a3754423978a60c9317c58a424e3D", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _outputToNative
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraMainnet>;

// eslint-disable-next-line camelcase
export class BalancerAuraWSTETH_RETH_SFRXETHDeployer extends VaultDeployer<
  StrategyAuraMainnet,
  // eslint-disable-next-line camelcase
  StrategyAuraMainnet__factory,
  StrategyConstructorParams<StrategyAuraMainnet>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyAuraMainnet>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Balancer Aura wstETH-rETH-sfrxETH";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyAuraMainnet> {
    return getBalancerAuraWSTETH_RETH_SFRXETHInitializeParams(commonParameters);
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aura-wsteth-reth-sfrxeth-v3",
      name: "wstETH/rETH/sfrxETH V3",
      token: "wstETH/rETH/sfrxETH V3",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "aura-wsteth-reth-sfrxeth-v3",
      status: "active",
      platformId: "aura",
      assets: ["wstETH", "rETH", "sfrxETH"],
      risks: ["COMPLEXITY_MID", "IL_NONE", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/ethereum/pool/0x42ed016f826165c2e5976fe5bc3df540c5ad0af700000000000000000000058b/invest",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/ethereum/pool/0x42ed016f826165c2e5976fe5bc3df540c5ad0af700000000000000000000058b/withdraw",
      earnLpHelperType: LpHelperType.BALANCER_AURA,
      ...getZapMetadata(ZapCategory.BALANCER_AURA_ETH, ZapTypeBalancerAuraEth.BALANCER_AURA),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyAuraMainnet__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyAuraMainnet__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BalancerAuraWSTETH_RETH_SFRXETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new BalancerAuraWSTETH_RETH_SFRXETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BalancerAuraWSTETH_RETH_SFRXETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BalancerAuraWSTETH_RETH_SFRXETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
