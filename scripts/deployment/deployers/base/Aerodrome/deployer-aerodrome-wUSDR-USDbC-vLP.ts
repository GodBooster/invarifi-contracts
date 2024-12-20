import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line camelcase
import { StrategyVelodromeGaugeV2, StrategyVelodromeGaugeV2__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getAerodrome_wUSDR_USDbC_vLPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x3Fc28BFac25fC8e93B5b2fc15EfBBD5a8aA44eFe",
    "0xF64957C35409055776C7122AC655347ef88eaF9B",
    commonParameters,
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
      {
        from: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        to: "0x9483ab65847A447e36d21af1CaB8C87e9712ff93",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
  ] as StrategyConstructorParams<StrategyVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class BaseAerodromewUSDR_USDbC_vLPDeployer extends VaultDeployer<
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
    return "BASE Aerodrome wUSDR-​USDbC vLP";
  }

  override async unirouter() {
    return "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyVelodromeGaugeV2> {
    return getAerodrome_wUSDR_USDbC_vLPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aerodrome-wusdr-usdbc",
      name: "wUSDR-USDbC vLP",
      token: "vAMM-wUSDR/USDbC",
      tokenProviderId: "aerodrome",
      oracle: "lps",
      oracleId: "aerodrome-wusdr-usdbc",
      status: "active",
      platformId: "aerodrome",
      assets: ["wUSDR", "USDbC"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://aerodrome.finance/deposit?token0=0x9483ab65847a447e36d21af1cab8c87e9712ff93&token1=0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca&stable=false",
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
  override async deployStrategyMaster(): Promise<BaseAerodromewUSDR_USDbC_vLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseAerodromewUSDR_USDbC_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseAerodromewUSDR_USDbC_vLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseAerodromewUSDR_USDbC_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
