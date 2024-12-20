import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  AerodromeUniV2LpHelper__factory,
  BalancerAuraGaugeLpHelper__factory,
  BalancerAuraGyroLpHelper__factory,
  BalancerAuraLpHelper__factory,
  BalancerAuraLpHelperArb__factory,
  BalancerUniV2LpHelper__factory,
  CurveConvexLpHelper__factory,
  CurveLpHelper__factory,
  CurveOpLpHelper__factory,
  EarnConfiguration,
  EarnConfiguration__factory,
  EarnFactory__factory,
  EarnHelper__factory,
  EarnPool__factory,
  EarnPoolChecker__factory,
  ERC20__factory,
  GelatoSwapper,
  GelatoSwapper__factory,
  GelatoSwapperUniV2__factory,
  HopLpHelper__factory,
  PriceAggregator__factory,
  RetroGammaLpHelper__factory,
  SolidlyLpHelper__factory,
  StargateLpHelper__factory,
  StargateUniV2LpHelper__factory,
  StargateUniV2LpHelperBase__factory,
  UniswapLpHelper__factory,
  UniswapV2LpHelper__factory,
  UniswapV2LpHelperBase__factory,
  UniV3TwapOracle__factory,
  VelodromeOpLpHelper__factory,
} from "../../../typechain-types";
import { readJsonVaultMetadata, saveDeploymentConfig, saveEarnMetadata } from "../configs/save-config";
import {
  ChainLinkPriceFeed,
  chainLinkPriceFeeds,
  SwapPath,
  swapPathes,
  TwapPriceFeed,
  twapPriceFeeds,
} from "./constants";
import { LpHelperType, LpHelperTypeUniV2, Network, NetworkConfig } from "./network-config";

export type EarnPoolMetadata = {
  id: string;
  name: string;
  earn: string;
  description?: string;
  vaults: {
    vaultId: string;
    lpHelper: string;
    part: number;
  }[];
  network: string;
  stableAddress: string;
  stableDecimals: number;
  stable: string;
  priceAggregator: string;
  gelatoChecker: string;
  reservedForAutomation: number;
  earnConfiguration: string;
  earnHelper: string;
  risks: string[];
  status: "active" | "paused" | "eol";
  createdAt: number;
  stopLosses: number[];
};

const _getFactoryForLpHelper = <T>(helperType: LpHelperType, deployer: SignerWithAddress) => {
  switch (helperType) {
    case LpHelperType.UNI_V2:
      return new UniswapLpHelper__factory(deployer);
    case LpHelperType.STARGATE:
      return new StargateLpHelper__factory(deployer);
    case LpHelperType.SOLIDLY:
      return new SolidlyLpHelper__factory(deployer);
    case LpHelperType.CURVE:
      return new CurveLpHelper__factory(deployer);
    case LpHelperType.CURVE_CONVEX:
      return new CurveConvexLpHelper__factory(deployer);
    case LpHelperType.CURVE_OP:
      return new CurveOpLpHelper__factory(deployer);
    case LpHelperType.BALANCER_AURA:
      return new BalancerAuraLpHelper__factory(deployer);
    case LpHelperType.BALANCER_AURA_GAUGE:
      return new BalancerAuraGaugeLpHelper__factory(deployer);
    case LpHelperType.BALANCER_AURA_GYRO:
      return new BalancerAuraGyroLpHelper__factory(deployer);
    case LpHelperType.BALANCER_AURA_ARBITRUM:
      return new BalancerAuraLpHelperArb__factory(deployer);
    case LpHelperType.RETRO_GAMMA:
      return new RetroGammaLpHelper__factory(deployer);
    case LpHelperType.HOP:
      return new HopLpHelper__factory(deployer);
    case LpHelperType.VELODROME:
      return new VelodromeOpLpHelper__factory(deployer);
    default:
      throw new Error("Unknown LpHelperType");
  }
};

const _getFactoryForLpHelperUniV2 = <T>(helperType: LpHelperTypeUniV2, deployer: SignerWithAddress) => {
  switch (helperType) {
    case LpHelperTypeUniV2.V2_UNI_V2:
      return new UniswapV2LpHelper__factory(deployer);
    case LpHelperTypeUniV2.V2_STARGATE:
      return new StargateUniV2LpHelper__factory(deployer);
    case LpHelperTypeUniV2.V2_BALANCER:
      return new BalancerUniV2LpHelper__factory(deployer);
    case LpHelperTypeUniV2.V2_VELODROME:
      return new AerodromeUniV2LpHelper__factory(deployer);
    case LpHelperTypeUniV2.V2_UNI_V2_BASE:
      return new UniswapV2LpHelperBase__factory(deployer);
    case LpHelperTypeUniV2.V2_STARGATE_BASE:
      return new StargateUniV2LpHelperBase__factory(deployer);
    default:
      throw new Error("Unknown LpHelperTypeUniV2");
  }
};

