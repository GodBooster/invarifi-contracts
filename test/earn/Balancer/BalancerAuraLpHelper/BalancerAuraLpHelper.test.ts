import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import { balancerAuraLpHelperDeployment } from "./deployment";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, swapPathes, transferImpersonatedTokens } from "../../common/Infra.deployment";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../../common/utils";
// eslint-disable-next-line node/no-missing-import,camelcase
import { ERC20__factory } from "../../../../typechain-types";

describe("BalancerAuraLpHelper tests", () => {
  it("deployment", async () => {
    const { usdt, aggregator, lpHelper, priceFeeds } = await loadFixture(balancerAuraLpHelperDeployment);

    expect(usdt.address).eq(earnCommonAddresses.tokens.USDT);
    expect(await aggregator.dataFeeds(usdt.address)).eq(priceFeeds.USDT_USD.address);
    expect(await lpHelper.uniswapV3Router()).eq(earnCommonAddresses.UNI_V3_ROUTER);
  });

  it("deposit test", async () => {
    const params = await loadFixture(balancerAuraLpHelperDeployment);
    const { lpHelper, vault, usdt, deployer, sa } = params;
    await transferImpersonatedTokens({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await sa.setSwapPath(
      swapPathes.USDT_TO_WETH.tokenFrom,
      swapPathes.USDT_TO_WETH.tokenTo,
      swapPathes.USDT_TO_WETH.path
    );
    const amount = ethers.utils.parseUnits("100", "6");

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(earnCommonAddresses.tokens.WETH, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount);
  }).timeout(100_000);

  it("withdraw test", async () => {
    const params = await loadFixture(balancerAuraLpHelperDeployment);
    const { lpHelper, vault, usdt, deployer, sa } = params;
    await transferImpersonatedTokens({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await sa.setSwapPath(
      swapPathes.USDT_TO_WETH.tokenFrom,
      swapPathes.USDT_TO_WETH.tokenTo,
      swapPathes.USDT_TO_WETH.path
    );
    await sa.setSwapPath(
      swapPathes.wstETH_TO_USDT.tokenFrom,
      swapPathes.wstETH_TO_USDT.tokenTo,
      swapPathes.wstETH_TO_USDT.path
    );
    const amount = ethers.utils.parseUnits("100", "6");

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(earnCommonAddresses.tokens.WETH, deployer);
    // eslint-disable-next-line camelcase
    const wstETH = ERC20__factory.connect(earnCommonAddresses.tokens.wstETH, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount);

    await withdraw(lpHelper, vault, deployer, usdt, wstETH);
  });
});
