import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    StrategyCurveLPUniV3Router,
    StrategyCurveLPUniV3Router__factory
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import {
    VaultDeployer,
    VaultMetadata,
    ZapTypeCurveOp,
    getZapMetadata
} from "../../../types/vault-deployer";

export const getOpCurveMIM_DAI_USDCe_USDTParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x810D1AaA4Cd8F21c23bB648F2dfb9DC232A01F09",
    "0xabC000d88f23Bb45525E447528DBF656A9D55bf5",
    "0x2EB49A3eff789d7B2286Bf17667acbF12d882c17",
    "0x167e42a1C7ab4Be03764A2222aAC57F5f6754411",
    [4, 2, 0, 1],
    [
      "0x0994206dfe8de6ec6920ff4d779b0d950605fb53000bb84200000000000000000000000000000000000006",
      "0x42000000000000000000000000000000000000060001f47f5c764cbc14f9669b88837ca1490cca17c31607",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCurveLPUniV3Router>;

// eslint-disable-next-line camelcase
export class OpCurveMIM_DAI_USDCe_USDT_Deployer extends VaultDeployer<
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
    return "OP MIM/DAI/USDCe/USDT";
  }

  override async unirouter() {
    return "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCurveLPUniV3Router> {
    return getOpCurveMIM_DAI_USDCe_USDTParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "curve-op-f-mim",
      name: "MIM/DAI/USDCe/USDT",
      token: "mim3CRV-f",
      tokenProviderId: "curve",
      oracle: "lps",
      oracleId: "curve-op-f-mim",
      status: "active",
      platformId: "curve",
      assets: ["MIM", "DAI", "opUSDCe", "USDT"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/optimism/pools/factory-v2-47/deposit",
      removeLiquidityUrl: "https://curve.fi/#/optimism/pools/factory-v2-47/withdraw",
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
  override async deployStrategyMaster(): Promise<OpCurveMIM_DAI_USDCe_USDT_Deployer> {
    const master = await this._deployStrategyMaster();

    return new OpCurveMIM_DAI_USDCe_USDT_Deployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpCurveMIM_DAI_USDCe_USDT_Deployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpCurveMIM_DAI_USDCe_USDT_Deployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
