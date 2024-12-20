import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyPangolinMiniChefLP, StrategyPangolinMiniChefLP__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getAvaxPangolinUSDC_USDCe_LpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x8a9c36BC3CEd5ECce703A4dA8032218Dfe72fE86",
    54,
    "0x1f806f7C8dED893fd3caE279191ad7Aa3798E928",
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"],
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"],
    [
      "0x60781C2586D68229fde47564546784ab3fACA982",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyPangolinMiniChefLP>;

// eslint-disable-next-line camelcase
export class AvaxPangolinUSDC_USDCe_LPDeployer extends VaultDeployer<
  StrategyPangolinMiniChefLP,
  // eslint-disable-next-line camelcase
  StrategyPangolinMiniChefLP__factory,
  StrategyConstructorParams<StrategyPangolinMiniChefLP>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyPangolinMiniChefLP>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.AVAX_MAINNET;
  }

  override rawVaultName() {
    return "AVAX Pangolin USDC-USDCe LP";
  }

  override async unirouter() {
    return "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyPangolinMiniChefLP> {
    return getAvaxPangolinUSDC_USDCe_LpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "png-usdc.e-usdc",
      name: "USDC-USDC.e LP",
      token: "USDC-USDC.e LP",
      tokenProviderId: "pangolin",
      oracle: "lps",
      oracleId: "png-usdc.e-usdc",
      status: "active",
      platformId: "pangolin",
      assets: ["USDC", "USDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "PLATFORM_ESTABLISHED", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://app.pangolin.exchange/#/swap?inputCurrency=0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664&outputCurrency=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      addLiquidityUrl:
        "https://app.pangolin.exchange/#/add/0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      removeLiquidityUrl:
        "https://app.pangolin.exchange/#/remove/0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      earnLpHelperType: LpHelperTypeUniV2.V2_UNI_V2,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyPangolinMiniChefLP__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyPangolinMiniChefLP__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<AvaxPangolinUSDC_USDCe_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new AvaxPangolinUSDC_USDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<AvaxPangolinUSDC_USDCe_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new AvaxPangolinUSDC_USDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
