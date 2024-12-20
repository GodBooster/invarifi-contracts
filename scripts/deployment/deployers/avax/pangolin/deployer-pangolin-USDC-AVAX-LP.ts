import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyPangolinMiniChefLP, StrategyPangolinMiniChefLP__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getAvaxPangolinUSDC_AVAXLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x0e0100Ab771E9288e0Aa97e11557E6654C3a9665",
    55,
    "0x1f806f7C8dED893fd3caE279191ad7Aa3798E928",
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"],
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"],
    [
      "0x60781C2586D68229fde47564546784ab3fACA982",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyPangolinMiniChefLP>;

// eslint-disable-next-line camelcase
export class AvaxPangolinUSDC_AVAX_LPDeployer extends VaultDeployer<
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
    return "AVAX Pangolin USDC-AVAX LP";
  }

  override async unirouter() {
    return "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyPangolinMiniChefLP> {
    return getAvaxPangolinUSDC_AVAXLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "png-wavax-usdc",
      name: "USDC-AVAX LP",
      token: "USDC-AVAX LP",
      tokenProviderId: "pangolin",
      oracle: "lps",
      oracleId: "png-wavax-usdc",
      status: "active",
      platformId: "pangolin",
      assets: ["USDC", "AVAX"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "PLATFORM_ESTABLISHED", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl: "https://app.pangolin.exchange/#/swap?outputCurrency=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      addLiquidityUrl: "https://app.pangolin.exchange/#/add/AVAX/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      removeLiquidityUrl: "https://app.pangolin.exchange/#/remove/AVAX/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
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
  override async deployStrategyMaster(): Promise<AvaxPangolinUSDC_AVAX_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new AvaxPangolinUSDC_AVAX_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<AvaxPangolinUSDC_AVAX_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new AvaxPangolinUSDC_AVAX_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