const getFactoryForLpHelper = (
  helperType: LpHelperType | LpHelperTypeUniV2,
  deployer: SignerWithAddress
):
  | {
    type: "v2";
    factory: ReturnType<typeof _getFactoryForLpHelperUniV2>;
  }
  | {
    type: "v3";
    factory: ReturnType<typeof _getFactoryForLpHelper>;
  } => {
  if (
    Object.values(LpHelperTypeUniV2)
      .map(v => v.toString())
      .includes(helperType.toString())
  ) {
    return { type: "v2", factory: _getFactoryForLpHelperUniV2(helperType as LpHelperTypeUniV2, deployer) };
  } else {
    return { type: "v3", factory: _getFactoryForLpHelper(helperType as LpHelperType, deployer) };
  }
};

export const deployLpHelpers = async (hre: HardhatRuntimeEnvironment, config: NetworkConfig) => {
  const [deployer] = await hre.ethers.getSigners();

  const network: Network = hre.forkingNetwork?.chainId ?? hre.network.config.chainId ?? 1;

  if (!config.contractsConfig.earn) throw new Error("Invalid network config");

  if (!config.contractsConfig.earn.lpHelpers) config.contractsConfig.earn.lpHelpers = {};

  const earnConfig = config.contractsConfig.earn;

  const deployedHelpers = config.contractsConfig.earn.lpHelpers;

  const deployedVaults = await readJsonVaultMetadata(hre);

  const helpersToDeploy: (LpHelperType | LpHelperTypeUniV2)[] = [];

  const ec = EarnConfiguration__factory.connect(earnConfig.earnConfiguration ?? "", deployer);
  const aggregator = PriceAggregator__factory.connect(earnConfig.priceAggregator ?? "", deployer);

  deployedVaults.forEach(v => {
    if (!v.earnLpHelperType || helpersToDeploy.includes(v.earnLpHelperType)) return;
    helpersToDeploy.push(v.earnLpHelperType);
  });

  for (const helperType of helpersToDeploy) {
    if (deployedHelpers[helperType]) {
      console.log(`Helper is already deployed for ${helperType}`);
    } else {
      const { factory, type } = getFactoryForLpHelper(helperType, deployer);
      const uniRouter = type === "v2" ? config.environment.unirouter : config.environment.unirouterV3;
      console.log({ uniRouter, type });
      const helper = await factory.deploy(
        earnConfig.earnConfiguration ?? "",
        uniRouter,
        config.contractsConfig.ac ?? ""
      );
      await helper.deployed();

      deployedHelpers[helperType] = { address: helper.address };
      await saveDeploymentConfig(hre, config);
    }

    const vaultsToSet = deployedVaults.filter(v => v.earnLpHelperType === helperType);
    const lpHelper = deployedHelpers[helperType];

    for (const vault of vaultsToSet) {
      if ((await ec.lpHelpers(vault.earnContractAddress)) === lpHelper?.address) continue;
      console.log(`set lp helper for ${vault.id}`);
      await (await ec.setLpHelper(vault.earnContractAddress, lpHelper?.address ?? "")).wait();
    }
  }

  const _swapPathes = ((swapPathes as any)[network] as Record<string, SwapPath>) ?? {};

  for (const swapPath of Object.values(_swapPathes)) {
    if ((await ec.swapPathes(swapPath.tokenFrom, swapPath.tokenTo)) === swapPath.path) {
      console.log(`Swap path for tokens ${swapPath.tokenFrom}/${swapPath.tokenTo} is already set`);
      continue;
    }

    await (await ec.setSwapPath(swapPath.tokenFrom, swapPath.tokenTo, swapPath.path)).wait(2);
  }

  const _chainLinkPriceFeeds = ((chainLinkPriceFeeds as any)[network] as Record<string, ChainLinkPriceFeed>) ?? {};

  for (const feed of Object.values(_chainLinkPriceFeeds)) {
    if ((await aggregator.dataFeeds(feed.token)) === feed.address) {
      console.log(`Price feed for ${feed.token} is already set`);
      continue;
    }

    await (await aggregator.setDataFeedForToken(feed.token, feed.address)).wait(2);
  }

  earnConfig.twapOracles ??= {};

  const _twapPriceFeeds = ((twapPriceFeeds as any)[network] as Record<string, TwapPriceFeed>) ?? {};

  for (const feed of Object.values(_twapPriceFeeds)) {
    // TODO: save deployed address to config

    if (!earnConfig.twapOracles[feed.token]) {
      const twapOracle = await new UniV3TwapOracle__factory(deployer).deploy(
        feed.uniV3Pool.address,
        feed.token,
        _chainLinkPriceFeeds[feed.usdFeed].address
      );
      await twapOracle.deployed();

      earnConfig.twapOracles[feed.token] = twapOracle.address;
      await saveDeploymentConfig(hre, config);
    } else {
      console.log(`Twap oracle is already deployed for ${feed.token}`);
    }

    if ((await aggregator.dataFeeds(feed.token)) === earnConfig.twapOracles[feed.token]) {
      console.log(`Price feed for ${feed.token} is already set`);
      continue;
    }

    await (await aggregator.setDataFeedForToken(feed.token, earnConfig.twapOracles[feed.token])).wait();
  }

  return config;
};

