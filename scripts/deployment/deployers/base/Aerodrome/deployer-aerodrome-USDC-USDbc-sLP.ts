import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line camelcase
import { StrategyVelodromeGaugeV2, StrategyVelodromeGaugeV2__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getAerodrome_USDC_USDbc_sLPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD",
    "0x1Cfc45C5221A07DA0DE958098A319a29FbBD66fE",
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
        to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        stable: true,
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
    ],
  ] as StrategyConstructorParams<StrategyVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class BaseAerodrome_USDC_USDbc_sLPDeployer extends VaultDeployer<
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
    return "BASE Aerodrome USDC-USDbC sLP";
  }

  override async unirouter() {
    return "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyVelodromeGaugeV2> {
    return getAerodrome_USDC_USDbc_sLPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aerodrome-usdc-usdbc",
      name: "USDC-USDbc sLP",
      token: "sAMM-UDSC-USDbC",
      tokenProviderId: "aerodrome",
      oracle: "lps",
      oracleId: "aerodrome-usdc-usdbc",
      status: "active",
      platformId: "aerodrome",
      assets: ["USDC", "USDbC"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://aerodrome.finance/connect?token0=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&token1=0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA&stable=true",
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
  override async deployStrategyMaster(): Promise<BaseAerodrome_USDC_USDbc_sLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseAerodrome_USDC_USDbc_sLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseAerodrome_USDC_USDbc_sLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseAerodrome_USDC_USDbc_sLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
