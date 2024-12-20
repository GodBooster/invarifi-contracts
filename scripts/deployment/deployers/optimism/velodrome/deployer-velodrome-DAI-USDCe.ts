// import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// import {
//   StrategyCommonVelodromeGaugeV2,
//   StrategyCommonVelodromeGaugeV2__factory,
// } from "../../../../../typechain-types";
// import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeVelodrome } from "../../../types/vault-deployer";
// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
//
// // Function: initialize(address, address, (address,address,address,address,address,address), (address,address,bool,address)[], (address,address,bool,address)[], (address,address,bool,address)[])
// // #	Name	Type	Data
// // 1	_want	address	0x19715771E30c93915A5bbDa134d782b81A820076
// // 2	_gauge	address	0x6998089F6bDd9c74C7D8d01b99d7e379ccCcb02D
// // 2	_commonAddresses.vault	address	0x7c2967C20B03a8004ea81e86Ac1847D00e7B4CD1
// // 2	_commonAddresses.unirouter	address	0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858
// // 2	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// // 2	_commonAddresses.strategist	address	0x7c22953Bf2245A8298baf26D586Bd4b08a87caaa
// // 2	_commonAddresses.feeRecipient	address	0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8
// // 2	_commonAddresses.feeConfig	address	0x216EEE15D1e3fAAD34181f66dd0B665f556a638d
// // 3	_outputToNativeRoute.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// // 3	_outputToNativeRoute.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// // 3	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// // 4	_outputToNativeRoute.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// // 4	_outputToNativeRoute.to	address	0x4200000000000000000000000000000000000006
// // 4	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// // 5	_outputToLp0Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// // 5	_outputToLp0Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// // 5	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// // 6	_outputToLp0Route.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// // 6	_outputToLp0Route.to	address	0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1
// // 6	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// // 7	_outputToLp1Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// // 7	_outputToLp1Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// // 7	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
//
// export const getVelodromeDAI_USDCe = (commonParameters: CommonAddressesAccessableStruct) =>
//   [
//     "0x19715771E30c93915A5bbDa134d782b81A820076",
//     "0x6998089F6bDd9c74C7D8d01b99d7e379ccCcb02D",
//     commonParameters,
//     [
//       {
//         from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
//         to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
//         factory: "0x0000000000000000000000000000000000000000",
//         stable: false,
//       },
//       {
//         from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
//         to: "0x4200000000000000000000000000000000000006",
//         factory: "0x0000000000000000000000000000000000000000",
//         stable: false,
//       },
//     ],
//     [
//       {
//         from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
//         to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
//         factory: "0x0000000000000000000000000000000000000000",
//         stable: false,
//       },
//       {
//         from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
//         to: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
//         factory: "0x0000000000000000000000000000000000000000",
//         stable: false,
//       },
//     ],
//     [
//       {
//         from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
//         to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
//         factory: "0x0000000000000000000000000000000000000000",
//         stable: false,
//       },
//     ],
//   ] as StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>;
//
// // eslint-disable-next-line camelcase
// export class OptimismVelodrome_USDCe_USDTDeployer extends VaultDeployer<
//   StrategyCommonVelodromeGaugeV2,
//   // eslint-disable-next-line camelcase
//   StrategyCommonVelodromeGaugeV2__factory,
//   StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>
// > {
//   constructor(
//     hre: HardhatRuntimeEnvironment,
//     networkConfig: NetworkDeploymentConfig,
//     strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>>
//   ) {
//     super(hre, networkConfig, strategyConfig ?? {});
//   }
//
//   override targetNetwork() {
//     return Network.OPTIMISM_MAINNET;
//   }
//
//   override rawVaultName() {
//     return "Optimism Velodrome USDCe-USDT sLP V2 Vault";
//   }
//
//   override async unirouter() {
//     return "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
//   }
//
//   override defaultStrategyParams(
//     commonParameters: CommonAddressesAccessableStruct
//   ): StrategyConstructorParams<StrategyCommonVelodromeGaugeV2> {
//     return getVelodromeDAI_USDCe(commonParameters);
//   }
//
//   override async metadata(): Promise<VaultMetadata> {
//     return this.withDefaultMetadata({
//       id: "velodrome-v2-usdc-usdt",
//       name: "USDCe-USDT sLP V2",
//       token: "USDCe-USDT sLP V2",
//       tokenProviderId: "velodrome",
//       oracle: "lps",
//       oracleId: "velodrome-v2-usdc-usdt",
//       status: "active",
//       platformId: "velodrome",
//       assets: ["opUSDCe", "USDT"],
//       risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "CONTRACTS_VERIFIED"],
//       strategyTypeId: "lp",
//       buyTokenUrl:
//         "https://velodrome.finance/swap?from=0x7f5c764cbc14f9669b88837ca1490cca17c31607&to=0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
//       addLiquidityUrl:
//         "https://velodrome.finance/deposit?token0=0x7f5c764cbc14f9669b88837ca1490cca17c31607&token1=0x94b008aa00579c1307b0ef2c499ad98a8ce58e58&stable=true",
//       removeLiquidityUrl: "https://velodrome.finance/withdraw?pool=0x2b47c794c3789f499d8a54ec12f949eecce8ba16",
//       earnLpHelperType: LpHelperType.VELODROME,
//       ...getZapMetadata(ZapCategory.VELODROME, ZapTypeVelodrome.VELODROME),
//     });
//   }
//
//   // eslint-disable-next-line camelcase
//   override async strategyFactory(): Promise<StrategyCommonVelodromeGaugeV2__factory> {
//     const [deployer] = await this.hre.ethers.getSigners();
//     return new StrategyCommonVelodromeGaugeV2__factory(deployer);
//   }
//
//   // eslint-disable-next-line camelcase
//   override async deployStrategyMaster(): Promise<OptimismVelodrome_USDCe_USDTDeployer> {
//     const master = await this._deployStrategyMaster();
//
//     return new OptimismVelodrome_USDCe_USDTDeployer(this.hre, this.networkConfig, {
//       // eslint-disable-next-line node/no-unsupported-features/es-syntax
//       ...this.strategyConfig,
//       beaconAddress: master.address,
//     });
//   }
//
//   // eslint-disable-next-line camelcase
//   override async deployStrategyClone(): Promise<OptimismVelodrome_USDCe_USDTDeployer> {
//     const { clone } = await this._deployStrategyClone();
//
//     return new OptimismVelodrome_USDCe_USDTDeployer(this.hre, this.networkConfig, {
//       // eslint-disable-next-line node/no-unsupported-features/es-syntax
//       ...this.strategyConfig,
//       vaultConstructorParams: this.getVaultConstructorParams(clone),
//     });
//   }
// }