export const deploySharedEarn = async (hre: HardhatRuntimeEnvironment, config: NetworkConfig) => {
  const [deployer] = await hre.ethers.getSigners();

  console.log("earn", config.contractsConfig);
  if (!config.contractsConfig.earn) throw new Error("Invalid network config");

  if (!config.contractsConfig.earn.priceAggregator) {
    const aggregator = await hre.upgrades.deployProxy(
      new PriceAggregator__factory(deployer),
      [config.contractsConfig.ac],
      { unsafeAllow: ["constructor"] }
    );
    await aggregator.deployed();
    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      priceAggregator: aggregator.address,
    };
    await saveDeploymentConfig(hre, config);

    // TODO: save
  } else {
    console.log("Earn: price aggregator is already deployed, skip..");
  }
  const stable = config.contractsConfig.earn.stable;

  const decimals = await ERC20__factory.connect(stable, deployer).decimals();

  const parsedAmount = hre.ethers.utils.parseUnits(
    config.contractsConfig.earn.reservedForAutomation.toString(),
    decimals
  );

  const network: Network = hre.forkingNetwork?.chainId ?? hre.network.config.chainId ?? 1;

  const getAddress = hre.ethers.utils.getAddress;

  if (!config.contractsConfig.earn.gelatoSwapper) {
    const swapPath = Object.values(swapPathes[network]).find(
      v =>
        getAddress(v.tokenFrom) === getAddress(stable) &&
        getAddress(v.tokenTo) === getAddress(config.contractsConfig.wNative)
    ) as SwapPath | undefined;

    if (!swapPath) throw new Error("Swap path stable=>native is not set");

    console.log({ swapPath });

    const factory =
      swapPath.type === "v2" ? new GelatoSwapperUniV2__factory(deployer) : new GelatoSwapper__factory(deployer);

    const router = swapPath.type === "v2" ? config.environment.unirouter : config.environment.unirouterV3;

    const gs = (await hre.upgrades.deployProxy(factory, [router, swapPath.path], {
      unsafeAllow: ["constructor"],
    })) as GelatoSwapper;
    await gs.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      gelatoSwapper: gs.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: gelato swapper is already deployed, skip..");
  }

  if (!config.contractsConfig.earn.earnConfiguration) {
    const ec = (await hre.upgrades.deployProxy(
      new EarnConfiguration__factory(deployer),
      [
        config.contractsConfig.ac,
        config.contractsConfig.earn.stable,
        config.contractsConfig.earn.priceAggregator,
        parsedAmount,
        config.contractsConfig.treasury,
        config.contractsConfig.earn.gelatoSwapper,
      ],
      { unsafeAllow: ["constructor"] }
    )) as EarnConfiguration;
    await ec.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      earnConfiguration: ec.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: swap aggregator is already deployed, skip..");
  }

  if (!config.contractsConfig.earn.gelatoChecker) {
    const checker = await hre.upgrades.deployProxy(new EarnPoolChecker__factory(deployer), undefined, {
      unsafeAllow: ["constructor"],
    });

    await checker.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      gelatoChecker: checker.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: gelato checker is already deployed, skip..");
  }

  if (!config.contractsConfig.earn.earnBeacon) {
    const earnBeacon = await hre.upgrades.deployBeacon(new EarnPool__factory(deployer), {
      unsafeAllow: ["constructor"],
    });

    await earnBeacon.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      earnBeacon: earnBeacon.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: earnBeacon is already deployed, skip..");
  }

  if (!config.contractsConfig.earn.earnFactory) {
    const earnFactory = await hre.upgrades.deployProxy(
      new EarnFactory__factory(deployer),
      [config.contractsConfig.earn.earnBeacon!],
      {
        unsafeAllow: ["constructor"],
      }
    );
    await earnFactory.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      earnFactory: earnFactory.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: earnFactory is already deployed, skip..");
  }

  if (!config.contractsConfig.earn.earnHelper) {
    const earnHelper = await new EarnHelper__factory(deployer).deploy();
    await earnHelper.deployed();

    config.contractsConfig.earn = {
      ...(config.contractsConfig.earn ?? {}),
      earnHelper: earnHelper.address,
    };
    await saveDeploymentConfig(hre, config);
    // TODO: save
  } else {
    console.log("Earn: earnHelper is already deployed, skip..");
  }

  return config;
};

