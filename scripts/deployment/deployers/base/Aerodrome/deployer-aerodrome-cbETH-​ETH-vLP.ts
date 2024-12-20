import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line camelcase
import { StrategyVelodromeGaugeV2, StrategyVelodromeGaugeV2__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getAerodrome_cbETH_ETH_vLPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91",
    "0xDf9D427711CCE46b52fEB6B2a20e4aEaeA12B2b7",
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
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
      {
        from: "0x4200000000000000000000000000000000000006",
        to: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
  ] as StrategyConstructorParams<StrategyVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class BaseAerodromecbETH_ETH_vLPDeployer extends VaultDeployer<
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
    return "BASE Aerodrome cbETH-​ETH vLP";
  }

  override async unirouter() {
    return "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyVelodromeGaugeV2> {
    return getAerodrome_cbETH_ETH_vLPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "aerodrome-cbeth-weth",
      name: "cbETH-ETH vLP",
      token: "vAMM-cbETH/WETH",
      tokenProviderId: "aerodrome",
      oracle: "lps",
      oracleId: "aerodrome-cbeth-weth",
      status: "active",
      platformId: "aerodrome",
      assets: ["cbETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://aerodrome.finance/deposit?token0=0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22&token1=0x4200000000000000000000000000000000000006&stable=false",
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
  override async deployStrategyMaster(): Promise<BaseAerodromecbETH_ETH_vLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseAerodromecbETH_ETH_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseAerodromecbETH_ETH_vLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseAerodromecbETH_ETH_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
