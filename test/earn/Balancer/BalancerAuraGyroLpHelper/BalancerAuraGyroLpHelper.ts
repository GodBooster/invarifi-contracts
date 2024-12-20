import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, swapPathes, transferImpersonatedTokens } from "../../common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { balancerAuraGyroLpHelperDeployment } from "./deployment";
// eslint-disable-next-line node/no-missing-import
import { balancerContracts } from "../../../zaps/Balancer.contracts";
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../../common/utils";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory } from "../../../../typechain-types";

describe("BalancerAuraGyroLpHelper tests", () => {
  it("deployment", async () => {
    const { usdt, aggregator, lpHelper, priceFeeds } = await loadFixture(balancerAuraGyroLpHelperDeployment);

    expect(usdt.address).eq(earnCommonAddresses.tokens.USDT);
    expect(await aggregator.dataFeeds(usdt.address)).eq(priceFeeds.USDT_USD.address);
    expect(await lpHelper.uniswapV3Router()).eq(earnCommonAddresses.UNI_V3_ROUTER);
  });

  it("deposit", async () => {
    const params = await loadFixture(balancerAuraGyroLpHelperDeployment);
    const { sa, lpHelper, vault, deployer, usdt } = params;
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
    const weth = ERC20__factory.connect(balancerContracts.WETH, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount, true);
  });

  it("withdraw", async () => {
    const params = await loadFixture(balancerAuraGyroLpHelperDeployment);
    const { sa, lpHelper, vault, deployer, usdt } = params;
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
      swapPathes.WETH_TO_USDT.tokenFrom,
      swapPathes.WETH_TO_USDT.tokenTo,
      swapPathes.WETH_TO_USDT.path
    );
    await sa.setSwapPath(
      swapPathes.wstETH_TO_USDT.tokenFrom,
      swapPathes.wstETH_TO_USDT.tokenTo,
      swapPathes.wstETH_TO_USDT.path
    );

    const amount = ethers.utils.parseUnits("100", "6");

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(balancerContracts.WETH, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount, true);

    await withdraw(lpHelper, vault, deployer, usdt, weth);
  });
});
