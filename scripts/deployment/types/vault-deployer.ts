import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import { Contract, ContractFactory } from "ethers";
import {
  CommonAddressesAccessableStruct,
  NetworkDeploymentConfig,
  NetworkDeploymentJsonConfig,
  StrategyDeploymentConfig,
} from ".";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory, VaultFactory, VaultV7__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { assert } from "console";
import { LpHelperType, LpHelperTypeUniV2, Network, ZapCategory } from "./network-config";
// eslint-disable-next-line node/no-extraneous-import
import _ from "lodash";
// eslint-disable-next-line node/no-missing-import
import { getAddress } from "ethers/lib/utils";
import { saveDeployerConfig, saveVaultMetadata } from "../configs/save-config";
// eslint-disable-next-line node/no-missing-import

type Must<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type VaultConfigs = {
  networkConfig: NetworkDeploymentJsonConfig;
  strategyConfig: StrategyDeploymentConfig<Array<unknown>>;
};

export enum ZapTypeCommon {
  SINGLE = 0,
  SINGLE_GOV,
  UNISWAP_V2_LP,
  SOLIDLY_STABLE_LP,
  SOLIDLY_VOLATILE_LP,
  STARGATE,
}

export enum ZapTypeBalancerAuraEth {
  BALANCER_AURA = 0,
  BALANCER_AURA_MULTI_REWARD,
  BALANCER_AURA_GYRO,
}

export enum ZapTypeCurveConvex {
  CONVEX = 0,
  CURVE_CONVEX,
}

export enum ZapTypeHop {
  HOP = 0,
}

export enum ZapTypeCurveOp {
  CURVE = 0,
}

export enum ZapTypeRetroGamma {
  RETRO_GAMMA = 0,
}

export enum ZapTypeBalancerAuraArbitrum {
  BALANCER_AURA_ARBITRUM = 0,
}

export enum ZapTypeVelodrome {
  VELODROME = 0,
}

export enum ZapTypeBaseSwap {
  BASESWAP = 0,
}

export type ZapTypeId =
  | ZapTypeCommon
  | ZapTypeBalancerAuraEth
  | ZapTypeCurveConvex
  | ZapTypeHop
  | ZapTypeRetroGamma
  | ZapTypeBalancerAuraArbitrum
  | ZapTypeVelodrome
  | ZapTypeCurveOp
  | ZapTypeBaseSwap;

export const getZapMetadata = (
  category: ZapCategory,
  type: ZapTypeId
): Pick<VaultMetadata, "zapCategory" | "zapId"> => ({
  zapId: type,
  zapCategory: category,
});

export type VaultMetadata = {
  id: string;
  name: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenProviderId?: string;
  tokenAmmId?: string;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number;
  earnContractAddress: string;
  oracle: string;
  oracleId: string;
  status: string;
  zapCategory?: ZapCategory;
  zapId?: ZapTypeId;
  earnLpHelperType?: LpHelperType | LpHelperTypeUniV2;
  platformId: string;
  assets: string[];
  risks: string[];
  strategyTypeId: string;
  buyTokenUrl?: string;
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
  network: string;
  isGovVault?: boolean;
  excluded?: string;
  createdAt: number;
};

type Nullable<T> = { [K in keyof T]?: T[K] };

type RequiredVaultMetadata = Omit<
  VaultMetadata,
  | "tokenAddress"
  | "tokenDecimals"
  | "earnedToken"
  | "earnedTokenAddress"
  | "earnContractAddress"
  | "createdAt"
  | "network"
>;

type DeployerVaultMetadataParams = RequiredVaultMetadata & Nullable<Omit<VaultMetadata, keyof RequiredVaultMetadata>>;

export abstract class VaultDeployer<
  TStrategy extends Contract = Contract,
  TStrategyFactory extends ContractFactory = ContractFactory,
  TStrategyInitParams extends Array<unknown> = Array<unknown>
