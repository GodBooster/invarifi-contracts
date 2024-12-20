import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateBridgeBal, StrategyStargateBridgeBal__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getStargateUSDbC_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA",
    "0xE3B53AF74a4BF62Ae5511055290838050bf764Df",
    1,
    "0x06Eb48763f117c7Be887296CDcdfad2E4092739C",
    "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B",
    1,
    50000000000000000000n,
    "0xC8C86F0A4879A0479554c7599dDe3ef51614996E",
    [
      "0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d",
      "0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c",
    ],
    [
      "0x4200000000000000000000000000000000000006",
      "0x6FbFcf88DB1aADA31F34215b2a1Df7fafb4883e9",
      "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateBridgeBal>;

// eslint-disable-next-line camelcase
export class BaseStargateUSDbC_LPDeployer extends VaultDeployer<
  StrategyStargateBridgeBal,
  // eslint-disable-next-line camelcase
  StrategyStargateBridgeBal__factory,
  StrategyConstructorParams<StrategyStargateBridgeBal>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateBridgeBal>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BASE_MAINNET;
  }

  override rawVaultName() {
    return "BASE Stargate USDbC LP";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateBridgeBal> {
    return getStargateUSDbC_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-base-usdbc",
      name: "USDbC LP",
      token: "S*USDbC",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-base-usdbc",
      status: "active",
      platformId: "stargate",
      assets: ["USDbC"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.balancer.fi/#/base/swap?outputCurrency=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      addLiquidityUrl: "https://stargate.finance/pool/USDC-BASE/add",
      removeLiquidityUrl: "https://stargate.finance/pool/USDC-BASE/remove",
      earnLpHelperType: LpHelperTypeUniV2.V2_STARGATE_BASE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateBridgeBal__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateBridgeBal__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BaseStargateUSDbC_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseStargateUSDbC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseStargateUSDbC_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseStargateUSDbC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