export const deployEarn = async (
  hre: HardhatRuntimeEnvironment,
  config: NetworkConfig,
  {
    id,
    description,
    vaultsConfig,
    stopLosses = [10, 15, 30],
    risks,
    name,
  }: {
    stopLosses?: number[];
    id: string;
    name: string;
    risks?: string[];
    description?: string,
    vaultsConfig: {
      vaultId: string;
      part: number;
    }[];
  }
) => {
  const [deployer] = await hre.ethers.getSigners();
  if (!config.contractsConfig.earn) throw new Error("Invalid network config");

  if (!config.contractsConfig.earn.pools) {
    config.contractsConfig.earn.pools = {};
  }

  const deployedPools = config.contractsConfig.earn.pools;
  const lpHelpers = config.contractsConfig.earn.lpHelpers;

  const stable = config.contractsConfig.earn.stable;

  const vaults = await readJsonVaultMetadata(hre);

  const parsedVaultConfigs = vaultsConfig.map(v => {
    const poolPart = hre.ethers.utils.parseUnits(v.part.toString());
    const vault = vaults.find(vF => vF.id === v.vaultId);

    if (!vault) throw new Error("Unknown vault id");
    if (!vault.earnLpHelperType) throw new Error("Unknown helper type");
    if (!lpHelpers) throw new Error("Unknown lp helpers");
    if (!lpHelpers[vault.earnLpHelperType]) throw new Error("Unknown lp helper");

    return {
      poolPart,
      vault: vault.earnContractAddress,
      lpHelper: lpHelpers[vault.earnLpHelperType]?.address,
    };
  });

  const decimals = await ERC20__factory.connect(stable, deployer).decimals();
  const symbol = await ERC20__factory.connect(stable, deployer).symbol();

  if (!deployedPools[id]?.earn) {
    deployedPools[id] ??= {};

    const earnFactory = EarnFactory__factory.connect(config.contractsConfig.earn.earnFactory ?? "", deployer);
    const deployParams = [
      {
        _ac: config.contractsConfig.ac ?? "",
        _earnConfiguration: config.contractsConfig.earn.earnConfiguration ?? "",
        _oneInchRouter: config.contractsConfig.zaps.oneInch.router ?? "",
        _wETH: config.contractsConfig.wNative,
        _automate: config.environment.gelatoAutomate,
        _resolver: config.contractsConfig.earn.gelatoChecker ?? "",
        _fees: { depositFee: 0, withdrawalFee: 0 },
      },
      parsedVaultConfigs,
    ] as const;

    const earnAddress = await earnFactory.callStatic.deploy(...deployParams);
    (await earnFactory.deploy(...deployParams)).wait();

    deployedPools[id].earn = earnAddress;
    deployedPools[id].vaults = vaultsConfig.map((c, i) => ({
      ...c,
      lpHelper: parsedVaultConfigs[i].lpHelper ?? "",
    }));

    await saveDeploymentConfig(hre, config);

    await saveEarnMetadata(hre, {
      id,
      description,
      stableAddress: config.contractsConfig.earn.stable,
      stableDecimals: decimals,
      stable: symbol,
      name,
      stopLosses,
      earnHelper: config.contractsConfig.earn.earnHelper ?? "",
      earn: earnAddress,
      vaults: deployedPools[id].vaults ?? [],
      earnConfiguration: config.contractsConfig.earn.earnConfiguration ?? "",
      priceAggregator: config.contractsConfig.earn.priceAggregator ?? "",
      reservedForAutomation: config.contractsConfig.earn.reservedForAutomation,
      status: "active",
      risks: risks ?? [],
      gelatoChecker: config.contractsConfig.earn.gelatoChecker ?? "",
      createdAt: Math.floor(new Date().getTime() / 1000),
      network: hre.forkingNetwork?.name ?? hre.network.name,
    });

    console.log("Deployed earn pool");
  } else {
    console.log("Earn pool is already deployed");
  }
  await saveDeploymentConfig(hre, config);

  return config;
};
