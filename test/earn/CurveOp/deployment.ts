import { ethers } from "hardhat";
import {
  CurveOpLpHelper__factory,
  ERC20__factory,
  EarnConfigurationTester__factory,
  StrategyCurveLPUniV3Router,
  StrategyCurveLPUniV3Router__factory,
} from "../../../typechain-types";
import { optimismContracts } from "../../constants";
import { infraDeployment, vaults } from "../common/Infra.deployment";
import { getVaultAndStrategyFromConfig } from "../common/vaults.helpers";

export const curveOpLpHelperDeployment = async () => {
  const { aggregator, deployer, uniswapV3, mockUniswap, ac, vaultConfigs, priceFeeds } = await infraDeployment({
    vaultConfigs: [
      {
        part: 100,
        vault: vaults.CurveOp_wstETH_ETH,
      },
    ],
    usdtAddress: optimismContracts.tokens.USDC.token,
    wethAddress: optimismContracts.tokens.WETH.token,
    gelatoAddress: optimismContracts.gelato,
  });

  const { vault, strategy: strategyCurveLPUniV3Router } = await getVaultAndStrategyFromConfig<
    StrategyCurveLPUniV3Router,
    // @ts-ignore
    // eslint-disable-next-line camelcase
    StrategyCurveLPUniV3Router__factory
  >(vaultConfigs, deployer, "CurveOp_wstETH_ETH", StrategyCurveLPUniV3Router__factory);

  const earnConfig = await new EarnConfigurationTester__factory(deployer).deploy();
  await strategyCurveLPUniV3Router.setDepositNative(true);
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(optimismContracts.tokens.USDC.token, deployer);
  await earnConfig.initialize(ac.address, usdc.address, aggregator.address, 0, ethers.constants.AddressZero);
  const lpHelper = await new CurveOpLpHelper__factory(deployer).deploy(
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
    strategyCurveLPUniV3Router,
    ac,
    priceFeeds,
    vault,
    uniswapV3,
    usdc,
    mockUniswap,
  };
};
