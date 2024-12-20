// eslint-disable-next-line node/no-missing-import
import {
    StrategyStargateArb,
    StrategyStargateArb__factory
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
export const getStargateUSDT_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641",
    1,
    "0x9774558534036Ff2E236331546691b4eB70594b1",
    "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614",
    2,
    "0x912ce59144191c1204e64559fe8253a0e49e65480001f482af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0x912ce59144191c1204e64559fe8253a0e49e65480001f482af49447d8a07e3bd95bd0d56f35241523fbab10001f4fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateArb>;

// eslint-disable-next-line camelcase
export class ArbStargateUSDT_LPDeployer extends VaultDeployer<
  StrategyStargateArb,
  // eslint-disable-next-line camelcase
  StrategyStargateArb__factory,
  StrategyConstructorParams<StrategyStargateArb>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateArb>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Stargate USDT LP";
  }

  override async unirouter() {
    return "0xe592427a0aece92de3edee1f18e0157c05861564";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateArb> {
    return getStargateUSDT_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-arb-usdt",
      name: "USDT LP",
      token: "S*USDT",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-arb-usdt",
      status: "active",
      platformId: "stargate",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/42161/unified/swap/ETH/USDT",
      addLiquidityUrl: "https://stargate.finance/pool/USDT-ARBITRUM/add",
      removeLiquidityUrl: "https://stargate.finance/pool/USDT-ARBITRUM/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateArb__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateArb__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbStargateUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbStargateUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
