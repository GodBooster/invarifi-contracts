// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  BalancerAuraGyroLpHelper__factory,
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyAuraGyroMainnet,
  // eslint-disable-next-line camelcase
  StrategyAuraGyroMainnet__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../../common/vaults.helpers";

export const balancerAuraGyroLpHelperDeployment = async () => {
  const { aggregator, deployer, uniswapV3, mockUniswap, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.AuraWSTETH_ETH,
        },
      ],
    });

  const { vault, strategy: strategyAuraGyroMainnet } = await getVaultAndStrategyFromConfig<
    StrategyAuraGyroMainnet,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyAuraGyroMainnet__factory
  >(vaultConfigs, deployer, "AuraWSTETH_ETH", StrategyAuraGyroMainnet__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new BalancerAuraGyroLpHelper__factory(deployer).deploy(
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
    strategyAuraGyroMainnet,
    ac,
    priceFeeds,
    sa,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};
