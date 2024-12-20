import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    StrategyCommonVelodromeGaugeV2,
    StrategyCommonVelodromeGaugeV2__factory,
} from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeVelodrome, getZapMetadata } from "../../../types/vault-deployer";

// Function: initialize(address, address, (address,address,address,address,address,address), (address,address,bool,address)[], (address,address,bool,address)[], (address,address,bool,address)[])
// #	Name	Type	Data
// 1	_want	address	0xC5c247580A4A6E4d3811c0DA6215057aaC480bAc
// 2	_gauge	address	0x8D2653DC52E123D653011A335a5C37cDc268f2Af
// 2	_commonAddresses.vault	address	0x935A64d0825D86c1ca57Fe8f270e635AC1a0878A
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
// 5	_outputToLp0Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 5	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// 6	_outputToLp0Route.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 6	_outputToLp0Route.to	address	0x4200000000000000000000000000000000000006
// 6	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// 7	_outputToLp0Route.from	address	0x4200000000000000000000000000000000000006
// 7	_outputToLp0Route.to	address	0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb
// 7	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000

// 8	_outputToLp1Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 8	_outputToLp1Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 8	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
// 9	_outputToLp1Route.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 9	_outputToLp1Route.to	address	0x4200000000000000000000000000000000000006
// 9	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
// 10	_outputToLp1Route.from	address	0x4200000000000000000000000000000000000006
// 10	_outputToLp1Route.to	address	0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb
// 10	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
// 11	_outputToLp1Route.from	address	0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb
// 11	_outputToLp1Route.to	address	0xFdb794692724153d1488CcdBE0C56c252596735F
// 11	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000

export const getVelodromewstETH_LDO = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xC5c247580A4A6E4d3811c0DA6215057aaC480bAc",
    "0x8D2653DC52E123D653011A335a5C37cDc268f2Af",
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
      {
        from: "0x4200000000000000000000000000000000000006",
        to: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
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
      {
        from: "0x4200000000000000000000000000000000000006",
        to: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
        to: "0xFdb794692724153d1488CcdBE0C56c252596735F",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
  ] as StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>;

// eslint-disable-next-line camelcase
export class OptimismVelodrome_wstETH_LDODeployer extends VaultDeployer<
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
    return "Optimism Velodrome sUSD-USDCe sLP V2 Vault";
  }

  override async unirouter() {
    return "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonVelodromeGaugeV2> {
    return getVelodromewstETH_LDO(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "velodrome-v2-wsteth-ldo",
      name: "wstETH-LDO vLP V2",
      token: "wstETH-LDO vLP V2",
      tokenProviderId: "velodrome",
      oracle: "lps",
      oracleId: "velodrome-v2-wsteth-ldo",
      status: "active",
      platformId: "velodrome",
      assets: ["wstETH", "LDO"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_HIGH", "MCAP_LARGE", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      buyTokenUrl:
        "https://velodrome.finance/swap?from=0x1f32b1c2345538c0c6f582fcb022739c4a194ebb&to=0xfdb794692724153d1488ccdbe0c56c252596735f",
      addLiquidityUrl:
        "https://velodrome.finance/deposit?token0=0x1f32b1c2345538c0c6f582fcb022739c4a194ebb&token1=0xfdb794692724153d1488ccdbe0c56c252596735f&stable=false",
      removeLiquidityUrl: "https://velodrome.finance/withdraw?pool=0xC5c247580A4A6E4d3811c0DA6215057aaC480bAc",
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
  override async deployStrategyMaster(): Promise<OptimismVelodrome_wstETH_LDODeployer> {
    const master = await this._deployStrategyMaster();

    return new OptimismVelodrome_wstETH_LDODeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OptimismVelodrome_wstETH_LDODeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OptimismVelodrome_wstETH_LDODeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
