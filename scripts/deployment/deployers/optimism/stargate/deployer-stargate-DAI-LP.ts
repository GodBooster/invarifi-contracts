import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateSolidly, StrategyStargateSolidly__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getOpStargateDaiLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x165137624F1f692e69659f944BF69DE02874ee27",
    2,
    "0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2",
    "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    3,
    commonParameters,
    [
      {
        from: "0x4200000000000000000000000000000000000042",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
      },
    ],
    [
      {
        from: "0x4200000000000000000000000000000000000042",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        stable: true,
      },
    ],
  ] as StrategyConstructorParams<StrategyStargateSolidly>;

// eslint-disable-next-line camelcase
export class OpStargateDAI_LPDeployer extends VaultDeployer<
  StrategyStargateSolidly,
  // eslint-disable-next-line camelcase
  StrategyStargateSolidly__factory,
  StrategyConstructorParams<StrategyStargateSolidly>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateSolidly>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP Stargate DAI LP";
  }

  override async unirouter() {
    return "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateSolidly> {
    return getOpStargateDaiLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-op-dai",
      name: "DAI LP",
      token: "S*DAI",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-op-dai",
      status: "active",
      platformId: "stargate",
      assets: ["DAI"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/10/unified/swap/ETH/DAI",
      addLiquidityUrl: "https://stargate.finance/pool/dai-optimism",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateSolidly__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateSolidly__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpStargateDAI_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpStargateDAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpStargateDAI_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpStargateDAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
