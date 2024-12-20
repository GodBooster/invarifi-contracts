// eslint-disable-next-line node/no-missing-import
import {
    // eslint-disable-next-line camelcase
    StrategyStargateStaking,
    StrategyStargateStaking__factory,
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
export const getStargateBUSD_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x98a5737749490856b401DB5Dc27F522fC314A4e1",
    1,
    "0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47",
    "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8",
    5,
    [
      "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    ],
    ["0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateStaking>;

// eslint-disable-next-line camelcase
export class BscStargateBUSD_LPDeployer extends VaultDeployer<
  StrategyStargateStaking,
  // eslint-disable-next-line camelcase
  StrategyStargateStaking__factory,
  StrategyConstructorParams<StrategyStargateStaking>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateStaking>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BSC_MAINNET;
  }

  override rawVaultName() {
    return "BSC Stargate BUSD LP";
  }

  override async unirouter() {
    return "0x10ED43C718714eb63d5aA57B78B54704E256024E";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateStaking> {
    return getStargateBUSD_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-bsc-busd",
      name: "BUSD LP",
      token: "S*BUSD",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-bsc-busd",
      status: "active",
      platformId: "stargate",
      assets: ["BUSD"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://pancakeswap.finance/swap?outputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      addLiquidityUrl: "https://stargate.finance/pool/busd-bnb/add",
      removeLiquidityUrl: "https://stargate.finance/pool/busd-bnb/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateStaking__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateStaking__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BscStargateBUSD_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BscStargateBUSD_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BscStargateBUSD_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BscStargateBUSD_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
