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
export const getBalancerrETH_ETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xC771c1a5905420DAEc317b154EB13e4198BA97D0",
    true,
    true,
    [
      {
        poolId: "0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023",
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
      ["0x4200000000000000000000000000000000000006", "0xC771c1a5905420DAEc317b154EB13e4198BA97D0"],
    ],
    "0x8D118063B521e0CB9947A934BE90f7e32d02b158",
    commonParameters,
  ] as StrategyConstructorParams<StrategyBalancerMultiReward>;

// eslint-disable-next-line camelcase
export class BaseBalancerrETH_ETHDeployer extends VaultDeployer<
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
    return "BASE Balancer rETH-​ETH";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyBalancerMultiReward> {
    return getBalancerrETH_ETHParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "balancer-base-weth-reth",
      name: "rETH-ETH",
      token: "rETH-ETH Base",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "balancer-base-weth-reth",
      status: "active",
      platformId: "balancer",
      assets: ["rETH", "ETH"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023/add-liquidity",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/base/pool/0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023/withdraw",
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
  override async deployStrategyMaster(): Promise<BaseBalancerrETH_ETHDeployer> {
    const master = await this._deployStrategyMaster();

    return new BaseBalancerrETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<BaseBalancerrETH_ETHDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new BaseBalancerrETH_ETHDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
