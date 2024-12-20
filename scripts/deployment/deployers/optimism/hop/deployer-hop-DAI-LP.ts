import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopSolidly, StrategyHopSolidly__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

export const getOpHopDaiLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x22D63A26c730d49e5Eab461E4f5De1D8BdF89C92",
    "0x392B9780cFD362bD6951edFA9eBc31e68748b190",
    "0xF181eD90D6CfaC84B8073FdEA6D34Aa744B41810",
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
      {
        from: "0x4200000000000000000000000000000000000006",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        stable: false,
      },
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopSolidly>;

// eslint-disable-next-line camelcase
export class OpHopDai_LPDeployer extends VaultDeployer<
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
    return "OP Hop DAI LP";
  }

  override async unirouter() {
    return "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopSolidly> {
    return getOpHopDaiLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-op-dai",
      name: "DAI LP",
      token: "DAI-hDAI LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-op-dai",
      status: "active",
      platformId: "hop",
      assets: ["DAI"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/10/unified/swap/ETH/DAI",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=optimism",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=DAI&sourceNetwork=optimism",
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
  override async deployStrategyMaster(): Promise<OpHopDai_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpHopDai_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpHopDai_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpHopDai_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
