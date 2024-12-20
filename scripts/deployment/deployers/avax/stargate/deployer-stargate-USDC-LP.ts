import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateStaking, StrategyStargateStaking__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getAvaxStargateUSDCLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
    0,
    "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
    "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
    1,
    [
      "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    ],
    ["0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyStargateStaking>;

// eslint-disable-next-line camelcase
export class AvaxStargateUSDC_LPDeployer extends VaultDeployer<
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
    return getAvaxStargateUSDCLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-avax-usdc",
      name: "USDC LP",
      token: "S*USDC",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-avax-usdc",
      status: "active",
      platformId: "stargate",
      assets: ["USDC"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://traderjoexyz.com/trade?outputCurrency=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E#/",
      addLiquidityUrl: "https://stargate.finance/pool/USDC-AVAX/add",
      removeLiquidityUrl: "https://stargate.finance/pool/USDC-AVAX/remove",
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
  override async deployStrategyMaster(): Promise<AvaxStargateUSDC_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new AvaxStargateUSDC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<AvaxStargateUSDC_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new AvaxStargateUSDC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