> {
  constructor(
    public readonly hre: HardhatRuntimeEnvironment,
    public readonly networkConfig: NetworkDeploymentConfig,
    public readonly strategyConfig: StrategyDeploymentConfig<TStrategyInitParams>
  ) {
    const chainId = hre.network.config.chainId;
    assert(chainId === this.targetNetwork() || hre.network.name === "localhost" || hre.network.name === "hardhat");
    this.strategyConfig.getConstructorParams ??= (commonParameters: CommonAddressesAccessableStruct) =>
      this.defaultStrategyParams(commonParameters);

    // config values passed in constructor that are not null or undefined
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    const nonNullVaultConfigValues = Object.fromEntries(
      Object.entries(this.strategyConfig.vaultConfig ?? {}).filter(([, value]) => !!value)
    );

    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    const nonNullStrategyConfigValues = Object.fromEntries(
      Object.entries(this.strategyConfig.strategyConfig ?? {}).filter(([, value]) => !!value)
    );

    this.strategyConfig.vaultConfig = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.getDefaultVaultConfig(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...nonNullVaultConfigValues,
    };

    this.strategyConfig.strategyConfig = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...this.getDefaultStrategyConfig(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...nonNullStrategyConfigValues,
    };
  }

  public static async migrateStrategy<
    TStrategy extends Contract,
    TStrategyFactory extends ContractFactory,
    TStrategyInitParams extends Array<unknown>
  >(deployer: VaultDeployer<TStrategy, TStrategyFactory, TStrategyInitParams>) {
    const deployed = await VaultDeployer.deploy(deployer);

    const vault = VaultV7__factory.connect(
      deployer.networkConfig.deployCommonParams.vault ?? "",
      deployed.hre.ethers.provider
    );

    const currentStrategy = await vault.strategy();

    if (getAddress(currentStrategy) === getAddress(deployer.strategyConfig.vaultConstructorParams?.strategy ?? "")) {
      console.log(`${deployer.rawVaultName()} does'nt need a migration`);
      return deployed;
    } else {
      console.log("Running migration");
      const res = await deployed.migrateStrategy();
      console.log("Strategy migration successfully finished");
      return res;
    }
  }

  public static async deploy<
    TStrategy extends Contract,
    TStrategyFactory extends ContractFactory,
    TStrategyInitParams extends Array<unknown>
  >(deployer: VaultDeployer<TStrategy, TStrategyFactory, TStrategyInitParams>) {
    if (deployer.strategyConfig.beaconAddress) {
      console.log(
        `${deployer.rawVaultName()} master is already deployed on ${deployer.strategyConfig.beaconAddress}, skipping...`
      );
    } else {
      deployer = await deployer.deployStrategyMaster();
      await saveDeployerConfig(deployer.hre, deployer);
    }

    if (deployer.strategyConfig.vaultConstructorParams?.strategy) {
      console.log(
        `${deployer.rawVaultName()} clone is already deployed on ${
          deployer.strategyConfig.vaultConstructorParams.strategy
        }, skipping...`
      );
    } else {
      deployer = await deployer.deployStrategyClone();
      await saveDeployerConfig(deployer.hre, deployer);

      console.log(`Clone is deployed on ${deployer.strategyConfig.vaultConstructorParams?.strategy}`);
    }

    if (deployer.networkConfig.deployCommonParams.vault) {
      console.log(
        `${deployer.rawVaultName()} vault is already deployed on ${
          deployer.networkConfig.deployCommonParams.vault
        }, skipping...`
      );
    } else {
      deployer = await deployer.deployVaultWithStrategy();
      await saveDeployerConfig(deployer.hre, deployer);
    }

    const factory = await deployer.strategyFactory();
    const strategy = factory.attach(deployer.strategyConfig.vaultConstructorParams?.strategy ?? "") as TStrategy;

    const vaultAddress = await strategy.vault();

    if (vaultAddress !== deployer.hre.ethers.constants.AddressZero) {
      console.log(
        `${deployer.rawVaultName()} strategy is already initialized on ${
          deployer.strategyConfig.vaultConstructorParams?.strategy
        }, skipping...`
      );
    } else {
      deployer = await deployer.initializeStrategy();
      await saveDeployerConfig(deployer.hre, deployer);
      console.log("Strategy is initialized");
    }

    const vault = VaultV7__factory.connect(
      deployer.networkConfig.deployCommonParams.vault ?? "",
      deployer.hre.ethers.provider
    );

    const currentStrategy = await vault.strategy();

    if (getAddress(currentStrategy) === getAddress(strategy.address)) {
      console.log(`${deployer.rawVaultName()} does'nt need a migration`);
    } else {
      console.log("Running migration");
      deployer = await deployer.migrateStrategy();
      console.log("Strategy migration successfully finished");
    }

    if (deployer.strategyConfig.strategyConfig?.feeCategoryId === 0) {
    } else {
      const feeId = (await strategy.getStratFeeId()).toString();
      if (deployer.strategyConfig.strategyConfig?.feeCategoryId?.toString() === feeId) {
        console.log(`${deployer.rawVaultName()} fee is already set ${feeId.toString()}, skipping...`);
      } else {
        deployer = await deployer.setStrategyFee();
        await saveDeployerConfig(deployer.hre, deployer);

        console.log(`${deployer.vaultName()} is deployed.`, {
          strategy: deployer.strategyConfig.vaultConstructorParams?.strategy,
          vault: deployer.networkConfig.deployCommonParams.vault,
        });
      }
    }

    deployer = await deployer.onAfterStrategyInitialized();
    await saveDeployerConfig(deployer.hre, deployer);

    saveVaultMetadata(deployer.hre, await deployer.metadata());
    return deployer;
  }

  protected async _deployStrategyMaster(): Promise<TStrategy> {
    const factory = await this.strategyFactory();

    const master = (await this.hre.upgrades.deployBeacon(factory, { unsafeAllow: ["constructor"] })) as TStrategy;
    console.log(`Strategy beacon is deployed to ${master.address}`);

    await master.deployed();

    return master;
  }

  vaultName(): string {
    return this.toCuberaVaultName(this.rawVaultName());
  }

  vaultSymbol(): string {
    return _.camelCase(this.vaultName());
  }

  wantToken() {
    const commonParams = this.networkConfig.deployCommonParams;
    const params = this.strategyConfig?.getConstructorParams?.(commonParams as any);
    return params?.[0] as string | undefined;
  }

  wantTokenDecimals() {
    const wantTokenAddress = this.wantToken();

    if (!wantTokenAddress) throw new Error("Want token address is unknown");

    const wantToken = ERC20__factory.connect(wantTokenAddress, this.hre.ethers.provider);

    return wantToken.decimals();
  }

  protected getDefaultVaultConfig() {
    return {
      strategyChangeApprovalDelay: 60 * 60,
      vaultName: this.vaultName(),
      vaultSymbol: this.vaultSymbol(),
    } as StrategyDeploymentConfig<TStrategyInitParams>["vaultConfig"];
  }

  protected getDefaultStrategyConfig() {
    return {
      feeCategoryId: 0, // default
    } as StrategyDeploymentConfig<TStrategyInitParams>["strategyConfig"];
  }

  async _deployStrategyClone() {
    if (!this.strategyConfig.beaconAddress) throw new Error("Master contract is not deployed");

    const vaultFactory = this.networkConfig.vaultFactory;

    const tx = await (await vaultFactory.deployStrategy(this.strategyConfig.beaconAddress, "0x")).wait();

    const ev = tx.events?.find(v => v.event === "StrategyProxyDeployed");

    const cloneAddress = ev?.args?.[0];
    console.log({ cloneAddress });

    if (!cloneAddress) throw new Error("Invalid clone address");

    const factory = await this.strategyFactory();

    const clone = factory.attach(cloneAddress) as TStrategy;

    return { clone };
  }

  async setStrategyFee() {
    if (!this.strategyConfig.strategyConfig) {
      throw new Error("Strategy config is not properly set");
    }
    const factory = await this.strategyFactory();
    const strategyAddress = this.strategyConfig?.vaultConstructorParams?.strategy;
    const strategy = factory.attach(strategyAddress ?? "") as TStrategy;

    const tx = await strategy.setStratFeeId(this.strategyConfig.strategyConfig.feeCategoryId);

    await tx.wait();

    return this;
  }

  async deployVaultWithStrategy() {
    console.log("deployVaultWithStrategy");

    if (!this.strategyConfig.vaultConfig || !this.strategyConfig.vaultConstructorParams) {
      throw new Error("Vault config is not properly set");
    }

    const params = this.getVaultInitializeParams();

    const vaultFactory = this.networkConfig.vaultFactory;

    const tx = await (await vaultFactory.deployVault(params)).wait();
    const ev = tx.events?.find(v => v.event === "VaultDeployed");

    const vaultAddress = ev?.args?.[0];
    console.log({ vaultAddress });

    if (!vaultAddress) throw new Error("Invalid vault address");

    const [signer] = await this.hre.ethers.getSigners();
    // eslint-disable-next-line camelcase
    const vault = VaultV7__factory.connect(vaultAddress, signer);

    const commonParams = this.networkConfig.deployCommonParams;
    commonParams.vault ??= vault.address;

    if (!commonParams.vault) {
      throw new Error("Vault wasnt properly deployed");
    }

    console.log(`Vault deployed to ${vault.address}`);

    await vault.deployed();

    return this;
  }

  protected async initializeStrategy() {
    if (!this.strategyConfig.vaultConfig || !this.strategyConfig.vaultConstructorParams) {
      throw new Error("Vault config is not properly set");
    }

    const factory = await this.strategyFactory();

    const strategyAddress = this.strategyConfig.vaultConstructorParams.strategy;

    const initializeParams = this?.strategyConfig?.getConstructorParams?.(
      (await this.getCommonParams()) as CommonAddressesAccessableStruct
    );

    if (!initializeParams) {
      throw new Error("No initialize parameters provided");
    }

    const strategy = factory.attach(strategyAddress) as TStrategy;

    const tx = await strategy.initialize(...initializeParams);

    await tx.wait();

    this.strategyConfig.createdAt = new Date();

    return this;
  }

  protected async migrateStrategy() {
    if (!this.strategyConfig.vaultConfig || !this.strategyConfig.vaultConstructorParams) {
      throw new Error("Vault config is not properly set");
    }
    const [deployer] = await this.hre.ethers.getSigners();

    const vault = VaultV7__factory.connect(this.networkConfig.deployCommonParams.vault ?? "", deployer);

    const strategyAddress = this.strategyConfig.vaultConstructorParams.strategy;

    const tx = await vault.upgradeStrat(strategyAddress);
    await tx.wait();

    return this;
  }

  public async getCommonParams(): Promise<NetworkDeploymentConfig["deployCommonParams"]> {
    return {
      ...this.networkConfig.deployCommonParams,
      unirouter: await this.unirouter(),
    };
  }

  protected async unirouter(): Promise<string> {
    return this.networkConfig.deployCommonParams.unirouter;
  }

  protected getVaultInitializeParams() {
    const { vaultConstructorParams } = this.strategyConfig;
    const { deployCommonParams } = this.networkConfig;

    if (!vaultConstructorParams || !deployCommonParams) {
      throw new Error("Vault constructor params are not set");
    }

    return {
      _name: vaultConstructorParams._name,
      _strategy: vaultConstructorParams.strategy,
      _symbol: vaultConstructorParams._symbol,
      _approvalDelay: vaultConstructorParams._approvalDelay,
      _feeRecipient: deployCommonParams.feeRecipient,
      _ac: deployCommonParams.ac,
    } as VaultFactory.VaultParamsStruct;
  }

  protected getVaultConstructorParams(clone: TStrategy) {
    const vaultConfig = this.strategyConfig.vaultConfig as
      | Must<StrategyDeploymentConfig<TStrategyInitParams>["vaultConfig"]>
      | undefined;

    return !vaultConfig
      ? undefined
      : {
          _approvalDelay: vaultConfig.strategyChangeApprovalDelay,
          _name: vaultConfig.vaultName,
          _symbol: vaultConfig.vaultSymbol,
          strategy: clone.address,
        };
  }

  protected toCuberaVaultName(name: string) {
    if (name.toLowerCase().includes("invarifi")) return name.trim();
    return "InvariFi " + name.trim();
  }

  protected async withDefaultMetadata(params: DeployerVaultMetadataParams): Promise<VaultMetadata> {
    return {
      tokenAddress: this.wantToken() ?? "0x",
      tokenDecimals: await this.wantTokenDecimals(),
      earnedToken: this.vaultSymbol(),
      earnedTokenAddress: this.networkConfig.deployCommonParams.vault ?? "0x",
      earnContractAddress: this.networkConfig.deployCommonParams.vault ?? "0x",
      network: this.hre.forkingNetwork?.name ?? this.hre.network.name,
      createdAt: Math.floor((this.strategyConfig.createdAt?.getTime?.() ?? 0) / 1000),
      ...params,
    };
  }

  async onAfterStrategyInitialized(): Promise<VaultDeployer<TStrategy, TStrategyFactory, TStrategyInitParams>> {
    return this;
  }

  abstract metadata(): Promise<VaultMetadata>;

  abstract rawVaultName(): string;

  abstract targetNetwork(): Network;

  abstract strategyFactory(): Promise<TStrategyFactory>;

  abstract defaultStrategyParams(commonParameters: CommonAddressesAccessableStruct): TStrategyInitParams;

  abstract deployStrategyMaster(): Promise<VaultDeployer<TStrategy, TStrategyFactory, TStrategyInitParams>>;

  abstract deployStrategyClone(): Promise<VaultDeployer<TStrategy, TStrategyFactory, TStrategyInitParams>>;
}
