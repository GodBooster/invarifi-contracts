// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyCommonChefLP,
  // eslint-disable-next-line camelcase
  StrategyCommonChefLP__factory,
  // eslint-disable-next-line camelcase
  UniswapLpHelper__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";

export const uniswapLpHelperDeployment = async () => {
  const { aggregator, deployer, mockUniswap, uniswapV3, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.SushiLDP_ETH,
        },
      ],
    });

  const { vault, strategy: strategySushi } = await getVaultAndStrategyFromConfig<
    StrategyCommonChefLP,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyCommonChefLP__factory
  >(vaultConfigs, deployer, "SushiLDP_ETH", StrategyCommonChefLP__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new UniswapLpHelper__factory(deployer).deploy(
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
    strategySushi,
    ac,
    priceFeeds,
    sa,
    vault,
    usdt,
    mockUniswap,
    uniswapV3,
  };
};
