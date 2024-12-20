import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { NetworkName } from "../../../hardhat.config";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { StrategyCurveLPUniV3RouterDeployment } from "./deployment/StrategyCurveLPUniV3Router.deployment";
import { optimismContracts } from "../../constants";
import { expect } from "chai";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";

runNetworkDescribe("Strategy CurveLPUniV3Router zap tests", NetworkName.OPTIMISM, false, () => {
  it("deployment", async () => {
    const { zap, weth, stableCoin, strategyCurveLPUniV3Router } = await loadFixture(
      StrategyCurveLPUniV3RouterDeployment
    );

    console.log("Deposit token:", await strategyCurveLPUniV3Router.depositToken());
    console.log("Zap:", zap.address);

    expect(stableCoin.address).eq(optimismContracts.tokens.USDC.token);
    expect(await zap.oneInchRouter()).eq(optimismContracts.oneInchRouter);
    expect(weth.address).eq(optimismContracts.tokens.WETH.token);
  });

  it("zap in test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyCurveLPUniV3RouterDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth);
  });

  it("zap out test", async () => {
    const { zap, weth, USDCe, stableCoin, vault, deployer } = await loadFixture(StrategyCurveLPUniV3RouterDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth);
    await beefOut(USDCe, deployer, zap, vault, weth);
  }).timeout(100_000);

  it("zap out and swap test", async () => {
    const { zap, weth, stableCoin, vault, deployer, USDCe } = await loadFixture(StrategyCurveLPUniV3RouterDeployment);

    await beefIn(stableCoin, deployer, zap, vault, weth);
    await beefOutAndSwap(USDCe, vault, deployer, zap, stableCoin, weth);
  });
});
