import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getOpVelodromeVELO_USDCe } from "../../../../../test/zaps/Velodrome/deployment/StrategyCommonVelodromeGaugeV2.deployment";
import {
    StrategyCommonVelodromeGaugeV2,
    StrategyCommonVelodromeGaugeV2__factory,
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export class OptimismVelodrome_VELO_USDCeDeployer extends VaultDeployer<
  StrategyCommonVelodromeGaugeV2,
  // eslint-disable-next-line camelcase
  StrategyCommonVelodromeGaugeV2__factory,
  StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "Optimism VELO-USDCe vLP V2 Vault";
  }

  override async unirouter() {
    return "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonVelodromeGaugeV2> {
    return getOpVelodromeVELO_USDCe(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "velodrome-v2-usdc-velo",
      name: "VELO-USDCe vLP V2",
      token: "VELO-USDCe vLP V2",
      tokenProviderId: "velodrome",
      oracle: "lps",
      oracleId: "velodrome-v2-usdc-velo",
      status: "active",
      platformId: "velodrome",
      assets: ["VELOV2", "opUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_SMALL", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://velodrome.finance/swap?from=0x9560e827af36c94d2ac33a39bce1fe78631088db&to=0x7f5c764cbc14f9669b88837ca1490cca17c31607",
      addLiquidityUrl:
        "https://velodrome.finance/deposit?token0=0x9560e827af36c94d2ac33a39bce1fe78631088db&token1=0x7f5c764cbc14f9669b88837ca1490cca17c31607&stable=false",
      removeLiquidityUrl: "https://velodrome.finance/withdraw?pool=0x8134a2fdc127549480865fb8e5a9e8a8a95a54c5",
      earnLpHelperType: LpHelperType.VELODROME,
      ...getZapMetadata(ZapCategory.VELODROME, ZapTypeVelodrome.VELODROME),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCommonVelodromeGaugeV2__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCommonVelodromeGaugeV2__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OptimismVelodrome_VELO_USDCeDeployer> {
    const master = await this._deployStrategyMaster();

    return new OptimismVelodrome_VELO_USDCeDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OptimismVelodrome_VELO_USDCeDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OptimismVelodrome_VELO_USDCeDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
