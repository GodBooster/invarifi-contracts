// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import,camelcase
import { StrategyConvex, StrategyConvex__factory } from "../../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultDeployer, VaultMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { Network } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// Function: initialize(address, address, address, uint256, uint256[], bytes, address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea
// 2	_pool	address	0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea
// 3	_zap	address	0xA79828DF1850E8a3A3064576f380D90aECDD3359
// 4	_pid	uint256	96
// 4	_params	uint256	4
// 5	_params	uint256	2
// 6	_params	uint256	0
// 7	_params	uint256	0
// 9	_nativeToDepositPath	bytes	0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
// 9	_commonAddresses.vault	address	0x7f3F33B42b9734e61cb44424D130B5f6e09C9Db3
// 9	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 9	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 9	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 9	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 9	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexUSDD_DAI_USDC_USDTParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea", // _want
    "0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea", // _pool
    "0xA79828DF1850E8a3A3064576f380D90aECDD3359", // _zap
    96, // _pid
    [4, 2, 0, 0], // _params
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // _nativeToDepositPath
    [], // _nativeToDepositRoute
    "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
    commonParameters,
  ] as StrategyConstructorParams<StrategyConvex>;

// eslint-disable-next-line camelcase
export class CurveConvexUSDD_DAI_USDC_USDTDeployer extends VaultDeployer<
  StrategyConvex,
  // eslint-disable-next-line camelcase
  StrategyConvex__factory,
  StrategyConstructorParams<StrategyConvex>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyConvex>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Curve Convex USDD-DAI-USDC-USDT";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyConvex> {
    return getCurveConvexUSDD_DAI_USDC_USDTParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-usdd",
      name: "USDD/DAI/USDC/USDT",
      token: "USDD3CRV3CRV-f",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "convex-usdd",
      status: "active",
      platformId: "convex",
      assets: ["USDD", "DAI", "USDC", "USDT"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED", "OVER_COLLAT_ALGO_STABLECOIN"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-v2-116/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-v2-116/withdraw",
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexUSDD_DAI_USDC_USDTDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexUSDD_DAI_USDC_USDTDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexUSDD_DAI_USDC_USDTDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexUSDD_DAI_USDC_USDTDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
