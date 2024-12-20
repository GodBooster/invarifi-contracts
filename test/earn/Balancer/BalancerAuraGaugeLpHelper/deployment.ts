// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  BalancerAuraGaugeLpHelper__factory,
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyAuraBalancerMultiRewardGaugeUniV3,
  // eslint-disable-next-line camelcase
  StrategyAuraBalancerMultiRewardGaugeUniV3__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../../common/vaults.helpers";

export const balancerAuraGaugeLpHelperDeployment = async () => {
  const { aggregator, uniswapV3, mockUniswap, deployer, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.AuraERTH_RETH,
        },
      ],
    });

  const { vault, strategy: strategyAuraGaugeMainnet } = await getVaultAndStrategyFromConfig<
    StrategyAuraBalancerMultiRewardGaugeUniV3,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyAuraBalancerMultiRewardGaugeUniV3__factory
  >(vaultConfigs, deployer, "AuraERTH_RETH", StrategyAuraBalancerMultiRewardGaugeUniV3__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new BalancerAuraGaugeLpHelper__factory(deployer).deploy(
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
    strategyAuraGaugeMainnet,
    ac,
    sa,
    priceFeeds,
    vault,
    usdt,
    uniswapV3,
    mockUniswap,
  };
};
