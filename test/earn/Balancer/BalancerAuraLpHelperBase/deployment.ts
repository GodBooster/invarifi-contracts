// eslint-disable-next-line node/no-missing-import
import { infraDeployment, vaults } from "../../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../../common/vaults.helpers";
import {
  BalancerAuraLpHelperArb__factory,
  BalancerAuraLpHelperBase__factory,
  // eslint-disable-next-line camelcase
  EarnConfigurationTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,

  // eslint-disable-next-line camelcase
  StrategyBalancerMultiReward,
  // eslint-disable-next-line camelcase
  StrategyBalancerMultiReward__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { baseContracts } from "../../../constants";

export const balancerAuraLpHelperBaseDeployment = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.Balancer_cbETH_ETH,
      },
    ],
    usdtAddress: baseContracts.tokens.USDCDefault.token,
    wethAddress: baseContracts.tokens.WETH.token,
    gelatoAddress: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
  });

  const { vault, strategy: strategyRetroGamma } = await getVaultAndStrategyFromConfig<
    StrategyBalancerMultiReward,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyBalancerMultiReward__factory
  >(vaultConfigs, deployer, "Balancer_cbETH_ETH", StrategyBalancerMultiReward__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  // eslint-disable-next-line camelcase
  const usdt = ERC20__factory.connect(baseContracts.tokens.USDCDefault.token, deployer);
  await earnConfig.initialize(ac.address, usdt.address, aggregator.address, 0, ethers.constants.AddressZero);

  const lpHelper = await new BalancerAuraLpHelperArb__factory(deployer).deploy(
    earnConfig.address,
    baseContracts.uniswapV3Router,
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
