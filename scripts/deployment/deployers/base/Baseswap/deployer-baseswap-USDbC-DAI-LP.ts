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
export const getBaseswap_USDbC_DAI_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x6D3c5a4a7aC4B1428368310E4EC3bB1350d01455",
    "0xEC652B590Fe21dcd18Ea01253B5152b202cc3dEb",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    [
      "0x4200000000000000000000000000000000000006",
      "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    ],
    ["0x4200000000000000000000000000000000000006", "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

// eslint-disable-next-line camelcase
export class BaseBaseswap_USDbC_DAI_LPDeployer extends VaultDeployer<
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
    return "BASE Baseswap USDbC-DAI LP";
  }

  override async unirouter() {
    return "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBaseSwap> {
    return getBaseswap_USDbC_DAI_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "baseswap-dai-usdbc",
      name: "USDbC-DAI LP",
      token: "USDbC-DAI LP",
      tokenProviderId: "baseswap",
      oracle: "lps",
      oracleId: "baseswap-dai-usdbc",
      status: "active",
      platformId: "baseswap",
      assets: ["DAI", "USDbC"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://baseswap.fi/add/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      removeLiquidityUrl:
        "https://baseswap.fi/remove/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
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
  override async deployStrategyMaster(): Promise<BaseBaseswap_USDbC_DAI_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBaseswap_USDbC_DAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBaseswap_USDbC_DAI_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBaseswap_USDbC_DAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
