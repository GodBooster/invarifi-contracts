import { infraDeployment, vaults } from "../common/Infra.deployment";
import { optimismContracts } from "../../constants";
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";
import {
  EarnConfigurationTester__factory,
  ERC20__factory,
  StrategyCommonVelodromeGaugeV2,
  StrategyCommonVelodromeGaugeV2__factory,
  VelodromeOpLpHelper__factory,
} from "../../../typechain-types";
import { ethers } from "hardhat";

export const velodromeVeloUSDCeDeployment = async () => {
  const { aggregator, deployer, uniswapV3, mockUniswap, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.Velodrome_VELO_USDC,
      },
    ],
    usdtAddress: optimismContracts.tokens.USDC.token,
    wethAddress: optimismContracts.tokens.WETH.token,
    gelatoAddress: optimismContracts.gelato,
  });

  const { vault, strategy: strategyVelodrome } = await getVaultAndStrategyFromConfig<
    StrategyCommonVelodromeGaugeV2,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyCommonVelodromeGaugeV2__factory
  >(vaultConfigs, deployer, "Velodrome_VELO_USDC", StrategyCommonVelodromeGaugeV2__factory);

  console.log(await vault.strategy());
  console.log(await strategyVelodrome.lpToken0());
  console.log(await strategyVelodrome.lpToken1());

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(optimismContracts.tokens.USDC.token, deployer);
  await earnConfig.initialize(ac.address, usdc.address, aggregator.address, 0, ethers.constants.AddressZero);
  const lpHelper = await new VelodromeOpLpHelper__factory(deployer).deploy(
    earnConfig.address,
    optimismContracts.uniswapV3Router,
    ac.address
  );
  await lpHelper.deployed();

  return {
    deployer,
    aggregator,
    earnConfig,
    lpHelper,
    strategyVelodrome,
    ac,
    priceFeeds,
    vault,
    uniswapV3,
    usdc,
    mockUniswap,
  };
};
