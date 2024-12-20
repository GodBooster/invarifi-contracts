import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopSolidly, StrategyHopSolidly__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

export const getOpHopUSDCeLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x2e17b8193566345a2Dd467183526dEdc42d2d5A8",
    "0xf587B9309c603feEdf0445aF4D3B21300989e93a",
    "0x3c0FFAca566fCcfD9Cc95139FEF6CBA143795963",
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
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopSolidly>;

// eslint-disable-next-line camelcase
export class OpHopUSDCe_LPDeployer extends VaultDeployer<
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
    return "OP Hop USDCe LP";
  }

  override async unirouter() {
    return "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopSolidly> {
    return getOpHopUSDCeLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-op-usdc",
      name: "USDCe LP",
      token: "USDCe-hUSDC LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-op-usdc",
      status: "active",
      platformId: "hop",
      assets: ["opUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/10/unified/swap/ETH/USDCe",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=USDCe&sourceNetwork=optimism",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=USDCe&sourceNetwork=optimism",
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
  override async deployStrategyMaster(): Promise<OpHopUSDCe_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpHopUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpHopUSDCe_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpHopUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
