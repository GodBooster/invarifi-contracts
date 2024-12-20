// eslint-disable-next-line node/no-missing-import
import { infraDeployment, vaults } from "../../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../../common/vaults.helpers";
import {
  // @ts-ignore
  // eslint-disable-next-line camelcase
  BalancerAuraLpHelperArb__factory,
  BalancerUniBaseLpHelper__factory,
  BalancerUniV2LpHelper__factory,
  // eslint-disable-next-line camelcase
  EarnConfigurationTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  StrategyAuraSideChain,
  // eslint-disable-next-line camelcase
  StrategyAuraSideChain__factory,
  StrategyBalancerMultiReward,
  StrategyBalancerMultiReward__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { arbitrumContracts, baseContracts } from "../../../constants";

export const balancerAuraLpHelperArbDeployment = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.Aura_wstETH_WETH,
      },
    ],
    usdtAddress: arbitrumContracts.tokens.USDC.token,
  });

  const { vault, strategy: strategyRetroGamma } = await getVaultAndStrategyFromConfig<
    StrategyAuraSideChain,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyAuraSideChain__factory
  >(vaultConfigs, deployer, "Aura_wstETH_WETH", StrategyAuraSideChain__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  // eslint-disable-next-line camelcase
  const usdt = ERC20__factory.connect(arbitrumContracts.tokens.USDC.token, deployer);
  await earnConfig.initialize(ac.address, usdt.address, aggregator.address, 0, ethers.constants.AddressZero);

  const lpHelper = await new BalancerAuraLpHelperArb__factory(deployer).deploy(
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
