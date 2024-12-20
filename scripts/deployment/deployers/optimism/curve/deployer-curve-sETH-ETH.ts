import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyCurveLPUniV3Router, StrategyCurveLPUniV3Router__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import {
    VaultDeployer,
    VaultMetadata,
    ZapTypeCurveOp,
    getZapMetadata
} from "../../../types/vault-deployer";

export const getOpCurveSETH_ETH_Params = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x7Bc5728BC2b59B45a58d9A576E2Ffc5f0505B35E",
    "0xabC000d88f23Bb45525E447528DBF656A9D55bf5",
    "0xCB8883D1D8c560003489Df43B30612AAbB8013bb",
    "0x7Bc5728BC2b59B45a58d9A576E2Ffc5f0505B35E",
    [2, 0, 0, 0],
    [
      "0x0994206dfe8de6ec6920ff4d779b0d950605fb53000bb84200000000000000000000000000000000000006",
      "0x4200000000000000000000000000000000000006000bb84200000000000000000000000000000000000006",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCurveLPUniV3Router>;

// eslint-disable-next-line camelcase
export class OpCurveSETH_ETH_Deployer extends VaultDeployer<
  StrategyCurveLPUniV3Router,
  // eslint-disable-next-line camelcase
  StrategyCurveLPUniV3Router__factory,
  StrategyConstructorParams<StrategyCurveLPUniV3Router>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCurveLPUniV3Router>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP sETH/ETH";
  }

  override async unirouter() {
    return "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCurveLPUniV3Router> {
    return getOpCurveSETH_ETH_Params(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "curve-op-f-seth",
      name: "sETH/ETH",
      token: "sETH-f",
      tokenProviderId: "curve",
      oracle: "lps",
      oracleId: "curve-op-f-seth",
      status: "active",
      platformId: "curve",
      assets: ["sETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl: "https://curve.fi/#/optimism/pools/factory-v2-10/deposit",
      removeLiquidityUrl: "https://curve.fi/#/optimism/pools/factory-v2-10/withdraw",
      earnLpHelperType: LpHelperType.CURVE_OP,
      ...getZapMetadata(ZapCategory.CURVE_OP, ZapTypeCurveOp.CURVE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCurveLPUniV3Router__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCurveLPUniV3Router__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpCurveSETH_ETH_Deployer> {
    const master = await this._deployStrategyMaster();

    return new OpCurveSETH_ETH_Deployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpCurveSETH_ETH_Deployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpCurveSETH_ETH_Deployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
