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
export const getBalancerUSDC_USDbC_axlUSDCParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x0C659734f1eEF9C63B7Ebdf78a164CDd745586Db",
    true,
    true,
    [
      {
        poolId: "0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
      {
        poolId: "0x0c659734f1eef9c63b7ebdf78a164cdd745586db000000000000000000000046",
        assetInIndex: 2,
        assetOutIndex: 3,
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
      [
        "0x4200000000000000000000000000000000000006",
        "0x6FbFcf88DB1aADA31F34215b2a1Df7fafb4883e9",
        "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        "0x0C659734f1eEF9C63B7Ebdf78a164CDd745586Db",
      ],
    ],
    "0x29B0C494eD7d098F4930428F115DcAf42a92392b",
    commonParameters,
  ] as StrategyConstructorParams<StrategyBalancerMultiReward>;

// eslint-disable-next-line camelcase
export class BaseBalancerUSDC_USDbC_axlUSDCDeployer extends VaultDeployer<
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
    return "BASE Balancer USDC/USDbC/axlUSDC";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBalancerMultiReward> {
    return getBalancerUSDC_USDbC_axlUSDCParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "balancer-base-usdc-usdbc-axlusdc",
      name: "USDC/USDbC/axlUSDC",
      token: "USDC/USDbC/axlUSDC Base",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "balancer-base-usdc-usdbc-axlusdc",
      status: "active",
      platformId: "balancer",
      assets: ["USDC", "USDbC", "axlUSDC"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0x0c659734f1eef9c63b7ebdf78a164cdd745586db000000000000000000000046/add-liquidity",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0x0c659734f1eef9c63b7ebdf78a164cdd745586db000000000000000000000046/withdraw",
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
  override async deployStrategyMaster(): Promise<BaseBalancerUSDC_USDbC_axlUSDCDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBalancerUSDC_USDbC_axlUSDCDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBalancerUSDC_USDbC_axlUSDCDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBalancerUSDC_USDbC_axlUSDCDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
