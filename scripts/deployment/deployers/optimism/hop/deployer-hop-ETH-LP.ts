import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopSolidly, StrategyHopSolidly__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

export const getOpHopEthLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x5C2048094bAaDe483D0b1DA85c3Da6200A88a849",
    "0x95d6A95BECfd98a7032Ed0c7d950ff6e0Fa8d697",
    "0xaa30D6bba6285d0585722e2440Ff89E23EF68864",
    [
      {
        from: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
      },
    ],
    [
      {
        from: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
      },
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopSolidly>;

// eslint-disable-next-line camelcase
export class OpHopETH_LPDeployer extends VaultDeployer<
  StrategyHopSolidly,
  // eslint-disable-next-line camelcase
  StrategyHopSolidly__factory,
  StrategyConstructorParams<StrategyHopSolidly>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyHopSolidly>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP Hop ETH LP";
  }

  override async unirouter() {
    return "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopSolidly> {
    return getOpHopEthLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-op-eth",
      name: "ETH LP",
      token: "ETH-hETH LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-op-eth",
      status: "active",
      platformId: "hop",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/10/unified/swap/USDCe/ETH",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=ETH&sourceNetwork=optimism",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=ETH&sourceNetwork=optimism",
      earnLpHelperType: LpHelperType.HOP,
      ...getZapMetadata(ZapCategory.HOP, ZapTypeHop.HOP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyHopSolidly__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyHopSolidly__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpHopETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpHopETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpHopETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpHopETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
