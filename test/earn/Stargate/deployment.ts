// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";
import {
  // eslint-disable-next-line camelcase
  EarnConfigurationTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  StargateLpHelper__factory,
  StrategyStargateOpNative,
  StrategyStargateOpNative__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { ethers } from "hardhat";
import { optimismContracts } from "../../constants";

export const stargateLpHelper = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.OpStargateEth_LP,
      },
    ],
    usdtAddress: optimismContracts.tokens.USDC.token,
    wethAddress: optimismContracts.tokens.WETH.token,
    gelatoAddress: optimismContracts.gelato,
  });

  const { vault, strategy: strategyStargateOpNative } = await getVaultAndStrategyFromConfig<
    StrategyStargateOpNative,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyStargateOpNative__factory
  >(vaultConfigs, deployer, "OpStargateEth_LP", StrategyStargateOpNative__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();

  // eslint-disable-next-line camelcase
  const usdt = ERC20__factory.connect(optimismContracts.tokens.USDC.token, deployer);
  await earnConfig.initialize(ac.address, usdt.address, aggregator.address, 0, ethers.constants.AddressZero);

  const lpHelper = await new StargateLpHelper__factory(deployer).deploy(
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
    strategyStargateOpNative,
    ac,
    priceFeeds,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};
