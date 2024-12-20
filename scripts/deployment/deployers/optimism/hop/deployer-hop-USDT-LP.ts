import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StrategyHopSolidlyUniV3, StrategyHopSolidlyUniV3__factory } from "../../../../../typechain-types";
import { CommonAddressesAccessableStruct, NetworkDeploymentConfig, StrategyDeploymentConfig } from "../../../types";
import { LpHelperType, Network, ZapCategory } from "../../../types/network-config";
import { StrategyConstructorParams } from "../../../types/strategy-constructor-params";
import { VaultDeployer, VaultMetadata, ZapTypeHop, getZapMetadata } from "../../../types/vault-deployer";

export const getOpHopUsdtLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xF753A50fc755c6622BBCAa0f59F0522f264F006e",
    "0xAeB1b49921E0D2D96FcDBe0D486190B2907B3e0B",
    "0xeC4B41Af04cF917b54AEb6Df58c0f8D78895b5Ef",
    [
      {
        from: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
      },
    ],
    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    ["0x4200000000000000000000000000000000000006", "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"],
    [500],
    commonParameters,
  ] as StrategyConstructorParams<StrategyHopSolidlyUniV3>;

// eslint-disable-next-line camelcase
export class OpHopUSDT_LPDeployer extends VaultDeployer<
  StrategyHopSolidlyUniV3,
  // eslint-disable-next-line camelcase
  StrategyHopSolidlyUniV3__factory,
  StrategyConstructorParams<StrategyHopSolidlyUniV3>
> {
  constructor(
    hre: HardhatRuntimeEnvironment,
    networkConfig: NetworkDeploymentConfig,
    strategyConfig?: StrategyDeploymentConfig<StrategyConstructorParams<StrategyHopSolidlyUniV3>>
  ) {
    super(hre, networkConfig, strategyConfig ?? {});
  }

  override targetNetwork() {
    return Network.OPTIMISM_MAINNET;
  }

  override rawVaultName() {
    return "OP Hop DAI LP";
  }

  override async unirouter() {
    return "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";
  }

  override defaultStrategyParams(
    commonParameters: CommonAddressesAccessableStruct
  ): StrategyConstructorParams<StrategyHopSolidlyUniV3> {
    return getOpHopUsdtLpParams(commonParameters);
  }

  override async metadata(): Promise<VaultMetadata> {
    return this.withDefaultMetadata({
      id: "hop-op-usdt",
      name: "USDT LP",
      token: "USDT-hUSDT LP",
      tokenProviderId: "hop",
      oracle: "lps",
      oracleId: "hop-op-usdt",
      status: "active",
      platformId: "hop",
      assets: ["USDT"],
      risks: ["COMPLEXITY_LOW", "BATTLE_TESTED", "IL_NONE", "MCAP_LARGE", "AUDIT", "CONTRACTS_VERIFIED"],
      strategyTypeId: "single-lp",
      buyTokenUrl: "https://app.1inch.io/#/10/unified/swap/ETH/USDT",
      addLiquidityUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=optimism",
      removeLiquidityUrl: "https://app.hop.exchange/#/pool/withdraw?token=USDT&sourceNetwork=optimism",
      earnLpHelperType: LpHelperType.HOP,
      ...getZapMetadata(ZapCategory.HOP, ZapTypeHop.HOP),
    });
  }

  // eslint-disable-next-line camelcase
  override async strategyFactory(): Promise<StrategyHopSolidlyUniV3__factory> {
    const [deployer] = await this.hre.ethers.getSigners();
    return new StrategyHopSolidlyUniV3__factory(deployer);
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyMaster(): Promise<OpHopUSDT_LPDeployer> {
    const master = await this._deployStrategyMaster();

    return new OpHopUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      beaconAddress: master.address,
    });
  }

  // eslint-disable-next-line camelcase
  override async deployStrategyClone(): Promise<OpHopUSDT_LPDeployer> {
    const { clone } = await this._deployStrategyClone();

    return new OpHopUSDT_LPDeployer(this.hre, this.networkConfig, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.strategyConfig,
      vaultConstructorParams: this.getVaultConstructorParams(clone),
    });
  }
}
