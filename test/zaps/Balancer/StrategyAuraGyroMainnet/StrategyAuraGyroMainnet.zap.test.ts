import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { StrategyAuraMainnetDeployment } from "../deployment/StrategyAuraMainnet.deployment";
import { expect } from "chai";
import { balancerContracts } from "../../Balancer.contracts";
import { IERC20__factory } from "../../../../typechain-types";
import { StrategyAuraGyroMainnetDeployment } from "../deployment/StrategyAuraGyroMainnet.deployment";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";

describe("StrategyAuraGyroMainnet zap tests", () => {
  it("deployment test", async () => {
    const { zap, weth, stableCoin } = await loadFixture(StrategyAuraGyroMainnetDeployment);

    expect(stableCoin.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyAuraGyroMainnetDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
  }).timeout(100_000);

  it("beef out test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyAuraGyroMainnetDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    // eslint-disable-next-line camelcase
    const tokenOut = IERC20__factory.connect("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", deployer);

    await beefOut(vault, deployer, zap, weth, tokenOut);
  });

  it("beef out and swap test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const dataToSwap2 =
      "0xf78dc253000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000325ecf71defc760000000000000000000000000000000000000000000000005d64cb1aebda7c7400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340c558f600b34a5f69dd2f0d06cb8a88d829b7420a8b1ccac8";

    const dataToSwap1 =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d400000000000000000000000000000000000000000000000000f956f470aacf400000000000000000000000000000000000000000000000020fa574e0fa69da6500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000109830a1aaad605bbf02a9dfa7b0b92ec2fb7daa800000000000000000000000f4ad61db72f114be877e87d62dc5e7bd52df4d9b8b1ccac8";

    const { zap, stableCoin, deployer, vault, weth } = await loadFixture(StrategyAuraGyroMainnetDeployment);

    await beefIn(data, stableCoin, deployer, zap, vault, weth);

    const tokenOut = IERC20__factory.connect("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", deployer);

    await beefOutAndSwap(vault, deployer, zap, stableCoin, weth, dataToSwap1, dataToSwap2, tokenOut);
  });
});
