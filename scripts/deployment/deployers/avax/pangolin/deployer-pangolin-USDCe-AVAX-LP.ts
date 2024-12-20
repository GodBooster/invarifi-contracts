import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyPangolinMiniChefLP, StrategyPangolinMiniChefLP__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getAvaxPangolinUSDCe_AVAXLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xbd918Ed441767fe7924e99F6a0E0B568ac1970D9",
    9,
    "0x1f806f7C8dED893fd3caE279191ad7Aa3798E928",
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"],
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"],
    ["0x60781C2586D68229fde47564546784ab3fACA982", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyPangolinMiniChefLP>;

// eslint-disable-next-line camelcase
export class AvaxPangolinUSDCe_AVAX_LPDeployer extends VaultDeployer<
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
    return "AVAX Pangolin USDCe-AVAX LP";
  }

  override async unirouter() {
    return "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyPangolinMiniChefLP> {
    return getAvaxPangolinUSDCe_AVAXLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "png-usdc.e-wavax",
      name: "USDC.e-AVAX LP",
      token: "USDC.e-AVAX LP",
      tokenProviderId: "pangolin",
      oracle: "lps",
      oracleId: "png-usdc.e-wavax",
      status: "active",
      platformId: "pangolin",
      assets: ["USDCe", "AVAX"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_LOW", "MCAP_LARGE", "PLATFORM_ESTABLISHED", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://app.pangolin.exchange/#/swap?inputCurrency=0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664&outputCurrency=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      addLiquidityUrl:
        "https://app.pangolin.exchange/#/add/0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      removeLiquidityUrl:
        "https://app.pangolin.exchange/#/remove/0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
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
  override async deployStrategyMaster(): Promise<AvaxPangolinUSDCe_AVAX_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new AvaxPangolinUSDCe_AVAX_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<AvaxPangolinUSDCe_AVAX_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new AvaxPangolinUSDCe_AVAX_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
