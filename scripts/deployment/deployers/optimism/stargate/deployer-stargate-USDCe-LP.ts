import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyStargateOp, StrategyStargateOp__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";

export const getOpStargateUSDCeLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298",
    0,
    "0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2",
    "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    1,
    commonParameters,
    [["0x4200000000000000000000000000000000000042", "0x4200000000000000000000000000000000000006"]],
    [["0x4200000000000000000000000000000000000042", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"]],
    [[false], [false]],
  ] as StrategyConstructorParams<StrategyStargateOp>;

// eslint-disable-next-line camelcase
export class OpStargateUSDCe_LPDeployer extends VaultDeployer<
  StrategyStargateOp,
  // eslint-disable-next-line camelcase
  StrategyStargateOp__factory,
  StrategyConstructorParams<StrategyStargateOp>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateOp>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP Stargate USDCe LP";
  }

  override async unirouter() {
    return "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateOp> {
    return getOpStargateUSDCeLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-op-usdc",
      name: "USDCe LP",
      token: "S*USDCe",
      tokenProviderId: "stargate",
      oracle: "lps",
      oracleId: "stargate-op-usdc",
      status: "active",
      platformId: "stargate",
      assets: ["opUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl:
        "https://app.uniswap.org/#/swap?chain=optimism&inputCurrency=ETH&outputCurrency=0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      addLiquidityUrl: "https://stargate.finance/pool/usdc-optimism/add",
      removeLiquidityUrl: "https://stargate.finance/pool/usdc-optimism/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateOp__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateOp__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpStargateUSDCe_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpStargateUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpStargateUSDCe_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpStargateUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
