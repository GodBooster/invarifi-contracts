// eslint-disable-next-line node/no-missing-import
import {
    StrategyQuickGamma,
    StrategyQuickGamma__factory
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { Network } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import

// eslint-disable-next-line camelcase
export const getQuickSwapGammaUSDC_DAI_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x9E31214Db6931727B7d63a0D2b6236DB455c0965",
    "0x20ec0d06F447d550fC6edee42121bc8C1817b97D",
    10,
    "0xb5c064f955d8e7f38fe0460c556a72987494ee170d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12702791bca1f2de4661ed88a30c99a7a9449aa84174",
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12702791bca1f2de4661ed88a30c99a7a9449aa841748f3cf7ad23cd3cadbd9735aff958023239c6a063",
    commonParameters,
  ] as StrategyConstructorParams<StrategyQuickGamma>;

// eslint-disable-next-line camelcase
export class PolyQuckSwapGammaUSDC_DAI_LPDeployer extends VaultDeployer<
  StrategyQuickGamma,
  // eslint-disable-next-line camelcase
  StrategyQuickGamma__factory,
  StrategyConstructorParams<StrategyQuickGamma>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyQuickGamma>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.POLYGON_MAINNET;
  }

  override rawVaultName() {
    return "Poly QuickSwap Gamma USDC-DAI LP";
  }

  override async unirouter() {
    return "0xf5b509bB0909a69B1c207E495f687a596C168E12";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyQuickGamma> {
    return getQuickSwapGammaUSDC_DAI_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "quick-gamma-usdc-dai-narrow",
      name: "USDC-DAI Stable LP",
      token: "awUSDC-DAI",
      tokenProviderId: "quickswap",
      oracle: "lps",
      oracleId: "quick-gamma-usdc-dai-narrow",
      status: "active",
      platformId: "gamma",
      assets: ["USDC", "DAI"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl:
        "https://quickswap.exchange/#/pools?currency0=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174&currency1=0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      removeLiquidityUrl:
        "https://quickswap.exchange/#/pools?currency0=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174&currency1=0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      // TODO: zap metadata
      // ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyQuickGamma__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyQuickGamma__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<PolyQuckSwapGammaUSDC_DAI_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new PolyQuckSwapGammaUSDC_DAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<PolyQuckSwapGammaUSDC_DAI_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new PolyQuckSwapGammaUSDC_DAI_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
