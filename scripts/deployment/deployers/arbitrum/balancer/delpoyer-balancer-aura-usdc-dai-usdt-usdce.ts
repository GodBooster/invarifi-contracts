import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyAuraSideChain, StrategyAuraSideChain__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import {
  VaultDeployer,
  VaultMetadata,
  ZapTypeBalancerAuraArbitrum,
  getZapMetadata,
} from "../../../types/vault-deployer";

// Function: initialize(address, bool, (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], address, uint256, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x423A1323c871aBC9d89EB06855bF5347048Fc4A5
// 2	_inputIsComposable	bool	true
// 2	_nativeToInputRoute.poolId	bytes32	0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002
// 2	_nativeToInputRoute.assetInIndex	uint256	0
// 2	_nativeToInputRoute.assetOutIndex	uint256	1
// 3	_nativeToInputRoute.poolId	bytes32	0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496
// 3	_nativeToInputRoute.assetInIndex	uint256	1
// 3	_nativeToInputRoute.assetOutIndex	uint256	2
// 4	_outputToNativeRoute.poolId	bytes32	0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458
// 4	_outputToNativeRoute.assetInIndex	uint256	0
// 4	_outputToNativeRoute.assetOutIndex	uint256	1
// 5	_outputToNativeRoute.poolId	bytes32	0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001
// 5	_outputToNativeRoute.assetInIndex	uint256	1
// 5	_outputToNativeRoute.assetOutIndex	uint256	2
// 7	_booster	address	0x98Ef32edd24e2c92525E59afc4475C1242a30184
// 8	_pid	uint256	28
// 8	_nativeToInput	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 9	_nativeToInput	address	0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
// 10	_nativeToInput	address	0x423A1323c871aBC9d89EB06855bF5347048Fc4A5
// 11	_outputToNative	address	0x912CE59144191C1204E64559FE8253a0e49E6548
// 12	_outputToNative	address	0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8
// 13	_outputToNative	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 14	_commonAddresses.vault	address	0x2Aa59693D8A72C43C243698038b468AC7c9a1D73
// 14	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 14	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 14	_commonAddresses.strategist	address	0xfB41Cbf2ce16E8f626013a2F465521d27BA9a610
// 14	_commonAddresses.feeRecipient	address	0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f
// 14	_commonAddresses.feeConfig	address	0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED

export const getArbBalancerUSDC_DAI_USDT_USDCeParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x423A1323c871aBC9d89EB06855bF5347048Fc4A5",
    true,
    [
      {
        poolId: "0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    [
      {
        poolId: "0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    "0x98Ef32edd24e2c92525E59afc4475C1242a30184",
    28,
    [
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      "0x423A1323c871aBC9d89EB06855bF5347048Fc4A5",
    ],
    [
      "0x912CE59144191C1204E64559FE8253a0e49E6548",
      "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraSideChain>;

// eslint-disable-next-line camelcase
export class ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer extends VaultDeployer<
  StrategyAuraSideChain,
  // eslint-disable-next-line camelcase
  StrategyAuraSideChain__factory,
  StrategyConstructorParams<StrategyAuraSideChain>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyAuraSideChain>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.ARB_MAINNET;
  }

  override rawVaultName() {
    return "Arb Balancer Aura USDC/DAI/USDT/USDCe";
  }

  override async unirouter() {
    return "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyAuraSideChain> {
    return getArbBalancerUSDC_DAI_USDT_USDCeParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "balancer-usdc-dai-usdt-usdce",
      name: "USDC/DAI/USDT/USDC.e",
      token: "USDC/DAI/USDT/USDC.e Arb",
      tokenProviderId: "balancer",
      oracle: "lps",
      oracleId: "balancer-usdc-dai-usdt-usdce",
      status: "active",
      platformId: "aura",
      assets: ["USDC", "DAI", "USDT", "arbUSDCe"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "multi-lp",
      addLiquidityUrl:
        "https://app.balancer.fi/#/arbitrum/pool/0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496/add-liquidity",
      removeLiquidityUrl:
        "https://app.balancer.fi/#/arbitrum/pool/0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496/withdraw",
      earnLpHelperType: LpHelperType.BALANCER_AURA_ARBITRUM,
      ...getZapMetadata(ZapCategory.BALANCER_AURA_ARBITRUM, ZapTypeBalancerAuraArbitrum.BALANCER_AURA_ARBITRUM),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyAuraSideChain__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyAuraSideChain__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer> {
    const master = await this._deployStrategyMaster();

    return new ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
