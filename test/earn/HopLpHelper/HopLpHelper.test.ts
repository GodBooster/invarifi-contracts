import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import {
  transferImpersonatedTokensArbitrum,
  transferImpersonatedTokensPolygon,
  // eslint-disable-next-line node/no-missing-import
} from "../common/Infra.deployment";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../common/utils";
// eslint-disable-next-line node/no-missing-import
import { hopLpHelper } from "./deployment";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { NetworkName } from "../../../hardhat.config";
import { arbitrumContracts, arbitrumSwapPathes } from "../../constants";

runNetworkDescribe("HopLpHelper tests", NetworkName.ARBITRUM, false, () => {
  it("deployment", async () => {
    const { usdt, lpHelper } = await loadFixture(hopLpHelper);

    expect(usdt.address).eq(arbitrumContracts.tokens.USDC);
    expect(await lpHelper.uniswapV3Router()).eq(arbitrumContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const params = await loadFixture(hopLpHelper);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;
    await transferImpersonatedTokensArbitrum({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      arbitrumSwapPathes.USDC_TO_WETH.tokenFrom,
      arbitrumSwapPathes.USDC_TO_WETH.tokenTo,
      arbitrumSwapPathes.USDC_TO_WETH.path
    );

    const amount = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(arbitrumContracts.tokens.WETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount);
  }).timeout(100_000);

  it("withdraw test", async () => {
    const params = await loadFixture(hopLpHelper);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;
    await transferImpersonatedTokensArbitrum({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      arbitrumSwapPathes.USDC_TO_WETH.tokenFrom,
      arbitrumSwapPathes.USDC_TO_WETH.tokenTo,
      arbitrumSwapPathes.USDC_TO_WETH.path
    );

    await earnConfig.setSwapPath(
      arbitrumSwapPathes.WETH_TO_USDC.tokenFrom,
      arbitrumSwapPathes.WETH_TO_USDC.tokenTo,
      arbitrumSwapPathes.WETH_TO_USDC.path
    );

    const amountToDeposit = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(arbitrumContracts.tokens.WETH.token, deployer);
    // eslint-disable-next-line camelcase
    const usdc = ERC20__factory.connect(arbitrumContracts.tokens.USDC.token, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amountToDeposit);

    await withdraw(lpHelper, vault, deployer, usdt, usdc);
  });
});
