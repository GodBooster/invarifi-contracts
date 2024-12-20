// eslint-disable-next-line node/no-missing-import
import { VaultDeployer, VaultMetadata } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import,camelcase
import { StrategyConvex, StrategyConvex__factory } from "../../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { Network } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { ethers } from "ethers";
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// Function: initialize(address, address, address, uint256, uint256[], bytes, address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x6c38cE8984a890F5e46e6dF6117C26b3F1EcfC9C
// 2	_pool	address	0x0f3159811670c117c372428D4E69AC32325e4D0F
// 3	_zap	address	0x0000000000000000000000000000000000000000
// 4	_pid	uint256	154
// 4	_params	uint256	2
// 5	_params	uint256	0
// 6	_params	uint256	0
// 7	_params	uint256	0
// 9	_nativeToDepositPath	bytes	0x
// 9	_nativeToDepositRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 10	_commonAddresses.vault	address	0x4dE81AD42E9651755716177fAe9911c54F5b055B
// 10	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 10	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 10	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 10	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 10	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexETH_RETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x6c38cE8984a890F5e46e6dF6117C26b3F1EcfC9C", // _want
    "0x0f3159811670c117c372428D4E69AC32325e4D0F", // _pool
    "0x0000000000000000000000000000000000000000", // _zap
    154, // _pid
    [2, 0, 0, 0], // _params
    "0x", // _nativeToDepositPath
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _nativeToDepositRoute
    ethers.constants.AddressZero,
    commonParameters,
  ] as StrategyConstructorParams<StrategyConvex>;

// eslint-disable-next-line camelcase
export class CurveConvexETH_RETHDeployer extends VaultDeployer<
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
    return "Curve Convex ETH-rETH";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyConvex> {
    return getCurveConvexETH_RETHParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-reth",
      name: "rETH/ETH",
      token: "rETH-f",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "convex-reth",
      status: "active",
      platformId: "convex",
      assets: ["rETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-210/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-210/withdraw",
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexETH_RETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexETH_RETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexETH_RETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexETH_RETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
