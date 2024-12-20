// eslint-disable-next-line node/no-missing-import
import {
    StrategyStargateBal,
    // eslint-disable-next-line camelcase
    StrategyStargateBal__factory,
    StrategyStargateOpNative,
} from "../../../../../typechain-types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata, ZapTypeCommon, getZapMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// Function: initialize(address, uint256, address, address, uint256, (address,address,address,address,address,address), bytes32[], bytes32[], address[], address[])
// #	Name	Type	Data
// 1	_want	address	0x101816545F6bd2b1076434B54383a1E633390A2E
// 2	_poolId	uint256	2
// 3	_chef	address	0xB0D502E938ed5f4df2E681fE6E419ff29631d62b
// 4	_stargateRouter	address	0x150f94B44927F078737562f0fcF3C95c01Cc2376
// 5	_routerPoolId	uint256	0
// 5	_commonAddresses.vault	address	0x6498171C7f0B5e3071D83aCC63806ed52D9EE1f8
// 5	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 5	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 5	_commonAddresses.strategist	address	0x4cC72219fc8aEF162FC0c255D9B9C3Ff93B10882
// 5	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 5	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd
// 6	_outputToNativePools	bytes32	0x639883476960a23b38579acfd7d71561a0f408cf000200000000000000000505
// 7	_outputToNativePools	bytes32	0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502
// 8	_outputToNativePools	bytes32	0xa1697f9af0875b63ddc472d6eebada8c1fab85680000000000000000000004f9
// 9	_outputToNativePools	bytes32	0x79c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e7
// 10	_outputToNativePools	bytes32	0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0
// 11	_outputToDepositPools	bytes32	0x639883476960a23b38579acfd7d71561a0f408cf000200000000000000000505
// 12	_outputToDepositPools	bytes32	0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502
// 13	_outputToDepositPools	bytes32	0xa1697f9af0875b63ddc472d6eebada8c1fab85680000000000000000000004f9
// 14	_outputToDepositPools	bytes32	0x79c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e7
// 15	_outputToDepositPools	bytes32	0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0
// 16	_outputToNativeRoute	address	0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6
// 17	_outputToNativeRoute	address	0xfeBb0bbf162E64fb9D0dfe186E517d84C395f016
// 18	_outputToNativeRoute	address	0xA1697F9Af0875B63DdC472d6EeBADa8C1fAB8568
// 19	_outputToNativeRoute	address	0xdAC17F958D2ee523a2206206994597C13D831ec7
// 20	_outputToNativeRoute	address	0x79c58f70905F734641735BC61e45c19dD9Ad60bC
// 21	_outputToNativeRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 22	_outputToDepositRoute	address	0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6
// 23	_outputToDepositRoute	address	0xfeBb0bbf162E64fb9D0dfe186E517d84C395f016
// 24	_outputToDepositRoute	address	0xA1697F9Af0875B63DdC472d6EeBADa8C1fAB8568
// 25	_outputToDepositRoute	address	0xdAC17F958D2ee523a2206206994597C13D831ec7
// 26	_outputToDepositRoute	address	0x79c58f70905F734641735BC61e45c19dD9Ad60bC
// 27	_outputToDepositRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

// eslint-disable-next-line camelcase
export const getStargateOP_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
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
export const getStargateETH_LPParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x101816545F6bd2b1076434B54383a1E633390A2E", // _want
    2, // _poolId
    "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", // _chef
    "0x150f94B44927F078737562f0fcF3C95c01Cc2376", // _stargateRouter
    0, // _routerPoolId
    commonParameters,
    [
      "0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e0002000000000000000005d5",
      "0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019",
    ], // _outputToNativePools
    [
      "0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e0002000000000000000005d5",
      "0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019",
    ], // _outputToDepositPools
    [
      "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ], // _outputToNativeRoute
    [
      "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ], // _outputToDepositRoute
  ] as StrategyConstructorParams<StrategyStargateBal>;

// eslint-disable-next-line camelcase
export class StargateETH_LPDeployer extends VaultDeployer<
  StrategyStargateBal,
  // eslint-disable-next-line camelcase
  StrategyStargateBal__factory,
  StrategyConstructorParams<StrategyStargateBal>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyStargateBal>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Stargate ETH LP";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyStargateBal> {
    return getStargateETH_LPParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "stargate-eth-eth",
      name: "ETH LP",
      token: "S*ETH",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "stargate-eth-eth",
      status: "active",
      platformId: "stargate",
      assets: ["ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/1/unified/swap/USDC/ETH",
      addLiquidityUrl: "https://stargate.finance/pool/eth-eth/add",
      removeLiquidityUrl: "https://stargate.finance/pool/eth-eth/remove",
      earnLpHelperType: LpHelperType.STARGATE,
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.STARGATE),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyStargateBal__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyStargateBal__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<StargateETH_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new StargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<StargateETH_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new StargateETH_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
