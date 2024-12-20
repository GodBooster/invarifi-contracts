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

const getBiswapETH_BNB_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x5bf6941f029424674bb93A43b79fc46bF4A67c21", // _want
    12, // _poolId
    "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739", // _chef
    ["0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"],
    [
      "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    ],
    ["0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCommonChefLP>;

// eslint-disable-next-line camelcase
export class BiswapETH_BNB_LPDeployer extends VaultDeployer<
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
    return "Biswap ETH-BNB LP";
  }

  override async unirouter() {
    return "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8";
  }

  override defaultStrategyParams(commonParameters: CommonAddressesAccessableStruct) {
    return getBiswapETH_BNB_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "biswap-eth-wbnb",
      name: "ETH-BNB LP",
      token: "ETH-BNB BiLP",
      tokenProviderId: "biswap",
      tokenAmmId: "bsc-biswap",
      oracle: "lps",
      oracleId: "biswap-eth-wbnb",
      status: "active",
      platformId: "biswap",
      assets: ["ETH", "BNB"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://exchange.biswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      addLiquidityUrl: "https://exchange.biswap.org/#/add/ETH/0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      removeLiquidityUrl: "https://exchange.biswap.org/#/remove/ETH/0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
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
  override async deployStrategyMaster(): Promise<BiswapETH_BNB_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new BiswapETH_BNB_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BiswapETH_BNB_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BiswapETH_BNB_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
