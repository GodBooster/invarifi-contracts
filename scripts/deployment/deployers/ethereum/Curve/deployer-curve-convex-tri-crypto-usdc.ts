// eslint-disable-next-line node/no-missing-import
import {
    StrategyCurveConvex,
    // eslint-disable-next-line camelcase
    StrategyCurveConvex__factory,
} from "../../../../../typechain-types";
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeCurveConvex } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { Network, ZapCategory } from "../../../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../../typechain-types/StrategyAuraGyroMainnet";

// Function: initialize(address, address, uint256, bytes, bytes, bytes, (address[9],uint256[3][4],uint256), (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B
// 2	_gauge	address	0x85D44861D024CB7603Ba906F2Dc9569fC02083F6
// 3	_pid	uint256	189
// 4	_crvToNativePath	bytes	0xd533a949740bb3306d119cc777fa900ba034cd52000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
// 5	_cvxToNativePath	bytes	0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b002710c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
// 6	_nativeToDepositPath	bytes	0x
// 6	_depositToWant.route	address[9]	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B,0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000
// 6	_depositToWant.swapParams	uint256[3][4]	2,0,8,0,0,0,0,0,0,0,0,0
// 6	_depositToWant.minAmount	uint256	0
// 7	_commonAddresses.vault	address	0xD1BeaD7CadcCC6b6a715A6272c39F1EC54F6EC99
// 7	_commonAddresses.unirouter	address	0xE592427A0AEce92De3Edee1F18E0157C05861564
// 7	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 7	_commonAddresses.strategist	address	0x982F264ce97365864181df65dF4931C593A515ad
// 7	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 7	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getCurveConvexTriCryptoUSDCParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B", // _want
    "0x85D44861D024CB7603Ba906F2Dc9569fC02083F6", // _gauge
    189, // _pid
    "0xd533a949740bb3306d119cc777fa900ba034cd52000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // _crvToNativePath
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b002710c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // _cvxToNativePath
    "0x", // _nativeToDepositPath
    {
      route: [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B",
        "0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
      ],
      swapParams: [
        [2, 0, 8],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      minAmount: 0,
    }, // _depositToWant
    commonParameters,
  ] as StrategyConstructorParams<StrategyCurveConvex>;

export class CurveConvexTriCryptoUSDCDeployer extends VaultDeployer<
  StrategyCurveConvex,
  // eslint-disable-next-line camelcase
  StrategyCurveConvex__factory,
  StrategyConstructorParams<StrategyCurveConvex>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCurveConvex>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Curve Convex TriCrypto-USDC";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCurveConvex> {
    return getCurveConvexTriCryptoUSDCParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "convex-tricrypto-usdc",
      name: "TriCryptoUSDC",
      token: "crvUSDCWBTCWETH",
      tokenProviderId: "curve",
      oracle: "lps",
      oracleId: "convex-tricrypto-usdc",
      status: "active",
      platformId: "convex",
      assets: ["USDC", "WBTC", "ETH"],
      risks: ["COMPLEXITY_LOW", "IL_LOW", "MCAP_MEDIUM", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-tricrypto-0/deposit",
      removeLiquidityUrl: "https://curve.fi/#/ethereum/pools/factory-tricrypto-0/withdraw",
      ...getZapMetadata(ZapCategory.CURVE_CONVEX_ETH, ZapTypeCurveConvex.CURVE_CONVEX),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCurveConvex__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCurveConvex__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<CurveConvexTriCryptoUSDCDeployer> {
    const master = await this._deployStrategyMaster();

    return new CurveConvexTriCryptoUSDCDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<CurveConvexTriCryptoUSDCDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new CurveConvexTriCryptoUSDCDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
