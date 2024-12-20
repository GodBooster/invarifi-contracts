import { runNetworkDescribe } from "../../../utils/optional-tests";
import { NetworkName } from "../../../../hardhat.config";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { arbitrumContracts, arbitrumSwapPathes, baseContracts, baseSwapPathes } from "../../../constants";
import { transferImpersonatedTokensArbitrum, transferImpersonatedTokensBase } from "../../common/Infra.deployment";
import { ethers } from "hardhat";
import { ERC20__factory } from "../../../../typechain-types";
import { deposit, withdraw } from "../../common/utils";
import { balancerAuraLpHelperBaseDeployment } from "./deployment";

runNetworkDescribe("BalancerAuraLpHelperBase tests", NetworkName.BASE, true, () => {
  it("deployment", async () => {
    const { usdt, lpHelper } = await loadFixture(balancerAuraLpHelperBaseDeployment);

    expect(usdt.address).eq(baseContracts.tokens.USDC.token);
    expect(await lpHelper.uniswapV3Router()).eq(baseContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const params = await loadFixture(balancerAuraLpHelperBaseDeployment);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;

    await transferImpersonatedTokensBase({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      baseSwapPathes.USDC_TO_WETH.tokenFrom,
      baseSwapPathes.USDC_TO_WETH.tokenTo,
      baseSwapPathes.USDC_TO_WETH.path
    );

    const amount = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(baseContracts.tokens.WETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amount, false);
  }).timeout(100_000);

  it.only("withdraw test", async () => {
    const params = await loadFixture(balancerAuraLpHelperBaseDeployment);
    const { lpHelper, vault, usdt, deployer, earnConfig } = params;
    await transferImpersonatedTokensBase({
      deployer: params.deployer,
      uniswapV3: params.uniswapV3,
      mockUniswap: params.mockUniswap,
    });

    await earnConfig.setSwapPath(
      baseSwapPathes.USDC_TO_WETH.tokenFrom,
      baseSwapPathes.USDC_TO_WETH.tokenTo,
      baseSwapPathes.USDC_TO_WETH.path
    );

    await earnConfig.setSwapPath(
      baseSwapPathes.WETH_TO_USDC.tokenFrom,
      baseSwapPathes.WETH_TO_USDC.tokenTo,
      baseSwapPathes.WETH_TO_USDC.path
    );

    await earnConfig.setSwapPath(
      baseSwapPathes.cbETH_TO_USDC.tokenFrom,
      baseSwapPathes.cbETH_TO_USDC.tokenTo,
      baseSwapPathes.cbETH_TO_USDC.path
    );

    const amountToDeposit = ethers.utils.parseUnits("100", await usdt.decimals());

    // eslint-disable-next-line camelcase
    const weth = ERC20__factory.connect(baseContracts.tokens.WETH.token, deployer);
    // eslint-disable-next-line camelcase
    const wstETH = ERC20__factory.connect(baseContracts.tokens.wstETH.token, deployer);

    await deposit(lpHelper, vault, deployer, usdt, weth, amountToDeposit);

    await withdraw(lpHelper, vault, deployer, usdt, usdt);
  }).timeout(100_000);
});
