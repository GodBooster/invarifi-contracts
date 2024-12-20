import {
    StrategyRetroGamma,
    // eslint-disable-next-line camelcase
    StrategyRetroGamma__factory,
} from "../../../../../typechain-types";
import { getZapMetadata, VaultDeployer, VaultMetadata, ZapTypeRetroGamma } from "../../../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
// eslint-disable-next-line node/no-missing-import
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";

// Function: initialize(address, bytes, bytes, bytes, (address,bytes,bytes,bool,bool), (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0xBE4E30b74b558E41f5837dC86562DF44aF57A013
// 2	_outputToNativePath	bytes	0xbfa35599c7aebb0dace9b5aa3ca5f2a79624d8eb0027100d500b1d8e8ef31e21c99d1db9a6444d3adf1270
// 3	_nativeToLp0Path	bytes	0x
// 4	_nativeToLp1Path	bytes	0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f42791bca1f2de4661ed88a30c99a7a9449aa84174
// 4	_flash.pool	address	0x619259F699839dD1498FFC22297044462483bD27
// 4	_flash.outputToCash	bytes	0xbfa35599c7aebb0dace9b5aa3ca5f2a79624d8eb0027105d066d022ede10efa2717ed3d79f22f949f8c175
// 4	_flash.cashToNative	bytes	0x5d066d022ede10efa2717ed3d79f22f949f8c1750001f40d500b1d8e8ef31e21c99d1db9a6444d3adf1270
// 4	_flash.token0	bool	false
// 4	_flash.flashEntered	bool	false
// 5	_commonAddresses.vault	address	0x0fC4f2DB534Bf7525710DBf64B7081e1a3A6428f
// 5	_commonAddresses.unirouter	address	0x1891783cb3497Fdad1F25C933225243c2c7c4102
// 5	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 5	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
// 5	_commonAddresses.feeRecipient	address	0x7313533ed72D2678bFD9393480D0A30f9AC45c1f
// 5	_commonAddresses.feeConfig	address	0x8E98004FE65A2eAdA63AD1DE0F5ff76d845f14E7

export const getUsdcMaticRetroGammaInitializeParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xBE4E30b74b558E41f5837dC86562DF44aF57A013", // want
    "0xbfa35599c7aebb0dace9b5aa3ca5f2a79624d8eb0027100d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // outputToNativePath,
    "0x", // nativeToLp0Path
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f42791bca1f2de4661ed88a30c99a7a9449aa84174", // nativeToLp1Path
    {
      pool: "0x619259F699839dD1498FFC22297044462483bD27", // flash.pool
      outputToCash: "0xbfa35599c7aebb0dace9b5aa3ca5f2a79624d8eb0027105d066d022ede10efa2717ed3d79f22f949f8c175", // flash.outputToCash
      cashToNative: "0x5d066d022ede10efa2717ed3d79f22f949f8c1750001f40d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // flash.cashToNative,
      token0: false, // flash.token0,
      flashEntered: false, // flash.flashEntered
    },
    commonParameters,
  ] as StrategyConstructorParams<StrategyRetroGamma>;

export class PolyRetroGammaUSDC_MATIC_LPDeployer extends VaultDeployer<
  StrategyRetroGamma,
  // eslint-disable-next-line camelcase
  StrategyRetroGamma__factory,
  StrategyConstructorParams<StrategyRetroGamma>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyRetroGamma>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.POLYGON_MAINNET;
  }

  override rawVaultName() {
    return "Poly Retro Gamma USDC-MATIC LP";
  }

  override async unirouter() {
    return "0x1891783cb3497Fdad1F25C933225243c2c7c4102";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyRetroGamma> {
    return getUsdcMaticRetroGammaInitializeParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "retro-gamma-wmatic-usdc-narrow",
      name: "USDC-MATIC LP",
      token: "USDC-MATIC rLP",
      tokenProviderId: "retro",
      oracle: "lps",
      oracleId: "retro-gamma-wmatic-usdc-narrow",
      status: "active",
      platformId: "gamma",
      assets: ["USDC", "MATIC"],
      risks: ["COMPLEXITY_LOW", "IL_HIGH", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl: "https://app.gamma.xyz/vault/retro/polygon/details/wmatic-usdc-500-narrow",
      removeLiquidityUrl: "https://app.gamma.xyz/vault/retro/polygon/details/wmatic-usdc-500-narrow",
      earnLpHelperType: LpHelperType.RETRO_GAMMA,
      ...getZapMetadata(ZapCategory.RETRO_GAMMA, ZapTypeRetroGamma.RETRO_GAMMA),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyRetroGamma__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyRetroGamma__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<PolyRetroGammaUSDC_MATIC_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new PolyRetroGammaUSDC_MATIC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<PolyRetroGammaUSDC_MATIC_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new PolyRetroGammaUSDC_MATIC_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
