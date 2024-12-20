import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopCamelot, StrategyHopCamelot__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

// Function: initialize(address, address, address, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xB67c014FA700E69681a673876eb8BAFAA36BFf71
// 2	_rewardPool	address	0xb0CabFE930642AD3E7DECdc741884d8C3F7EbC70
// 3	_stableRouter	address	0x10541b07d8Ad2647Dc6cD67abd4c03575dade261
// 3	_outputToNativeRoute	address	0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC
// 4	_outputToNativeRoute	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 5	_outputToDepositRoute	address	0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC
// 6	_outputToDepositRoute	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 7	_outputToDepositRoute	address	0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
// 8	_commonAddresses.vault	address	0xA98070C4a600678a93cEaF4bF629eE255F46f64F
// 8	_commonAddresses.unirouter	address	0xc873fEcbd354f5A56E00E710B90EF4201db2448d
// 8	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 8	_commonAddresses.strategist	address	0x4cC72219fc8aEF162FC0c255D9B9C3Ff93B10882
// 8	_commonAddresses.feeRecipient	address	0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f
// 8	_commonAddresses.feeConfig	address	0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED

export const getArbHopUSDCLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xB67c014FA700E69681a673876eb8BAFAA36BFf71",
    "0xb0CabFE930642AD3E7DECdc741884d8C3F7EbC70",
    "0x10541b07d8Ad2647Dc6cD67abd4c03575dade261",
    ["0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    [
      "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopCamelot>;

// eslint-disable-next-line camelcase
export class ArbHopUSDCe_LPDeployer extends VaultDeployer<
  StrategyHopCamelot,
  // eslint-disable-next-line camelcase
  StrategyHopCamelot__factory,
  StrategyConstructorParams<StrategyHopCamelot>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyHopCamelot>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Hop USDCe LP";
  }

  override async unirouter() {
    return "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopCamelot> {
    return getArbHopUSDCLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-arb-usdc",
      name: "USDC.e LP",
      token: "USDC.e-hUSDC LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-arb-usdc",
      status: "active",
      platformId: "hop",
      assets: ["arbUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/42161/unified/swap/ETH/USDC",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=arbitrum",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=USDC&sourceNetwork=arbitrum",
      earnLpHelperType: LpHelperType.HOP,
      ...getZapMetadata(ZapCategory.HOP, ZapTypeHop.HOP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyHopCamelot__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyHopCamelot__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbHopUSDCe_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbHopUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbHopUSDCe_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbHopUSDCe_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
