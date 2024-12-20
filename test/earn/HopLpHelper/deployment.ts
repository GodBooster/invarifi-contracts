// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";
import {
  // eslint-disable-next-line camelcase
  EarnConfigurationTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  HopLpHelper__factory,
  // eslint-disable-next-line camelcase
  RetroGammaLpHelper__factory,
  StrategyHopCamelot,
  StrategyHopCamelot__factory,
  StrategyRetroGamma,
  // eslint-disable-next-line camelcase
  StrategyRetroGamma__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { ethers } from "hardhat";
import { arbitrumContracts } from "../../constants";

export const hopLpHelper = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.ArbHopCamelotETH_LP,
      },
    ],
    usdtAddress: arbitrumContracts.tokens.USDC.token,
  });

  const { vault, strategy: strategyRetroGamma } = await getVaultAndStrategyFromConfig<
    StrategyHopCamelot,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyHopCamelot__factory
  >(vaultConfigs, deployer, "ArbHopCamelotETH_LP", StrategyHopCamelot__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  const usdt = ERC20__factory.connect(arbitrumContracts.tokens.USDC.token, deployer);
  await earnConfig.initialize(ac.address, usdt.address, aggregator.address, 0, ethers.constants.AddressZero);

  const lpHelper = await new HopLpHelper__factory(deployer).deploy(
    earnConfig.address,
    arbitrumContracts.uniswapV3Router,
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
