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

// Function: initialize(address, address, address, uint256, uint256[], bytes, address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x971add32Ea87f10bD192671630be3BE8A11b8623
// 2	_pool	address	0x971add32Ea87f10bD192671630be3BE8A11b8623
// 3	_zap	address	0x0000000000000000000000000000000000000000
// 4	_pid	uint256	157
// 4	_params	uint256	2
// 5	_params	uint256	0
// 6	_params	uint256	0
// 7	_params	uint256	0
// 9	_nativeToDepositPath	bytes	0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8d533a949740bb3306d119cc777fa900ba034cd52
// 9	_commonAddresses.vault	address	0x5Bcd31a28D77a1A5Ef5e0146Ab91e6f43D7100b7
// 9	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 9	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 9	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 9	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 9	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexcvxCRV_CRVParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x971add32Ea87f10bD192671630be3BE8A11b8623", // _want
    "0x971add32Ea87f10bD192671630be3BE8A11b8623", // _pool
    "0x0000000000000000000000000000000000000000", // _zap
    157, // _pid
    [2, 0, 0, 0], // _params
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8d533a949740bb3306d119cc777fa900ba034cd52", // _nativeToDepositPath
    [], // _nativeToDepositRoute
    ethers.constants.AddressZero,
    commonParameters,
  ] as StrategyConstructorParams<StrategyConvex>;

// eslint-disable-next-line camelcase
export class CurveConvexcvxCRV_CRVDeployer extends VaultDeployer<
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
    return "Curve Convex cvxCRV-CRV";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyConvex> {
    return getCurveConvexcvxCRV_CRVParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-cvxcrv",
      name: "cvxCRV/CRV",
      token: "cvxcrv-crv-f",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "convex-cvxcrv",
      status: "active",
      platformId: "convex",
      assets: ["cvxCRV", "CRV"],
      risks: ["COMPLEXITY_LOW", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-v2-283/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-v2-283/withdraw",
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexcvxCRV_CRVDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexcvxCRV_CRVDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexcvxCRV_CRVDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexcvxCRV_CRVDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
