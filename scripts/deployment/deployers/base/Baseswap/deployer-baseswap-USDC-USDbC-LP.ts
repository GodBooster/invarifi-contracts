import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    StrategyBaseSwap,
    StrategyBaseSwap__factory
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import {
    VaultDeployer,
    VaultMetadata,
    ZapTypeCommon,
    getZapMetadata
} from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getBaseswap_USDC_USDbC_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xC52328d5Af54A12DA68459Ffc6D0845e91a8395F",
    "0xD239824786D69627bc048Ee258943F2096Cf2Ab7",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
    [
      "0x4200000000000000000000000000000000000006",
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

// eslint-disable-next-line camelcase
export class BaseBaseswap_USDC_USDbC_LPDeployer extends VaultDeployer<
  StrategyBaseSwap,
  // eslint-disable-next-line camelcase
  StrategyBaseSwap__factory,
  StrategyConstructorParams<StrategyBaseSwap>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyBaseSwap>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BASE_MAINNET;
  }

  override rawVaultName() {
    return "BASE Baseswap USDC-USDbC LP";
  }

  override async unirouter() {
    return "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBaseSwap> {
    return getBaseswap_USDC_USDbC_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "baseswap-usdc-usdbc",
      name: "USDC-USDbC LP",
      token: "USDC-USDbC LP",
      tokenProviderId: "baseswap",
      oracle: "lps",
      oracleId: "baseswap-usdc-usdbc",
      status: "active",
      platformId: "baseswap",
      assets: ["USDC", "USDbC"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://baseswap.fi/add/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      removeLiquidityUrl:
        "https://baseswap.fi/remove/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      earnLpHelperType: LpHelperTypeUniV2.V2_UNI_V2_BASE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyBaseSwap__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyBaseSwap__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BaseBaseswap_USDC_USDbC_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBaseswap_USDC_USDbC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBaseswap_USDC_USDbC_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBaseswap_USDC_USDbC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
