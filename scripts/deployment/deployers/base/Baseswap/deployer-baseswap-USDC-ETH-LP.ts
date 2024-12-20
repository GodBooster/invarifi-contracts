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
export const getBaseswap_USDC_ETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xab067c01C7F5734da168C699Ae9d23a4512c9FdB",
    "0x179A0348DeCf6CBF2cF7b0527E3D6260e2068552",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

// eslint-disable-next-line camelcase
export class BaseBaseswap_USDC_ETH_LPDeployer extends VaultDeployer<
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
    return "BASE Baseswap USDC-ETH LP";
  }

  override async unirouter() {
    return "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBaseSwap> {
    return getBaseswap_USDC_ETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "baseswap-weth-usdc",
      name: "USDC-ETH LP",
      token: "USDC-ETH LP",
      tokenProviderId: "baseswap",
      oracle: "lps",
      oracleId: "baseswap-weth-usdc",
      status: "active",
      platformId: "baseswap",
      assets: ["USDC", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://baseswap.fi/add/0x4200000000000000000000000000000000000006/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      removeLiquidityUrl:
        "https://baseswap.fi/remove/0x4200000000000000000000000000000000000006/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
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
  override async deployStrategyMaster(): Promise<BaseBaseswap_USDC_ETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBaseswap_USDC_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBaseswap_USDC_ETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBaseswap_USDC_ETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
