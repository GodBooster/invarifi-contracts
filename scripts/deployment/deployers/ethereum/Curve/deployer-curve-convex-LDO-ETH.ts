// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import,camelcase
import { StrategyConvex, StrategyConvex__factory } from "../../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    VaultDeployer,
    VaultMetadata,
    ZapTypeCurveConvex,
    getZapMetadata
} from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { ethers } from "ethers";
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// Function: initialize(address, address, address, uint256, uint256[], bytes, address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7
// 2	_pool	address	0x9409280DC1e6D33AB7A8C6EC03e5763FB61772B5
// 3	_zap	address	0x0000000000000000000000000000000000000000
// 4	_pid	uint256	149
// 4	_params	uint256	2
// 5	_params	uint256	0
// 6	_params	uint256	0
// 7	_params	uint256	0
// 9	_nativeToDepositPath	bytes	0x
// 9	_nativeToDepositRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 10	_commonAddresses.vault	address	0x0d2846d81099CE35cFB3CF5A81394E7d2f078f37
// 10	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 10	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 10	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 10	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 10	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexLDO_ETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7", // _want
    "0x9409280DC1e6D33AB7A8C6EC03e5763FB61772B5", // _pool
    "0x0000000000000000000000000000000000000000", // _zap
    149, // _pid
    [2, 0, 0, 0], // _params
    "0x", // _nativeToDepositPath
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // _nativeToDepositRoute
    ethers.constants.AddressZero,
    commonParameters,
  ] as StrategyConstructorParams<StrategyConvex>;

// eslint-disable-next-line camelcase
export class CurveConvexLDO_ETHDeployer extends VaultDeployer<
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
    return "Curve Convex LDO-ETH";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyConvex> {
    return getCurveConvexLDO_ETHParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-ldo",
      name: "LDO/ETH",
      token: "LDOETH-f",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "convex-ldo",
      status: "active",
      platformId: "convex",
      assets: ["LDO", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_LOW", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-204/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-204/withdraw",
      ...getZapMetadata(ZapCategory.CURVE_CONVEX_ETH, ZapTypeCurveConvex.CONVEX),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexLDO_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexLDO_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexLDO_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexLDO_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
