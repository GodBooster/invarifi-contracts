import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { NetworkName } from "../../../hardhat.config";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { StrategyBaseSwapDeployment } from "./deployment/StrategyBaseSwap.deployment";
import { expect } from "chai";
import { baseContracts } from "../../constants";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";

runNetworkDescribe("Strategy BaseSwap zap tests", NetworkName.BASE, false, () => {
  it("deployment", async () => {
    const { zap, weth, stableCoin, cbETH, strategyBaseSwap } = await loadFixture(StrategyBaseSwapDeployment);

    console.log("Want token:", await strategyBaseSwap.want());
    console.log("Zap:", zap.address);

    expect(stableCoin.address.toLowerCase()).eq(baseContracts.tokens.USDC.token.toLowerCase());
    expect((await zap.oneInchRouter()).toLowerCase()).eq(baseContracts.oneInchRouter.toLowerCase());
    expect(weth.address.toLowerCase()).eq(baseContracts.tokens.WETH.token.toLowerCase());
    expect(cbETH.address.toLowerCase()).eq(baseContracts.tokens.cbETH.token.toLowerCase());
  });

  it("zap in test", async () => {
    const { stableCoin, deployer, zap, vault, weth, cbETH } = await loadFixture(StrategyBaseSwapDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth, cbETH);
  });

  it("zap out test", async () => {
    const { stableCoin, deployer, zap, vault, weth, cbETH } = await loadFixture(StrategyBaseSwapDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth, cbETH);
    await beefOut(deployer, zap, vault, weth, cbETH);
  });

  it("zap out and swap test", async () => {
    const { stableCoin, deployer, zap, vault, weth, cbETH } = await loadFixture(StrategyBaseSwapDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth, cbETH);
    await beefOutAndSwap(stableCoin, deployer, zap, vault, weth, cbETH);
  });
});
