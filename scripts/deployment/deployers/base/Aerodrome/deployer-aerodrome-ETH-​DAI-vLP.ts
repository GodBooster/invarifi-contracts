import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line camelcase
import { StrategyVelodromeGaugeV2, StrategyVelodromeGaugeV2__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getAerodrome_ETH_DAI_vLPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x9287C921f5d920cEeE0d07d7c58d476E46aCC640",
    "0x36BdA777CCBefE881ed729AfF7F1f06779f4199a",
    commonParameters,
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x0000000000000000000000000000000000000000",
      },
      {
        from: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x0000000000000000000000000000000000000000",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x0000000000000000000000000000000000000000",
      },
      {
        from: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x0000000000000000000000000000000000000000",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x0000000000000000000000000000000000000000",
      },
      {
        from: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        to: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        stable: true,
        factory: "0x0000000000000000000000000000000000000000",
      },
    ],
  ] as StrategyConstructorParams<StrategyVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class BaseAerodrome_ETH_DAI_vLPDeployer extends VaultDeployer<
  StrategyVelodromeGaugeV2,
  // eslint-disable-next-line camelcase
  StrategyVelodromeGaugeV2__factory,
  StrategyConstructorParams<StrategyVelodromeGaugeV2>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyVelodromeGaugeV2>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BASE_MAINNET;
  }

  override rawVaultName() {
    return "BASE Aerodrome ETH-DAI vLP";
  }

  override async unirouter() {
    return "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyVelodromeGaugeV2> {
    return getAerodrome_ETH_DAI_vLPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aerodrome-weth-dai",
      name: "ETH-DAI vLP",
      token: "vAMM-WETH-DAI",
      tokenProviderId: "aerodrome",
      oracle: "lps",
      oracleId: "aerodrome-weth-dai",
      status: "active",
      platformId: "aerodrome",
      assets: ["WETH", "DAI"],
      risks: ["COMPLEXITY_LOW", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://aerodrome.finance/connect?token0=0x4200000000000000000000000000000000000006&token1=0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb&stable=false",
      removeLiquidityUrl: "https://aerodrome.finance/withdraw",
      earnLpHelperType: LpHelperTypeUniV2.V2_VELODROME,
      ...getZapMetadata(ZapCategory.VELODROME, ZapTypeVelodrome.VELODROME),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyVelodromeGaugeV2__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyVelodromeGaugeV2__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BaseAerodrome_ETH_DAI_vLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseAerodrome_ETH_DAI_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseAerodrome_ETH_DAI_vLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseAerodrome_ETH_DAI_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
