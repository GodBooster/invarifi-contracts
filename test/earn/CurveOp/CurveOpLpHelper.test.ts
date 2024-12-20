import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { NetworkName } from "../../../hardhat.config";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { curveOpLpHelperDeployment } from "./deployment";
import { expect } from "chai";
import { optimismContracts, optimismSwapPathes } from "../../constants";
import { transferImpersonatedTokensOptimism } from "../common/Infra.deployment";
import { deposit, withdraw } from "../common/utils";
import { ethers } from "hardhat";
import { ERC20__factory } from "../../../typechain-types";

runNetworkDescribe("CurveOpLpHelper tests", NetworkName.OPTIMISM, false, () => {
  it("deployment", async () => {
    const { usdc, lpHelper } = await loadFixture(curveOpLpHelperDeployment);

    expect(usdc.address).eq(optimismContracts.tokens.USDC.token);
    expect(await lpHelper.uniswapV3Router()).eq(optimismContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdc, earnConfig } = await loadFixture(
      curveOpLpHelperDeployment
    );
    await transferImpersonatedTokensOptimism({
      deployer,
      uniswapV3,
      mockUniswap,
    });
    await earnConfig.setSwapPath(
      optimismSwapPathes.USDC_TO_WETH.tokenFrom,
      optimismSwapPathes.USDC_TO_WETH.tokenTo,
      optimismSwapPathes.USDC_TO_WETH.path
    );

    const amount = ethers.utils.parseUnits("1000", await usdc.decimals());
    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(optimismContracts.tokens.WETH.token, deployer);
    await deposit(lpHelper, vault, deployer, usdc, weth, amount);
  });

  it("withdraw test", async () => {
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdc, earnConfig } = await loadFixture(
      curveOpLpHelperDeployment
    );
    await transferImpersonatedTokensOptimism({
      deployer,
      uniswapV3,
      mockUniswap,
    });

    await earnConfig.setSwapPath(
      optimismSwapPathes.USDC_TO_WETH.tokenFrom,
      optimismSwapPathes.USDC_TO_WETH.tokenTo,
      optimismSwapPathes.USDC_TO_WETH.path
    );
    await earnConfig.setSwapPath(
      optimismSwapPathes.wstETH_TO_USDC.tokenFrom,
      optimismSwapPathes.wstETH_TO_USDC.tokenTo,
      optimismSwapPathes.wstETH_TO_USDC.path
    );

    const amountToDeposit = ethers.utils.parseUnits("1000", await usdc.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(optimismContracts.tokens.WETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdc, weth, amountToDeposit);

    // eslint-disable-next-line camelcase
    const wstEth = ERC20__factory.connect(optimismContracts.tokens.wstETH.token, deployer);

    await withdraw(lpHelper, vault, deployer, usdc, wstEth);
  });
});
