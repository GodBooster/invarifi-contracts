import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopCamelot, StrategyHopCamelot__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

// Function: initialize(address, address, address, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xCe3B19D820CB8B9ae370E423B0a329c4314335fE
// 2	_rewardPool	address	0x9Dd8685463285aD5a94D2c128bda3c5e8a6173c8
// 3	_stableRouter	address	0x18f7402B673Ba6Fb5EA4B95768aABb8aaD7ef18a
// 3	_outputToNativeRoute	address	0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC
// 4	_outputToNativeRoute	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 5	_outputToDepositRoute	address	0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC
// 6	_outputToDepositRoute	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 7	_outputToDepositRoute	address	0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
// 8	_outputToDepositRoute	address	0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
// 9	_commonAddresses.vault	address	0x46034C63ad03254D6E96c655e82393E6C31E07C3
// 9	_commonAddresses.unirouter	address	0xc873fEcbd354f5A56E00E710B90EF4201db2448d
// 9	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 9	_commonAddresses.strategist	address	0x4cC72219fc8aEF162FC0c255D9B9C3Ff93B10882
// 9	_commonAddresses.feeRecipient	address	0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f
// 9	_commonAddresses.feeConfig	address	0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED

export const getArbHoUSDTLPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xCe3B19D820CB8B9ae370E423B0a329c4314335fE",
    "0x9Dd8685463285aD5a94D2c128bda3c5e8a6173c8",
    "0x18f7402B673Ba6Fb5EA4B95768aABb8aaD7ef18a",
    ["0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    [
      "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopCamelot>;

// eslint-disable-next-line camelcase
export class ArbHopUSDT_LPDeployer extends VaultDeployer<
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
    return "Arb Hop USDT LP";
  }

  override async unirouter() {
    return "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopCamelot> {
    return getArbHoUSDTLPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-arb-usdt",
      name: "USDT LP",
      token: "USDT-hUSDT LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-arb-usdt",
      status: "active",
      platformId: "hop",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/42161/unified/swap/ETH/USDT",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=arbitrum",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=USDT&sourceNetwork=arbitrum",
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
  override async deployStrategyMaster(): Promise<ArbHopUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbHopUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbHopUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbHopUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
