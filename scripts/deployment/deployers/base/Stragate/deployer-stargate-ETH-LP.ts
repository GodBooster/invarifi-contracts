import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateBridgeBal, StrategyStargateBridgeBal__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getStargateETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x28fc411f9e1c480AD312b3d9C60c22b965015c6B",
    "0xE3B53AF74a4BF62Ae5511055290838050bf764Df",
    0,
    "0x06Eb48763f117c7Be887296CDcdfad2E4092739C",
    "0x50B6EbC2103BFEc165949CC946d739d5650d7ae4",
    0,
    50000000000000000000n,
    "0xC8C86F0A4879A0479554c7599dDe3ef51614996E",
    ["0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d"],
    ["0x4200000000000000000000000000000000000006"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateBridgeBal>;

// eslint-disable-next-line camelcase
export class BaseStargateETH_LPDeployer extends VaultDeployer<
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
    return "BASE Stargate ETH LP";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateBridgeBal> {
    return getStargateETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-base-eth",
      name: "ETH LP",
      token: "S*SGETH",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-base-eth",
      status: "active",
      platformId: "stargate",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.balancer.fi/#/base/swap?outputCurrency=0x4200000000000000000000000000000000000006",
      addLiquidityUrl: "https://stargate.finance/pool/ETH-BASE/add",
      removeLiquidityUrl: "https://stargate.finance/pool/ETH-BASE/remove",
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
  override async deployStrategyMaster(): Promise<BaseStargateETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseStargateETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
