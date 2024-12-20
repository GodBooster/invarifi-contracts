// eslint-disable-next-line node/no-missing-import
import {
    StrategyCommonSolidlyStakerLP,
    StrategyCommonSolidlyStakerLP__factory
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { whitelistStrategy } from "./common";
// eslint-disable-next-line node/no-missing-import

// eslint-disable-next-line camelcase
export const getSolidlizardETH_USDCe_vLPParams = (commonParameters: CommonAddressesAccessableStruct, staker: string) =>
  [
    "0xe20F93279fF3538b1ad70D11bA160755625e3400",
    "0x0322CEbACF1f235913bE3FCE407F9F81632ede8B",
    staker,
    commonParameters,
    [
      {
        from: "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e",
        to: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        stable: false,
      },
    ],
    [
      {
        from: "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e",
        to: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        stable: false,
      },
    ],
    [
      {
        from: "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e",
        to: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        stable: false,
      },
      {
        from: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        to: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        stable: false,
      },
    ],
  ] as StrategyConstructorParams<StrategyCommonSolidlyStakerLP>;

// eslint-disable-next-line camelcase
export class ArbSolidlizardETH_USDCe_vLPDeployer extends VaultDeployer<
  StrategyCommonSolidlyStakerLP,
  // eslint-disable-next-line camelcase
  StrategyCommonSolidlyStakerLP__factory,
  StrategyConstructorParams<StrategyCommonSolidlyStakerLP>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCommonSolidlyStakerLP>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Solidlizard ETH-USDCe vLP";
  }

  override async unirouter() {
    return "0xf26515d5482e2c2fd237149bf6a653da4794b3d0";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonSolidlyStakerLP> {
    const staker = this.networkConfig.networkConfig.contractsConfig.strategiesShared?.dystopiaStaker?.staker;
    if (!staker) throw new Error("DistopiaStaker is not deployed");
    return getSolidlizardETH_USDCe_vLPParams(commonParameters, staker);
  }

  async onAfterStrategyInitialized(): Promise<ArbSolidlizardETH_USDCe_vLPDeployer> {
    return await whitelistStrategy<ArbSolidlizardETH_USDCe_vLPDeployer>(this);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "solidlizard-weth-usdc",
      name: "ETH-USDC.e vLP",
      token: "ETH-USDC.e vLP",
      tokenProviderId: "solidlizard",
      oracle: "lps",
      oracleId: "solidlizard-weth-usdc",
      status: "active",
      platformId: "solidlizard",
      assets: ["WETH", "arbUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_LARGE", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://solidlizard.finance/swap?from=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&to=0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      addLiquidityUrl: "https://solidlizard.finance/liquidity/create",
      removeLiquidityUrl: "https://solidlizard.finance/liquidity/0xe20F93279fF3538b1ad70D11bA160755625e3400",
      earnLpHelperType: LpHelperType.SOLIDLY,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.SOLIDLY_VOLATILE_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCommonSolidlyStakerLP__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCommonSolidlyStakerLP__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbSolidlizardETH_USDCe_vLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbSolidlizardETH_USDCe_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbSolidlizardETH_USDCe_vLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbSolidlizardETH_USDCe_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
