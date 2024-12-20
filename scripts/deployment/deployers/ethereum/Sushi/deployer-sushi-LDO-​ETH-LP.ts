// eslint-disable-next-line node/no-missing-import
import { StrategyCommonChefLP, StrategyCommonChefLP__factory } from "../../../../../typechain-types";
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

// 1	_want	address	0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a
// 2	_poolId	uint256	109
// 3	_chef	address	0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd
// 4	_outputToNativeRoute	address	0x6B3595068778DD592e39A122f4f5a5cF09C90fE2
// 5	_outputToNativeRoute	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 6	_outputToLp0Route	address	0x6B3595068778DD592e39A122f4f5a5cF09C90fE2
// 7	_outputToLp0Route	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 8	_outputToLp0Route	address	0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32
// 9	_outputToLp1Route	address	0x6B3595068778DD592e39A122f4f5a5cF09C90fE2
// 10	_outputToLp1Route	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 3	_commonAddresses.vault	address	0x4742c355711a2790b17CC0Fe48035a1AF9C22432
// 3	_commonAddresses.unirouter	address	0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F
// 3	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 3	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
// 3	_commonAddresses.feeRecipient	address	0x8237f3992526036787E8178Def36291Ab94638CD
// 3	_commonAddresses.feeConfig	address	0x3d38BA27974410679afF73abD096D7Ba58870EAd

// eslint-disable-next-line camelcase
export const getSushiLDP_ETHLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a", // _want
    109, // _poolId
    "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd", // _chef
    ["0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    [
      "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    ],
    ["0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCommonChefLP>;

// eslint-disable-next-line camelcase
export class SushiLDO_ETHLPDeployer extends VaultDeployer<
  StrategyCommonChefLP,
  // eslint-disable-next-line camelcase
  StrategyCommonChefLP__factory,
  StrategyConstructorParams<StrategyCommonChefLP>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyCommonChefLP>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ETH_MAINNET;
  }

  override rawVaultName() {
    return "Sushi LDO ETH LP";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyCommonChefLP> {
    return getSushiLDP_ETHLpParams(commonParameters);
  }

  override async unirouter(): Promise<string> {
    return "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "sushi-mainnet-ldo-weth",
      name: "LDO-ETH LP",
      token: "LDO-ETH LP",
      tokenProviderId: "sushi",
      tokenAmmId: "ethereum-sushi",
      oracle: "lps",
      oracleId: "sushi-mainnet-ldo-weth",
      status: "active",
      platformId: "sushi",
      assets: ["LDO", "WETH"],
      risks: ["COMPLEXITY_LOW", "IL_HIGH", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      earnLpHelperType: LpHelperType.UNI_V2,
      addLiquidityUrl: "https://www.sushi.com/earn/eth:0xc558f600b34a5f69dd2f0d06cb8a88d829b7420a/add",
      removeLiquidityUrl: "https://www.sushi.com/earn/eth:0xc558f600b34a5f69dd2f0d06cb8a88d829b7420a/remove",
      ...getZapMetadata(ZapCategory.COMMON, ZapTypeCommon.UNISWAP_V2_LP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyCommonChefLP__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyCommonChefLP__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<SushiLDO_ETHLPDeployer> {
    const master = await this._deployStrategyMaster();

    return new SushiLDO_ETHLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<SushiLDO_ETHLPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new SushiLDO_ETHLPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
