import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateOpNative, StrategyStargateOpNative__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getOpStargateEthLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xd22363e3762cA7339569F3d33EADe20127D5F98C",
    1,
    "0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2",
    "0xB49c4e680174E331CB0A7fF3Ab58afC9738d5F8b",
    commonParameters,
    [["0x4200000000000000000000000000000000000042", "0x4200000000000000000000000000000000000006"]],
    [false],
  ] as StrategyConstructorParams<StrategyStargateOpNative>;

// eslint-disable-next-line camelcase
export class OpStargateETH_LPDeployer extends VaultDeployer<
  StrategyStargateOpNative,
  // eslint-disable-next-line camelcase
  StrategyStargateOpNative__factory,
  StrategyConstructorParams<StrategyStargateOpNative>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateOpNative>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP Stargate ETH LP";
  }

  override async unirouter() {
    return "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateOpNative> {
    return getOpStargateEthLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-op-eth",
      name: "ETH LP",
      token: "S*ETH",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-op-eth",
      status: "active",
      platformId: "stargate",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl:
        "https://app.uniswap.org/#/swap?chain=optimism&inputCurrency=0x7F5c764cBc14f9669B88837ca1490cCa17c31607&outputCurrency=ETH",
      addLiquidityUrl: "https://stargate.finance/pool/eth-optimism/add",
      removeLiquidityUrl: "https://stargate.finance/pool/eth-optimism/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateOpNative__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateOpNative__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpStargateETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpStargateETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpStargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
