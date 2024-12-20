// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";
import {
  // eslint-disable-next-line camelcase
  EarnConfigurationTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  // eslint-disable-next-line camelcase
  RetroGammaLpHelper__factory,
  StrategyRetroGamma,
  // eslint-disable-next-line camelcase
  StrategyRetroGamma__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { ethers } from "hardhat";

export const retroGammaLpHelper = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.RetroGammaUSDC_MATIC,
      },
    ],
    usdtAddress: earnCommonAddresses.tokens.polygon.USDT,
  });

  const { vault, strategy: strategyRetroGamma } = await getVaultAndStrategyFromConfig<
    StrategyRetroGamma,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyRetroGamma__factory
  >(vaultConfigs, deployer, "RetroGammaUSDC_MATIC", StrategyRetroGamma__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  const usdt = ERC20__factory.connect(earnCommonAddresses.tokens.polygon.USDT, deployer);
  await earnConfig.initialize(ac.address, usdt.address, aggregator.address, 0, ethers.constants.AddressZero);

  const lpHelper = await new RetroGammaLpHelper__factory(deployer).deploy(
    earnConfig.address,
    earnCommonAddresses.UNI_V3_ROUTER,
    ac.address
  );
  await lpHelper.deployed();

  return {
    deployer,
    aggregator,
    earnConfig,
    lpHelper,
    strategyRetroGamma,
    ac,
    priceFeeds,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};
