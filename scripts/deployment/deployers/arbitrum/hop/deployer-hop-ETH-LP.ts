// eslint-disable-next-line node/no-missing-import
import {
    StrategyHopCamelot,
    StrategyHopCamelot__factory
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import

// eslint-disable-next-line camelcase
export const getArbHopETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x59745774Ed5EfF903e615F5A2282Cae03484985a",
    "0x755569159598f3702bdD7DFF6233A317C156d3Dd",
    "0x652d27c0F72771Ce5C76fd400edD61B406Ac6D97",
    ["0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    ["0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopCamelot>;

// eslint-disable-next-line camelcase
export class ArbHopETH_LPDeployer extends VaultDeployer<
  StrategyHopCamelot,
  // eslint-disable-next-line camelcase
  StrategyHopCamelot__factory,
  StrategyConstructorParams<StrategyHopCamelot>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyHopCamelot>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Hop ETH LP";
  }

  override async unirouter() {
    return "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopCamelot> {
    return getArbHopETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    // TODO: change me
    return this.withDefaultMetadata({
      id: "hop-arb-eth",
      name: "ETH LP",
      token: "ETH-hETH LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-arb-eth",
      status: "active",
      platformId: "hop",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/42161/unified/swap/USDC/ETH",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=ETH&sourceNetwork=arbitrum",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=ETH&sourceNetwork=arbitrum",
      earnLpHelperType: LpHelperType.HOP,
      ...getZapMetadata(ZapCategory.HOP, ZapTypeHop.HOP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyHopCamelot__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyHopCamelot__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbHopETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbHopETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbHopETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbHopETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
