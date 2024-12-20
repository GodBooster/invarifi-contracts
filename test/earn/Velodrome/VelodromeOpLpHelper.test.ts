// eslint-disable-next-line node/no-missing-import
import { runNetworkDescribe } from "../../utils/optional-tests";
// eslint-disable-next-line node/no-missing-import
import { NetworkName } from "../../../hardhat.config";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import { optimismContracts, optimismSwapPathes } from "../../constants";
// eslint-disable-next-line node/no-missing-import
import { transferImpersonatedTokensOptimism } from "../common/Infra.deployment";
import { ethers } from "hardhat";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ERC20__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { deposit, withdraw } from "../common/utils";
// eslint-disable-next-line node/no-missing-import
import { velodromeVeloUSDCeDeployment } from "./deployment";

runNetworkDescribe("VelodromeOpLpHelper tests", NetworkName.OPTIMISM, false, () => {
  it("deployment", async () => {
    const { usdc, lpHelper } = await loadFixture(velodromeVeloUSDCeDeployment);

    expect(usdc.address).eq(optimismContracts.tokens.USDC.token);
    expect(await lpHelper.uniswapV3Router()).eq(optimismContracts.uniswapV3Router);
  });

  it("deposit test", async () => {
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdc, earnConfig } = await loadFixture(
      velodromeVeloUSDCeDeployment
    );
    await transferImpersonatedTokensOptimism({
      deployer,
      uniswapV3,
      mockUniswap,
    });
    await earnConfig.setSwapPath(
      optimismSwapPathes.USDC_TO_VELO2.tokenFrom,
      optimismSwapPathes.USDC_TO_VELO2.tokenTo,
      optimismSwapPathes.USDC_TO_VELO2.path
    );

    const amount = ethers.utils.parseUnits("1000", await usdc.decimals());
    // eslint-disable-next-line camelcase
    const velo = ERC20__factory.connect(optimismContracts.tokens.VELOV2.token, deployer);
    await deposit(lpHelper, vault, deployer, usdc, velo, amount, true);
  });

  it("withdraw test", async () => {
    const { deployer, uniswapV3, mockUniswap, lpHelper, vault, usdc, earnConfig } = await loadFixture(
      velodromeVeloUSDCeDeployment
    );
    await transferImpersonatedTokensOptimism({
      deployer,
      uniswapV3,
      mockUniswap,
    });
    await earnConfig.setSwapPath(
      optimismSwapPathes.USDC_TO_VELO2.tokenFrom,
      optimismSwapPathes.USDC_TO_VELO2.tokenTo,
      optimismSwapPathes.USDC_TO_VELO2.path
    );

    const amount = ethers.utils.parseUnits("1000", await usdc.decimals());
    // eslint-disable-next-line camelcase
    const velo = ERC20__factory.connect(optimismContracts.tokens.VELOV2.token, deployer);
    await deposit(lpHelper, vault, deployer, usdc, velo, amount, true);

    await earnConfig.setSwapPath(
      optimismSwapPathes.USDCe_TO_USDC.tokenFrom,
      optimismSwapPathes.USDCe_TO_USDC.tokenTo,
      optimismSwapPathes.USDCe_TO_USDC.path
    );
    await earnConfig.setSwapPath(
      optimismSwapPathes.VELO_TO_USDC.tokenFrom,
      optimismSwapPathes.VELO_TO_USDC.tokenTo,
      optimismSwapPathes.VELO_TO_USDC.path
    );
    console.log("withdraw");

    await withdraw(lpHelper, vault, deployer, usdc, velo);
  });
});
