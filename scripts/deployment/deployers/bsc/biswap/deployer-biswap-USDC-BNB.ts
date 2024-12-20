import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import {
    StrategyCommonChefLP,
    StrategyCommonChefLP__factory
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";

const getBiswapUSDC_BNB_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x06Cd679121Ec37B0A2FD673D4976B09d81791856", // _want
    119, // _poolId
    "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739", // _chef
    ["0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"],
    [
      "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
      "0x55d398326f99059fF775485246999027B3197955",
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    ],
    ["0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCommonChefLP>;

// eslint-disable-next-line camelcase
export class BiswapUSDC_BNB_LPDeployer extends VaultDeployer<
  StrategyCommonChefLP,
  // eslint-disable-next-line camelcase
  StrategyCommonChefLP__factory,
  StrategyConstructorParams<StrategyCommonChefLP>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCommonChefLP>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BSC_MAINNET;
  }

  override rawVaultName() {
    return "Biswap USDC-BNB LP";
  }

  override async unirouter() {
    return "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8";
  }

  override defaultStrategyParams(commonParameters: CommonAddressesAccessableStruct) {
    return getBiswapUSDC_BNB_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "biswap-usdc-wbnb",
      name: "USDC-BNB LP",
      token: "USDC-BNB BiLP",
      tokenProviderId: "biswap",
      tokenAmmId: "bsc-biswap",
      oracle: "lps",
      oracleId: "biswap-usdc-wbnb",
      status: "active",
      platformId: "biswap",
      assets: ["USDC", "BNB"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://exchange.biswap.org/#/swap?inputCurrency=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&outputCurrency=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      addLiquidityUrl:
        "https://exchange.biswap.org/#/add/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      removeLiquidityUrl:
        "https://exchange.biswap.org/#/remove/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      earnLpHelperType: LpHelperType.UNI_V2,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCommonChefLP__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCommonChefLP__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BiswapUSDC_BNB_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BiswapUSDC_BNB_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BiswapUSDC_BNB_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BiswapUSDC_BNB_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
