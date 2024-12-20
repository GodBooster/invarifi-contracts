// eslint-disable-next-line node/no-missing-import
import {
    StrategyStargateArbNative,
    StrategyStargateArbNative__factory,
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import

// eslint-disable-next-line camelcase
export const getStargateETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e",
    2,
    "0x9774558534036Ff2E236331546691b4eB70594b1",
    "0xbf22f0f184bCcbeA268dF387a49fF5238dD23E40",
    "0x912ce59144191c1204e64559fe8253a0e49e65480001f482af49447d8a07e3bd95bd0d56f35241523fbab1",
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateArbNative>;

// eslint-disable-next-line camelcase
export class ArbStargateETH_LPDeployer extends VaultDeployer<
  StrategyStargateArbNative,
  // eslint-disable-next-line camelcase
  StrategyStargateArbNative__factory,
  StrategyConstructorParams<StrategyStargateArbNative>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateArbNative>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Stargate ETH LP";
  }

  override async unirouter() {
    return "0xe592427a0aece92de3edee1f18e0157c05861564";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateArbNative> {
    return getStargateETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-arb-eth",
      name: "ETH LP",
      token: "S*ETH",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-arb-eth",
      status: "active",
      platformId: "stargate",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/42161/unified/swap/USDC/ETH",
      addLiquidityUrl: "https://stargate.finance/pool/eth-arbitrum/add",
      removeLiquidityUrl: "https://stargate.finance/pool/eth-arbitrum/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateArbNative__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateArbNative__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbStargateETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbStargateETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
