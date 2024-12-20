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
export const getBaseswap_DAI_ETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x0FeB1490f80B6978002c3E501753562f2F2853B2",
    "0x612E2527b37CC5c46df1cfd172456E4DD507Cf09",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006", "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

// eslint-disable-next-line camelcase
export class BaseBaseswap_DAI_ETH_LPDeployer extends VaultDeployer<
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
    return "BASE Baseswap DAI-ETH LP";
  }

  override async unirouter() {
    return "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBaseSwap> {
    return getBaseswap_DAI_ETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "baseswap-weth-dai",
      name: "DAI-ETH LP",
      token: "DAI-ETH LP",
      tokenProviderId: "baseswap",
      oracle: "lps",
      oracleId: "baseswap-weth-dai",
      status: "active",
      platformId: "baseswap",
      assets: ["DAI", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://baseswap.fi/add/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb/0x4200000000000000000000000000000000000006",
      removeLiquidityUrl:
        "https://baseswap.fi/remove/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb/0x4200000000000000000000000000000000000006",
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
  override async deployStrategyMaster(): Promise<BaseBaseswap_DAI_ETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBaseswap_DAI_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBaseswap_DAI_ETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBaseswap_DAI_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
