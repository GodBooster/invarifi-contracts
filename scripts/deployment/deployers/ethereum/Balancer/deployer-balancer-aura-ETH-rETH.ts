/* 

StrategyAuraBalancerMultiRewardGaugeUniV3

Function: initialize(
    address, 
    bool, 
    (bytes32,uint256,uint256)[], 
    (bytes32,uint256,uint256)[], 
    address, 
    uint256,
    address[], 
    address[], 
    (address,address,address,address,address,address)
)

#	Name	Type	Data
1	_want	address	0x1E19CF2D73a72Ef1332C882F20534B6519Be0276
2	_inputIsComposable	bool	false
2	_nativeToInputRoute.poolId	bytes32	0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080
2	_nativeToInputRoute.assetInIndex	uint256	0
2	_nativeToInputRoute.assetOutIndex	uint256	1
3	_outputToNativeRoute.poolId	bytes32	0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014
3	_outputToNativeRoute.assetInIndex	uint256	0
3	_outputToNativeRoute.assetOutIndex	uint256	1
5	_booster	address	0xA57b8d98dAE62B26Ec3bcC4a365338157060B234
6	_pid	uint256	109
6	_nativeToInput	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
7	_nativeToInput	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
8	_outputToNative	address	0xba100000625a3754423978a60c9317c58a424e3D
9	_outputToNative	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
10	_commonAddresses.vault	address	0x8A70759D7B41bc42cE7b46d20fA749e4656E87D5
10	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
10	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
10	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
10	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
10	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd
*/

import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import {
  StrategyAuraBalancerMultiRewardGaugeUniV3,
  // eslint-disable-next-line camelcase
  StrategyAuraBalancerMultiRewardGaugeUniV3__factory,
} from "../../../../../typechain-types";
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeBalancerAuraEth } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";
export const getInitalizeParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276", // _want
    false, // _inputIsComposable
    [
      {
        poolId: "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080",
        assetInIndex: 0,
        assetOutIndex: 1,
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
    109, // _pid
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _nativeToInput
    ["0xba100000625a3754423978a60c9317c58a424e3D", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _outputToNative
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraBalancerMultiRewardGaugeUniV3>;

// eslint-disable-next-line camelcase
export class BalancerAuraETH_RETHDeployer extends VaultDeployer<
  StrategyAuraBalancerMultiRewardGaugeUniV3,
  // eslint-disable-next-line camelcase
  StrategyAuraBalancerMultiRewardGaugeUniV3__factory,
  StrategyConstructorParams<StrategyAuraBalancerMultiRewardGaugeUniV3>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyAuraBalancerMultiRewardGaugeUniV3>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Balancer Aura ETH-rETH";
  }

  override defaultStrategyParams(commonParameters: CommonAddressesAccessableStruct) {
    return getInitalizeParams(commonParameters);
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aura-reth-weth",
      name: "rETH-ETH",
      token: "rETH-ETH",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "aura-reth-weth",
      status: "active",
      platformId: "aura",
      assets: ["rETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/pool/0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112/invest",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/pool/0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112/withdraw",
      earnLpHelperType: LpHelperType.BALANCER_AURA_GAUGE,
      ...getZapMetadata(ZapCategory.BALANCER_AURA_ETH, ZapTypeBalancerAuraEth.BALANCER_AURA_MULTI_REWARD),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyAuraBalancerMultiRewardGaugeUniV3__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyAuraBalancerMultiRewardGaugeUniV3__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BalancerAuraETH_RETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new BalancerAuraETH_RETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BalancerAuraETH_RETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BalancerAuraETH_RETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }

  // override async unirouter() {
  //   return await this.
  // }
}
