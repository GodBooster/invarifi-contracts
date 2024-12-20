import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line camelcase
import { StrategyBalancerMultiReward, StrategyBalancerMultiReward__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperTypeUniV2, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import {
    VaultDeployer,
    VaultMetadata,
    ZapTypeBalancerAuraArbitrum,
    getZapMetadata,
} from "../../../types/vault-deployer";

// eslint-disable-next-line camelcase
export const getBalancercbETH_ETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xFb4C2E6E6e27B5b4a07a36360C89EDE29bB3c9B6",
    true,
    true,
    [
      {
        poolId: "0xfb4c2e6e6e27b5b4a07a36360c89ede29bb3c9b6000000000000000000000026",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ],
    [
      {
        poolId: "0xb328b50f1f7d97ee8ea391ab5096dd7657555f49000100000000000000000048",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0x433f09ca08623e48bac7128b7105de678e37d988000100000000000000000047",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    [
      [
        "0x4158734D47Fc9692176B5085E0F52ee0Da5d47F1",
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "0x4200000000000000000000000000000000000006",
      ],
      ["0x4200000000000000000000000000000000000006", "0xFb4C2E6E6e27B5b4a07a36360C89EDE29bB3c9B6"],
    ],
    "0x1E8448976bD7D403e32304aEbe8b64c4A1fa7Ee8",
    commonParameters,
  ] as StrategyConstructorParams<StrategyBalancerMultiReward>;

// eslint-disable-next-line camelcase
export class BaseBalancercbETH_ETHDeployer extends VaultDeployer<
  StrategyBalancerMultiReward,
  // eslint-disable-next-line camelcase
  StrategyBalancerMultiReward__factory,
  StrategyConstructorParams<StrategyBalancerMultiReward>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyBalancerMultiReward>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.BASE_MAINNET;
  }

  override rawVaultName() {
    return "BASE Balancer cbETH-ETH";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBalancerMultiReward> {
    return getBalancercbETH_ETHParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "balancer-base-cbeth-weth",
      name: "cbETH-ETH",
      token: "cbETH-ETH base",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "balancer-base-cbeth-weth",
      status: "active",
      platformId: "balancer",
      assets: ["cbETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0xfb4c2e6e6e27b5b4a07a36360c89ede29bb3c9b6000000000000000000000026/add-liquidity",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0xfb4c2e6e6e27b5b4a07a36360c89ede29bb3c9b6000000000000000000000026/withdraw",
      earnLpHelperType: LpHelperTypeUniV2.V2_BALANCER,
      ...getZapMetadata(ZapCategory.BALANCER_AURA_ARBITRUM, ZapTypeBalancerAuraArbitrum.BALANCER_AURA_ARBITRUM),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyBalancerMultiReward__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyBalancerMultiReward__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<BaseBalancercbETH_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBalancercbETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBalancercbETH_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBalancercbETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
