// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  CurveLpHelper__factory,
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyConvex,
  // eslint-disable-next-line camelcase
  StrategyConvex__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";

export const curveLpHelperDeployment = async () => {
  const { aggregator, deployer, uniswapV3, mockUniswap, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.CurveConvexMIM_DAI_USDC_USDT,
        },
      ],
    });

  const { vault, strategy: strategyConvex } = await getVaultAndStrategyFromConfig<
    StrategyConvex,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyConvex__factory
  >(vaultConfigs, deployer, "CurveConvexMIM_DAI_USDC_USDT", StrategyConvex__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new CurveLpHelper__factory(deployer).deploy(
    poolConfig.address,
    earnCommonAddresses.UNI_V3_ROUTER,
    sa.address
  );
  await lpHelper.deployed();

  return {
    deployer,
    aggregator,
    poolConfig,
    lpHelper,
    strategyConvex,
    ac,
    priceFeeds,
    sa,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};

export const curveLpHelperNotZapDeployment = async () => {
  const { aggregator, deployer, mockUniswap, uniswapV3, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.CurveConvexLDO_ETH,
        },
      ],
    });

  const { vault, strategy: strategyConvex } = await getVaultAndStrategyFromConfig<
    StrategyConvex,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyConvex__factory
  >(vaultConfigs, deployer, "CurveConvexLDO_ETH", StrategyConvex__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new CurveLpHelper__factory(deployer).deploy(
    poolConfig.address,
    earnCommonAddresses.UNI_V3_ROUTER,
    sa.address
  );
  await lpHelper.deployed();

  return {
    deployer,
    aggregator,
    poolConfig,
    lpHelper,
    strategyConvex,
    ac,
    priceFeeds,
    sa,
    vault,
    usdt,
    mockUniswap,
    uniswapV3,
  };
};
