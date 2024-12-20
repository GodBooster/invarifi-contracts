import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyBaseSwap, StrategyBaseSwap__factory } from "../../../../../typechain-types";
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
export const getBaseswap_axlUSDC_ETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x9A0b05F3cF748A114A4f8351802b3BFfE07100D4",
    "0x7d3cab8613e18534A2C11277b8EF2AaCaD94f842",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006", "0xEB466342C4d449BC9f53A865D5Cb90586f405215"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

// eslint-disable-next-line camelcase
export class BaseBaseswap_axlUSDC_ETH_LPDeployer extends VaultDeployer<
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
    return "BASE Baseswap axlUSDC-ETH LP";
  }

  override async unirouter() {
    return "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBaseSwap> {
    return getBaseswap_axlUSDC_ETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "baseswap-weth-axlusdc",
      name: "axlUSDC-ETH LP",
      token: "axlUSDC-ETH LP",
      tokenProviderId: "baseswap",
      oracle: "lps",
      oracleId: "baseswap-weth-axlusdc",
      status: "active",
      platformId: "baseswap",
      assets: ["axlUSDC", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://baseswap.fi/add/0x4200000000000000000000000000000000000006/0xEB466342C4d449BC9f53A865D5Cb90586f405215",
      removeLiquidityUrl:
        "https://baseswap.fi/remove/0x4200000000000000000000000000000000000006/0xEB466342C4d449BC9f53A865D5Cb90586f405215",
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
  override async deployStrategyMaster(): Promise<BaseBaseswap_axlUSDC_ETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBaseswap_axlUSDC_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBaseswap_axlUSDC_ETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBaseswap_axlUSDC_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
