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
export const getStargateUSDT_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda",
    0,
    "0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47",
    "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8",
    2,
    [
      "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    ],
    [
      "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0x55d398326f99059fF775485246999027B3197955",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateStaking>;

// eslint-disable-next-line camelcase
export class BscStargateUSDT_LPDeployer extends VaultDeployer<
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
    return "BSC Stargate USDT LP";
  }

  override async unirouter() {
    return "0x10ED43C718714eb63d5aA57B78B54704E256024E";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateStaking> {
    return getStargateUSDT_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-bsc-usdt",
      name: "USDT LP",
      token: "S*USDT",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-bsc-usdt",
      status: "active",
      platformId: "stargate",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://pancakeswap.finance/swap?outputCurrency=0x55d398326f99059fF775485246999027B3197955",
      addLiquidityUrl: "https://stargate.finance/pool/usdt-bnb/add",
      removeLiquidityUrl: "https://stargate.finance/pool/usdt-bnb/remove",
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
  override async deployStrategyMaster(): Promise<BscStargateUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BscStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BscStargateUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BscStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
