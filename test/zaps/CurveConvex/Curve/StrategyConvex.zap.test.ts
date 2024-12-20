import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { balancerContracts } from "../../Balancer.contracts";
import { StrategyConvexDeployment, StrategyConvexPoolDeployment } from "../deployment/StrategyConvex.deployment";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";
import { ERC20__factory, IERC20__factory } from "../../../../typechain-types";

describe("StrategyConvex zap tests", () => {
  it("deployment test", async () => {
    const { zap, weth, stableCoin } = await loadFixture(StrategyConvexDeployment);

    console.log(zap.address);

    expect(stableCoin.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000056328190000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000033e71cacbb6b596bc006aac3eeaa2817e82122648b1ccac8";

    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
  }).timeout(100_000);

  it("beef out test", async () => {
    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000056328190000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000033e71cacbb6b596bc006aac3eeaa2817e82122648b1ccac8";
    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    // eslint-disable-next-line camelcase
    const tokenOut = ERC20__factory.connect("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", deployer);

    await beefOut(vault, deployer, zap, tokenOut);
  });

  it("beef out and swap test", async () => {
    const data =
      "0xe449022e0000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000000000056328190000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000033e71cacbb6b596bc006aac3eeaa2817e82122648b1ccac8";
    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexDeployment);

    console.log(zap.address);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    const newData =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000000000000000000000000000000000000ac42cce0000000000000000000000000000000000000000000000055182a9f23d9d58700000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000000000000033e71cacbb6b596bc006aac3eeaa2817e82122648b1ccac8";

    // eslint-disable-next-line camelcase
    const tokenOut = ERC20__factory.connect("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", deployer);

    await beefOutAndSwap(vault, deployer, zap, stableCoin, newData, tokenOut);
  });
});

describe("StrategyConvex zap pool tests", () => {
  it("deployment test", async () => {
    const { zap, weth, stableCoin } = await loadFixture(StrategyConvexPoolDeployment);

    console.log(zap.address);

    expect(stableCoin.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const data =
      "0xf78dc25300000000000000000000000026bb24f70a12b2e05617f764308d4898a8b73f490000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000b2f742ac99a62a00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexPoolDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
  }).timeout(100_000);

  it("beef out test", async () => {
    const data =
      "0xf78dc25300000000000000000000000026bb24f70a12b2e05617f764308d4898a8b73f490000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000b2f742ac99a62a00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";
    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexPoolDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    // eslint-disable-next-line camelcase
    const tokenOut = ERC20__factory.connect(balancerContracts.WETH, deployer);

    await beefOut(vault, deployer, zap, tokenOut);
  });

  it("beef out and swap test", async () => {
    const data =
      "0xf78dc25300000000000000000000000026bb24f70a12b2e05617f764308d4898a8b73f490000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000b2f742ac99a62a00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";
    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyConvexPoolDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    const newData =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000000000000000000000000000015dc9a2dd803f2a000000000000000000000000000000000000000000000002a6182839127eeaaf00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001800000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    // eslint-disable-next-line camelcase
    const tokenOut = ERC20__factory.connect(balancerContracts.WETH, deployer);

    await beefOutAndSwap(vault, deployer, zap, stableCoin, newData, tokenOut);
  });
});
