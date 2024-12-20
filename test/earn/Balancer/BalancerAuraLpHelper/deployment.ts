// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  BalancerAuraLpHelper__factory,
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyAuraMainnet,
  // eslint-disable-next-line camelcase
  StrategyAuraMainnet__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../../common/vaults.helpers";

export const balancerAuraLpHelperDeployment = async () => {
  const { aggregator, deployer, uniswapV3, mockUniswap, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.AuraWSTETH_RETH_SFRXETH,
        },
      ],
    });

  const { vault, strategy: strategyAuraMainnet } = await getVaultAndStrategyFromConfig<
    StrategyAuraMainnet,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyAuraMainnet__factory
  >(vaultConfigs, deployer, "AuraWSTETH_RETH_SFRXETH", StrategyAuraMainnet__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new BalancerAuraLpHelper__factory(deployer).deploy(
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
    strategyAuraMainnet,
    ac,
    priceFeeds,
    sa,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};
