import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import {
    StrategyCakeBoostedLP,
    StrategyCakeBoostedLP__factory
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { whitelistStrategy } from "./common";

const getInitalizeParams = (commonParameters: CommonAddressesAccessableStruct, staker: string) =>
  [
    "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0", // _want
    2, // _poolId
    "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652", // _chef
    staker, // _boostStaker
    ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"], // _outputToNativeRoute
    ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"], // _outputToLp0Route
    ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"], // _outputToLp1Route
    commonParameters,
  ] as StrategyConstructorParams<StrategyCakeBoostedLP>;

// eslint-disable-next-line camelcase
export class PancakeCAKE_BNBDeployer extends VaultDeployer<
  StrategyCakeBoostedLP,
  // eslint-disable-next-line camelcase
  StrategyCakeBoostedLP__factory,
  StrategyConstructorParams<StrategyCakeBoostedLP>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCakeBoostedLP>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BSC_MAINNET;
  }

  override rawVaultName() {
    return "Pancake CAKE-BNB LP";
  }

  override async unirouter() {
    return "0x10ED43C718714eb63d5aA57B78B54704E256024E";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCakeBoostedLP> {
    const staker = this.networkConfig.networkConfig.contractsConfig.strategiesShared?.bscVeCakeStaker?.staker;
    if (!staker) throw new Error("VeCakeStaker is not deployed");
    return getInitalizeParams(commonParameters, staker);
  }

  async onAfterStrategyInitialized(): Promise<PancakeCAKE_BNBDeployer> {
    return await whitelistStrategy<PancakeCAKE_BNBDeployer>(this);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "cakev2-cake-bnb",
      name: "CAKE-BNB LP",
      token: "CAKE-BNB LP2",
      tokenProviderId: "pancakeswap",
      tokenAmmId: "bsc-pancakeswap-v2",
      oracle: "lps",
      oracleId: "cakev2-cake-bnb",
      status: "active",
      platformId: "pancakeswap",
      assets: ["CAKE", "BNB"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl: "https://pancakeswap.finance/swap?outputCurrency=0x5B6DcF557E2aBE2323c48445E8CC948910d8c2c9",
      addLiquidityUrl: "https://pancakeswap.finance/add/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/BNB",
      removeLiquidityUrl: "https://pancakeswap.finance/remove/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/BNB",
      earnLpHelperType: LpHelperType.UNI_V2,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCakeBoostedLP__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCakeBoostedLP__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<PancakeCAKE_BNBDeployer> {
    const master = await this._deployStrategyMaster();

    return new PancakeCAKE_BNBDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<PancakeCAKE_BNBDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new PancakeCAKE_BNBDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
