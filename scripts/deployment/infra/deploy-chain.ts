import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  AccessControlMain,
  AccessControlMain__factory,
  BalancerAuraZapOneInchArb__factory,
  BalancerAuraZapOneInchETH__factory,
  BoostFactory__factory,
  Boost__factory,
  CommonZapOneInch__factory,
  CurveConvexZapOneInchETH__factory,
  CurveZapOneInchOp__factory,
  DystopiaStaker__factory,
  FeeConfigurator__factory,
  HopZapOneInch__factory,
  MulticallManager__factory,
  Multicall__factory,
  RetroGammaZapOneInchPoly__factory,
  Treasury__factory,
  VaultFactory__factory,
  VaultV7__factory,
  VeCakeStaker__factory,
  VelodromeZapOneInchOp__factory,
  BaseSwapZapOneInchBase__factory,
} from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { NetworkConfig, ZapCategory } from "../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { saveDeploymentConfig } from "../configs/save-config";
// eslint-disable-next-line node/no-missing-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, utils } from "ethers";
import { deploySharedEarn } from "../types/earn-deployer";

export type DeployChainConfig = NetworkConfig;

const getFactoryForZapCategory = <T>(category: ZapCategory, deployer: SignerWithAddress) => {
  switch (category) {
    case ZapCategory.COMMON:
      return new CommonZapOneInch__factory(deployer);
    case ZapCategory.BALANCER_AURA_ETH:
      return new BalancerAuraZapOneInchETH__factory(deployer);
    case ZapCategory.CURVE_CONVEX_ETH:
      return new CurveConvexZapOneInchETH__factory(deployer);
    case ZapCategory.RETRO_GAMMA:
      return new RetroGammaZapOneInchPoly__factory(deployer);
    case ZapCategory.HOP:
      return new HopZapOneInch__factory(deployer);
    case ZapCategory.BALANCER_AURA_ARBITRUM:
      return new BalancerAuraZapOneInchArb__factory(deployer);
    case ZapCategory.VELODROME:
      return new VelodromeZapOneInchOp__factory(deployer);
    case ZapCategory.CURVE_OP:
      return new CurveZapOneInchOp__factory(deployer);
    case ZapCategory.BASESWAP:
      return new BaseSwapZapOneInchBase__factory(deployer);
    default:
      throw new Error("Unknown ZapCategory");
  }
};

const deployZap = async (
  hre: HardhatRuntimeEnvironment,
  category: ZapCategory,
  deployer: SignerWithAddress,
  { contractsConfig: config, environment }: DeployChainConfig
) => {
  if (!config.zaps.oneInch.router) throw new Error("1inch router is not set in config");

  const factory = getFactoryForZapCategory(category, deployer);
  const zap = await factory.deploy(config.zaps.oneInch.router, config.wNative);
  await zap.deployed();

  console.log(`1inch zap deployed to ${zap.address}`);

  config.zaps.oneInch.zaps = [
    ...(config.zaps.oneInch.zaps ?? []),
    {
      address: zap.address,
      category,
    },
  ];

  await saveDeploymentConfig(hre, { contractsConfig: config, environment });
};

const deployStratShared = async (
  hre: HardhatRuntimeEnvironment,
  deployer: SignerWithAddress,
  { contractsConfig: config, environment }: DeployChainConfig
) => {
  if (!config.strategiesShared) {
    return;
  }

  if (config.strategiesShared.dystopiaStaker) {
    if (!config.strategiesShared?.dystopiaStaker?.staker) {
      const staker = await new DystopiaStaker__factory(deployer).deploy(
        config.ac ?? "",
        config.strategiesShared?.dystopiaStaker?.distVoter ?? "",
        config.strategiesShared?.dystopiaStaker?.veDist ?? "",
        config.treasury ?? ""
      );

      config.strategiesShared.dystopiaStaker.staker = staker.address;
      console.log(`DystopiaStaker is deployed at ${staker.address}`);
      await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    } else {
      console.log("DystopiaStaker is already deployed");
    }
  } else {
    console.log("DystopiaStaker is not properly configured, skip..");
  }

  if (config.strategiesShared.bscVeCakeStaker) {
    if (!config.strategiesShared.bscVeCakeStaker?.staker) {
      const stakerConfig = config.strategiesShared.bscVeCakeStaker;

      const staker = await new VeCakeStaker__factory(deployer).deploy(
        config.ac ?? "",
        stakerConfig.want,
        stakerConfig.veCake,
        stakerConfig.reserveRate,
        stakerConfig.cakeBatch,
        stakerConfig.beCakeShare,
        stakerConfig.name,
        stakerConfig.symbol
      );

      await staker.deployed();
      config.strategiesShared.bscVeCakeStaker.staker = staker.address;
      console.log(`VeCakeStaker is deployed at ${staker.address}`);
      await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    } else {
      console.log("VeCakeStaker is already deployed");
    }
  } else {
    console.log("VeCakeStaker is not properly configured, skip..");
  }
};

