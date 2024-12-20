import { runNetworkDescribe } from "../../../utils/optional-tests";
import { NetworkName } from "../../../../hardhat.config";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { arbitrumContracts, arbitrumSwapPathes } from "../../../constants";
import { transferImpersonatedTokensArbitrum } from "../../common/Infra.deployment";
import { ethers } from "hardhat";
import { ERC20__factory } from "../../../../typechain-types";
import { deposit, withdraw } from "../../common/utils";
import { balancerAuraLpHelperArbDeployment } from "./deployment";

runNetworkDescribe("BalancerAuraLpHelperArb tests", NetworkName.ARBITRUM, false, () => {
  it("deployment", async () => {
    const { usdt, lpHelper } = await loadFixture(balancerAuraLpHelperArbDeployment);

    expect(usdt.address).eq(arbitrumContracts.tokens.USDC.token);
    expect(await lpHelper.uniswapV3Router()).eq(arbitrumContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const params = await loadFixture(balancerAuraLpHelperArbDeployment);
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
    const params = await loadFixture(balancerAuraLpHelperArbDeployment);
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

    await earnConfig.setSwapPath(
      arbitrumSwapPathes.wstETH_TO_USDC.tokenFrom,
      arbitrumSwapPathes.wstETH_TO_USDC.tokenTo,
      arbitrumSwapPathes.wstETH_TO_USDC.path
    );

    const amountToDeposit = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(arbitrumContracts.tokens.WETH.token, deployer);
    // eslint-disable-next-line camelcase
    const wstETH = ERC20__factory.connect(arbitrumContracts.tokens.wstETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amountToDeposit);

    await withdraw(lpHelper, vault, deployer, usdt, wstETH);
  });
});
