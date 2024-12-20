import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { StrategyStargateBalDeployment } from "./deployment/StrategyStargateBal.deployment";
import { expect } from "chai";
import { balancerContracts } from "../Balancer.contracts";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";

describe("StrategyStargateBal zap tests", async () => {
  it("deployment", async () => {
    const { zap, weth, stableCoin, strategyStargateBal } = await loadFixture(StrategyStargateBalDeployment);

    console.log(zap.address); // 0x26BB24F70A12B2E05617f764308D4898A8B73F49
    console.log(await strategyStargateBal.depositToken());

    expect(stableCoin.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyStargateBalDeployment);

    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000bb962d0761b31700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
  });

  it("beef out test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyStargateBalDeployment);

    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000bb962d0761b31700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
    await beefOut(stableCoin, deployer, zap, vault, weth);
  });

  it("beef out and swap test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyStargateBalDeployment);

    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000bb962d0761b31700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    const newData =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000000000000000000000000000015bed03826b0f87000000000000000000000000000000000000000000000002890d58d41ae152cb00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001800000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    await beefOutAndSwap(vault, deployer, zap, stableCoin, weth, newData);
  });
});
