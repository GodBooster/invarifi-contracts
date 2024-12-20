// eslint-disable-next-line node/no-missing-import
import {
    StrategyStargatePoly,
    StrategyStargatePoly__factory
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import

// eslint-disable-next-line camelcase
export const getStargateUSDT_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
    1,
    2,
    {
      outputToStablePool: "0xcA5953773602e8C789f0635F40e05e816165B85c",
      outputToStableRoute: ["0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"],
      stableToInputRoute: ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
      stableToNativeRoute: ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"],
    },
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargatePoly>;

// eslint-disable-next-line camelcase
export class PolyStargateUSDT_LPDeployer extends VaultDeployer<
  StrategyStargatePoly,
  // eslint-disable-next-line camelcase
  StrategyStargatePoly__factory,
  StrategyConstructorParams<StrategyStargatePoly>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargatePoly>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.POLYGON_MAINNET;
  }

  override rawVaultName() {
    return "Poly Stargate USDT LP";
  }

  override async unirouter() {
    return "0xc5017BE80b4446988e8686168396289a9A62668E";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargatePoly> {
    return getStargateUSDT_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-polygon-usdt",
      name: "USDT LP",
      token: "S*USDT",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-polygon-usdt",
      status: "active",
      platformId: "stargate",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://quickswap.exchange/#/swap?outputCurrency=0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      addLiquidityUrl: "https://stargate.finance/pool/USDT-POLYGON/add",
      removeLiquidityUrl: "https://stargate.finance/pool/usdt-polygon/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargatePoly__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargatePoly__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<PolyStargateUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new PolyStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<PolyStargateUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new PolyStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