export const deployChain = async (
  hre: HardhatRuntimeEnvironment,
  { contractsConfig: config, environment }: DeployChainConfig
) => {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Checking if should deploy AccessControl...");

  let ac: AccessControlMain;

  if (!config.ac) {
    console.log("Deploying AccessControl.");
    const factory = new AccessControlMain__factory(deployer);

    ac = (await hre.upgrades.deployProxy(factory)) as AccessControlMain;

    await ac.deployed();
    config.ac = ac.address;
    console.log(`AccessControl is deployed at ${config.ac}`);
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
  } else {
    console.log(`AccessControl already deployed at ${config.ac}. Skipping...`);
    // eslint-disable-next-line camelcase
    ac = AccessControlMain__factory.connect(config.ac, deployer);
  }

  console.log("Checking if keeper has keeper role...");

  if (await ac.hasRole(await ac.KEEPER_ROLE(), config.keeper)) {
    console.log("Skipping...");
  } else {
    (await ac.connect(deployer).grantRole(await ac.KEEPER_ROLE(), config.keeper)).wait();
    console.log("Role granted.");
  }

  console.log("Checking if strategist is strategist..");

  if ((await ac.strategist()) === config.strategyOwner) {
    console.log("Skipping...");
  } else {
    await ac.connect(deployer).setStrategist(config.strategyOwner);
    console.log("Deployer is strategist");
  }

  // console.log("Checking if should deploy GasPrice...");

  // if (!config.gasprice) {
  //   console.log("Deploying GasPrice.");

  //   const gasprice = await new GasPrice__factory(deployer).deploy();

  //   await gasprice.deployed();
  //   config.gasprice = gasprice.address;
  //   await saveDeploymentConfig(hre, { contractsConfig: config, environment });
  // } else {
  //   console.log(`Gasprice already deployed at ${config.gasprice}. Skipping...`);
  // }

  console.log("Checking if should deploy treasury...");

  if (!config.treasury) {
    console.log("Deploying treasury.");
    const treasury = await hre.upgrades.deployProxy(new Treasury__factory(deployer), [ac.address]);
    await treasury.deployed();

    config.treasury = treasury.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });

    console.log(`Treasury deployed to ${treasury.address}`);
  } else {
    console.log(`Treasury already deployed at ${config.treasury}. Skipping...`);
  }

  // console.log("Checking if it should deploy a harvesting contract...");
  // if (!config.multiStratHarvester) {
  //   console.log("Deploying harvester");
  //   const weth = config.wNative;

  //   if (!weth) {
  //     throw new Error(`No weth address was found for network`);
  //   }

  //   const harvester = await new MultiStratHarvester__factory(deployer).deploy(config.treasury, weth);
  //   await harvester.deployed();
  //   config.multiStratHarvester = harvester.address;
  //   await saveDeploymentConfig(hre, { contractsConfig: config, environment });
  //   console.log(`Harvester is deployed to ${harvester.address}`);
  // } else {
  //   console.log(`There is already a harvester contract deployed at ${config.multiStratHarvester}. Skipping.`);
  // }

  console.log("Checking if it should deploy a multicall contract...");
  if (!config.multicall) {
    console.log("Deploying multicall");
    const multicall = await new Multicall__factory(deployer).deploy();
    await multicall.deployed();
    config.multicall = multicall.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Multicall deployed to ${multicall.address}`);
  } else {
    console.log(`There is already a multicall contract deployed at ${config.multicall}. Skipping.`);
  }

  console.log("Checking if it should deploy a multicall contract...");
  if (!config.multicallManager) {
    console.log("Deploying multicall manager");
    const multicallManager = await new MulticallManager__factory(deployer).deploy(ac.address);
    await multicallManager.deployed();
    config.multicallManager = multicallManager.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Multicall manager deployed to ${multicallManager.address}`);
  } else {
    console.log(`There is already a multicall manager contract deployed at ${config.multicallManager}. Skipping.`);
  }

  const KEEPER_ROLE = utils.id("KEEPER_ROLE");

  const multicallManager = MulticallManager__factory.connect(config.multicallManager, deployer);
  if (!(await ac.hasRole(KEEPER_ROLE, multicallManager.address))) {
    await (await ac.grantRole(KEEPER_ROLE, multicallManager.address)).wait();
  }

  if (!config.vaultBeacon) {
    console.log("Deploying VaultBecaon");
    const beacon = await hre.upgrades.deployBeacon(new VaultV7__factory(deployer));

    await beacon.deployed();
    config.vaultBeacon = beacon.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Beacon deployed to ${beacon.address}`);
  } else {
    console.log(`There is already a beacon contract deployed at ${config.vaultBeacon}. Skipping.`);
  }

  if (!config.vaultFactory) {
    console.log("Deploying VaultFactory");
    const factory = await hre.upgrades.deployProxy(new VaultFactory__factory(deployer), [config.vaultBeacon], {
      unsafeAllow: ["constructor"],
    });

    await factory.deployed();
    config.vaultFactory = factory.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Factory deployed to ${factory.address}`);
  } else {
    console.log(`There is already a factory contract deployed at ${config.vaultFactory}. Skipping.`);
  }

  if (!config.boostImplementation) {
    console.log("Deploying BoostImplementation");
    const impl = await new Boost__factory(deployer).deploy();

    await impl.deployed();
    config.boostImplementation = impl.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Impl deployed to ${impl.address}`);
  } else {
    console.log(`There is already a boost impl contract deployed at ${config.boostImplementation}. Skipping.`);
  }

  if (!config.boostFactory) {
    console.log("Deploying BoostFactory");
    const factory = await new BoostFactory__factory(deployer).deploy(config.vaultFactory, config.boostImplementation);

    await factory.deployed();
    config.boostFactory = factory.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`Factory deployed to ${factory.address}`);
  } else {
    console.log(`There is already a factory contract deployed at ${config.vaultFactory}. Skipping.`);
  }

  const parseUnits = hre.ethers.utils.parseUnits;

  if (!config.feeConfig.feeConfigurator) {
    console.log("Deploying FeeConfigurator");
    const FeeConfigurator = new FeeConfigurator__factory(deployer);

    const feeConfigurator = await hre.upgrades.deployProxy(FeeConfigurator, [ac.address, parseUnits("1")]);

    await feeConfigurator.deployed();
    config.feeConfig.feeConfigurator = feeConfigurator.address;
    await saveDeploymentConfig(hre, { contractsConfig: config, environment });
    console.log(`FeeConfigurator deployed to ${feeConfigurator.address}`);
  } else {
    console.log(`There is already a config contract deployed at ${config.feeConfig.feeConfigurator}. Skipping.`);
  }

  if (config.zaps.oneInch.router) {
    for (const category of config.zaps.oneInch.categories) {
      if (config.zaps.oneInch.zaps?.find(v => v.category === category)) {
        console.log(`1inch ${category} zap is already deployed`);
        continue;
      }

      await deployZap(hre, category, deployer, { contractsConfig: config, environment });
    }
  } else {
    console.log(`Cant deploy 1inch zap because of missing config`);
  }

  // eslint-disable-next-line camelcase
  const configurator = FeeConfigurator__factory.connect(config.feeConfig.feeConfigurator, deployer);

  const defaultFeeConfig = config.feeConfig.default;

  const defaultConfig = await configurator.getFeeCategory(defaultFeeConfig.id, false);

  // FIXME: for some reason this check doesnt work if run the script 2+ times
  if (!defaultConfig.total.eq(BigNumber.from(0))) {
    console.log("No need to update config");
  } else {
    const tx = await configurator
      .connect(deployer)
      .setFeeCategory(
        defaultFeeConfig.id,
        parseUnits(defaultFeeConfig.total.toString()),
        parseUnits(defaultFeeConfig.call.toString()),
        parseUnits(defaultFeeConfig.strategist.toString()),
        defaultFeeConfig.label,
        defaultFeeConfig.active,
        defaultFeeConfig.adjust
      );

    await tx.wait();

    console.log("Successfully created default fee category");
  }

  await saveDeploymentConfig(hre, { contractsConfig: config, environment });

  await deployStratShared(hre, deployer, { contractsConfig: config, environment });
  return await deploySharedEarn(hre, { contractsConfig: config, environment });
};
