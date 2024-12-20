import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import {
  transferImpersonatedTokensArbitrum,
  transferImpersonatedTokensOptimism,
  // eslint-disable-next-line node/no-missing-import
} from "../common/Infra.deployment";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../common/utils";
// eslint-disable-next-line node/no-missing-import
import { stargateLpHelper } from "./deployment";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { NetworkName } from "../../../hardhat.config";
import { arbitrumSwapPathes, optimismContracts, optimismSwapPathes } from "../../constants";

runNetworkDescribe("stargateLpHelper tests", NetworkName.OPTIMISM, false, () => {
  it("deployment", async () => {
    const { usdt, lpHelper } = await loadFixture(stargateLpHelper);

    expect(usdt.address).eq(optimismContracts.tokens.USDC.token);
    expect(await lpHelper.uniswapV3Router()).eq(optimismContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const params = await loadFixture(stargateLpHelper);
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdt: usdc, earnConfig } = params;
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

    const amount = ethers.utils.parseUnits("100", await usdc.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(optimismContracts.tokens.WETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdc, weth, amount);
  }).timeout(100_000);

  it("withdraw test", async () => {
    const params = await loadFixture(stargateLpHelper);
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdt, earnConfig } = params;
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
      optimismSwapPathes.WETH_TO_USDC.tokenFrom,
      optimismSwapPathes.WETH_TO_USDC.tokenTo,
      optimismSwapPathes.WETH_TO_USDC.path
    );

    const amountToDeposit = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(optimismContracts.tokens.WETH.token, deployer);
    // eslint-disable-next-line camelcase
    const usdc = ERC20__factory.connect(optimismContracts.tokens.USDC.token, deployer);

    await deposit(lpHelper, vault, deployer, usdc, weth, amountToDeposit);

    await withdraw(lpHelper, vault, deployer, usdc, weth);
  });
});
