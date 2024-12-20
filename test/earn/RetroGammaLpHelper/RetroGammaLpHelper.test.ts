import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import {
  earnCommonAddresses,
  swapPathes,
  transferImpersonatedTokensPolygon,
  // eslint-disable-next-line node/no-missing-import
} from "../common/Infra.deployment";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../common/utils";
// eslint-disable-next-line node/no-missing-import
import { retroGammaLpHelper } from "./deployment";

describe("RetroGammaLpHelper tests", () => {
  it("deployment", async () => {
    const { usdt, lpHelper } = await loadFixture(retroGammaLpHelper);

    expect(usdt.address).eq(earnCommonAddresses.tokens.polygon.USDT);
    expect(await lpHelper.uniswapV3Router()).eq(earnCommonAddresses.UNI_V3_ROUTER);
  });

  it("deposit test", async () => {
    const params = await loadFixture(retroGammaLpHelper);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;
    await transferImpersonatedTokensPolygon({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      swapPathes.USDT_TO_WMATIC.tokenFrom,
      swapPathes.USDT_TO_WMATIC.tokenTo,
      swapPathes.USDT_TO_WMATIC.path
    );

    const amount = ethers.utils.parseUnits("100", "6");

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(earnCommonAddresses.tokens.polygon.WMATIC, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount);
  }).timeout(100_000);

  it("withdraw test", async () => {
    const params = await loadFixture(retroGammaLpHelper);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;
    await transferImpersonatedTokensPolygon({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      swapPathes.USDT_TO_WMATIC.tokenFrom,
      swapPathes.USDT_TO_WMATIC.tokenTo,
      swapPathes.USDT_TO_WMATIC.path
    );

    await earnConfig.setSwapPath(
      swapPathes.USDC_TO_USDT_POLYGON.tokenFrom,
      swapPathes.USDC_TO_USDT_POLYGON.tokenTo,
      swapPathes.USDC_TO_USDT_POLYGON.path
    );

    await earnConfig.setSwapPath(
      swapPathes.WMATIC_TO_USDT.tokenFrom,
      swapPathes.WMATIC_TO_USDT.tokenTo,
      swapPathes.WMATIC_TO_USDT.path
    );

    const amount = ethers.utils.parseUnits("100", "6");

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(earnCommonAddresses.tokens.polygon.WMATIC, deployer);
    // eslint-disable-next-line camelcase
    const usdc = ERC20__factory.connect(earnCommonAddresses.tokens.polygon.USDC, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount);

    await withdraw(lpHelper, vault, deployer, usdt, usdc);
  });
});
