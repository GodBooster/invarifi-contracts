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
import { ethers } from "ethers";
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// tri-crypto - curve convex
// all - curve

// Function: initialize(address, address, address, uint256, uint256[], bytes, address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x3A283D9c08E8b55966afb64C515f5143cf907611
// 2	_pool	address	0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4
// 3	_zap	address	0x0000000000000000000000000000000000000000
// 4	_pid	uint256	64
// 4	_params	uint256	2
// 5	_params	uint256	0
// 6	_params	uint256	0
// 7	_params	uint256	0
// 9	_nativeToDepositPath	bytes	0x
// 9	_nativeToDepositRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 10	_commonAddresses.vault	address	0xb9548238d875fB4e12727B2750D8a0bDbc7171c7
// 10	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 10	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 10	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 10	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 10	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexCVX_ETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x3A283D9c08E8b55966afb64C515f5143cf907611", // _want
    "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4", // _pool
    "0x0000000000000000000000000000000000000000", // _zap
    64, // _pid
    [2, 0, 0, 0], // _params
    "0x", // _nativeToDepositPath
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _nativeToDepositRoute
    ethers.constants.AddressZero,
    commonParameters,
  ] as StrategyConstructorParams<StrategyConvex>;

// eslint-disable-next-line camelcase
export class CurveConvexCVX_ETHDeployer extends VaultDeployer<
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
    return "Curve Convex CVX-ETH";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyConvex> {
    return getCurveConvexCVX_ETHParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-cvxeth",
      name: "CVX-ETH",
      token: "crvCVXETH",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "convex-cvxeth",
      status: "active",
      platformId: "convex",
      assets: ["CVX", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/cvxeth/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/cvxeth/withdraw",
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexCVX_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexCVX_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexCVX_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexCVX_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
