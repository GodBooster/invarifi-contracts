// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import {
    StrategyCommonVelodromeGaugeV2,
    // eslint-disable-next-line camelcase
    StrategyCommonVelodromeGaugeV2__factory,
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeVelodrome } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";

// Function: initialize(address, address, (address,address,address,address,address,address), (address,address,bool,address)[], (address,address,bool,address)[], (address,address,bool,address)[])
// #	Name	Type	Data
// 1	_want	address	0xd25711EdfBf747efCE181442Cc1D8F5F8fc8a0D3
// 2	_gauge	address	0xCC53CD0a8EC812D46F0E2c7CC5AADd869b6F0292
// 2	_commonAddresses.vault	address	0x00557e194B717dCfEbaE6222091C5F806DF99698
// 2	_commonAddresses.unirouter	address	0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858
// 2	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 2	_commonAddresses.strategist	address	0x7c22953Bf2245A8298baf26D586Bd4b08a87caaa
// 2	_commonAddresses.feeRecipient	address	0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8
// 2	_commonAddresses.feeConfig	address	0x216EEE15D1e3fAAD34181f66dd0B665f556a638d
// 3	_outputToNativeRoute.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 3	_outputToNativeRoute.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 3	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 4	_outputToNativeRoute.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 4	_outputToNativeRoute.to	address	0x4200000000000000000000000000000000000006
// 4	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 5	_outputToLp0Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 5	_outputToLp0Route.to	address	0x4200000000000000000000000000000000000042
// 5	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// 6	_outputToLp1Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 6	_outputToLp1Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 6	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
// 7	_outputToLp1Route.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 7	_outputToLp1Route.to	address	0x4200000000000000000000000000000000000006
// 7	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000

export const getVelodromesOP_ETH = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xd25711EdfBf747efCE181442Cc1D8F5F8fc8a0D3",
    "0xCC53CD0a8EC812D46F0E2c7CC5AADd869b6F0292",
    commonParameters,
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0x4200000000000000000000000000000000000006",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x4200000000000000000000000000000000000042",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0x4200000000000000000000000000000000000006",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
  ] as StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class OptimismVelodrome_OP_ETHDeployer extends VaultDeployer<
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
    return "Optimism Velodrome OP-ETH vLP V2 Vault";
  }

  override async unirouter() {
    return "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonVelodromeGaugeV2> {
    return getVelodromesOP_ETH(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "velodrome-v2-weth-op",
      name: "OP-ETH vLP V2",
      token: "OP-ETH vLP V2",
      tokenProviderId: "velodrome",
      oracle: "lps",
      oracleId: "velodrome-v2-weth-op",
      status: "active",
      platformId: "velodrome",
      assets: ["OP", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_MEDIUM", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl: "https://velodrome.finance/swap?from=0x4200000000000000000000000000000000000042&to=eth",
      addLiquidityUrl:
        "https://velodrome.finance/deposit?token0=0x4200000000000000000000000000000000000042&token1=eth&stable=false",
      removeLiquidityUrl: "https://velodrome.finance/withdraw?pool=0xd25711edfbf747efce181442cc1d8f5f8fc8a0d3",
      earnLpHelperType: LpHelperType.VELODROME,
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...getZapMetadata(ZapCategory.VELODROME, ZapTypeVelodrome.VELODROME),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCommonVelodromeGaugeV2__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCommonVelodromeGaugeV2__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OptimismVelodrome_OP_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new OptimismVelodrome_OP_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OptimismVelodrome_OP_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OptimismVelodrome_OP_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
