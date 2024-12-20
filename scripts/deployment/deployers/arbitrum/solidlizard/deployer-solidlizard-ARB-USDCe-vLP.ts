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
export const getSolidlizardARB_USDCe_vLPParams = (commonParameters: CommonAddressesAccessableStruct, staker: string) =>
  [
    "0x9cB911Cbb270cAE0d132689cE11c2c52aB2DedBC",
    "0xc43e8F9AE4c1Ef6b8b63CBFEfE8Fe90d375fe11C",
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
      {
        from: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        to: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        stable: false,
      },
      {
        from: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        to: "0x912CE59144191C1204E64559FE8253a0e49E6548",
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
export class ArbSolidlizardARB_USDCe_vLPDeployer extends VaultDeployer<
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
    return "Arb Solidlizard ARB-USDCe vLP";
  }

  override async unirouter() {
    return "0xf26515d5482e2c2fd237149bf6a653da4794b3d0";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonSolidlyStakerLP> {
    const staker = this.networkConfig.networkConfig.contractsConfig.strategiesShared?.dystopiaStaker?.staker;
    if (!staker) throw new Error("DistopiaStaker is not deployed");
    return getSolidlizardARB_USDCe_vLPParams(commonParameters, staker);
  }

  async onAfterStrategyInitialized(): Promise<ArbSolidlizardARB_USDCe_vLPDeployer> {
    return await whitelistStrategy<ArbSolidlizardARB_USDCe_vLPDeployer>(this);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "solidlizard-arb-usdc",
      name: "ARB-USDC.e vLP",
      token: "ARB-USDC.e vLP",
      tokenProviderId: "solidlizard",
      oracle: "lps",
      oracleId: "solidlizard-arb-usdc",
      status: "active",
      platformId: "solidlizard",
      assets: ["ARB", "arbUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_LARGE", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://solidlizard.finance/swap?from=0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8&to=0x912CE59144191C1204E64559FE8253a0e49E6548",
      addLiquidityUrl: "https://solidlizard.finance/liquidity/create",
      removeLiquidityUrl: "https://solidlizard.finance/liquidity/0x9cB911Cbb270cAE0d132689cE11c2c52aB2DedBC",
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
  override async deployStrategyMaster(): Promise<ArbSolidlizardARB_USDCe_vLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbSolidlizardARB_USDCe_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbSolidlizardARB_USDCe_vLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbSolidlizardARB_USDCe_vLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
