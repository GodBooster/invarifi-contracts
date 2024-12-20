import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateStaking, StrategyStargateStaking__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getAvaxStargateUSDTLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
    1,
    "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
    "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
    2,
    [
      "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
      "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    ],
    [
      "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
      "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateStaking>;

// eslint-disable-next-line camelcase
export class AvaxStargateUSDT_LPDeployer extends VaultDeployer<
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
    return Network.AVAX_MAINNET;
  }

  override rawVaultName() {
    return "AVAX Stargate USDT LP";
  }

  override async unirouter() {
    return "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateStaking> {
    return getAvaxStargateUSDTLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-avax-usdt",
      name: "USDT LP",
      token: "S*USDT",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-avax-usdt",
      status: "active",
      platformId: "stargate",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://traderjoexyz.com/trade?outputCurrency=0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7#/",
      addLiquidityUrl: "https://stargate.finance/pool/USDT-AVAX/add",
      removeLiquidityUrl: "https://stargate.finance/pool/USDT-AVAX/remove",
      earnLpHelperType: LpHelperTypeUniV2.V2_STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateStaking__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateStaking__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<AvaxStargateUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new AvaxStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<AvaxStargateUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new AvaxStargateUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
