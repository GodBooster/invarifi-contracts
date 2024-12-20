// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, infraDeployment, vaults } from "../common/Infra.deployment";
import {
  // eslint-disable-next-line camelcase
  // eslint-disable-next-line camelcase
  CurveConvexLpHelper__factory,
  // eslint-disable-next-line camelcase
  PoolConfigurationTester__factory,
  StrategyCurveConvex,
  // eslint-disable-next-line camelcase
  StrategyCurveConvex__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";

export const curveConvexLpHelperDeployment = async () => {
  const { aggregator, deployer, mockUniswap, uniswapV3, usdt, ac, vaultConfigs, sa, priceFeeds } =
    await infraDeployment({
      vaultConfigs: [
        {
          part: 100,
          vault: vaults.CurveConvexTriCryptoUSDC,
        },
      ],
    });

  const { vault, strategy: strategyCurveConvex } = await getVaultAndStrategyFromConfig<
    StrategyCurveConvex,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyCurveConvex__factory
  >(vaultConfigs, deployer, "CurveConvexTriCryptoUSDC", StrategyCurveConvex__factory);

  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
    {
      vault: vault.address,
      poolPart: ethers.utils.parseUnits("100"),
    },
  ]);

  const lpHelper = await new CurveConvexLpHelper__factory(deployer).deploy(
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
    strategyCurveConvex,
    ac,
    sa,
    priceFeeds,
    vault,
    usdt,
    mockUniswap,
    uniswapV3,
  };
};
