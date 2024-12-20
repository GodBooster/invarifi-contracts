// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { beefIn, beefOut, beefOutAndSwap } from "./utils";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import { StrategyAuraMainnetDeployment } from "../deployment/StrategyAuraMainnet.deployment";
// eslint-disable-next-line node/no-missing-import
import { balancerContracts } from "../../Balancer.contracts";
import { StrategyBalancerMultiRewardGaugeUniV3Deployment } from "../deployment/StrategyBalancerMultiRewardGaugeUniV3.deployment";
import { IERC20__factory } from "../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import

describe("StrategyAuraMainnet zap tests", () => {
  it("deployment test", async () => {
    const { zap, weth, usdt } = await loadFixture(StrategyAuraMainnetDeployment);

    expect(usdt.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyAuraMainnetDeployment);

    await beefIn(data, usdt, deployer, zap, vault, weth, 0);
  });

  it("beef out test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyAuraMainnetDeployment);

    await beefIn(data, usdt, deployer, zap, vault, weth, 0);

    // eslint-disable-next-line camelcase
    const tokenOut = IERC20__factory.connect("0xac3E018457B222d93114458476f3E3416Abbe38F", deployer);

    await beefOut(vault, deployer, zap, tokenOut, 1, 0);
  });

  it("beef out and swap test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyAuraMainnetDeployment);
    await beefIn(data, usdt, deployer, zap, vault, weth, 0);

    // eslint-disable-next-line camelcase
    const tokenOut = IERC20__factory.connect("0xac3E018457B222d93114458476f3E3416Abbe38F", deployer);

    const dataNew =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d400000000000000000000000000000000000000000000000001701dadf4334a890000000000000000000000000000000000000000000000029dc2dc3bef678cc100000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eed4603bc333ef406e5eb691ba66798d5c857d8b800000000000000000000000f4ad61db72f114be877e87d62dc5e7bd52df4d9b8b1ccac8";

    await beefOutAndSwap(vault, deployer, zap, usdt, tokenOut, 1, 0, dataNew);
  }).timeout(100_000);
});

describe("StrategyBalancerMultiRewardGaugeUniV3 zap tests", () => {
  it("deployment test", async () => {
    const { zap, weth, usdt } = await loadFixture(StrategyBalancerMultiRewardGaugeUniV3Deployment);

    expect(usdt.address).eq(balancerContracts.LIDO);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(weth.address).eq(balancerContracts.WETH);
  });

  it("beef in test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyBalancerMultiRewardGaugeUniV3Deployment);

    await beefIn(data, usdt, deployer, zap, vault, weth, 1);
  }).timeout(100_000);

  it("beef out test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyBalancerMultiRewardGaugeUniV3Deployment);

    await beefIn(data, usdt, deployer, zap, vault, weth, 1);

    // eslint-disable-next-line camelcase
    const tokenOut = IERC20__factory.connect("0xae78736Cd615f374D3085123A210448E74Fc6393", deployer);

    await beefOut(vault, deployer, zap, tokenOut, 0, 1);
  });

  it("beef out and swap test", async () => {
    const data =
      "0x0502b1c50000000000000000000000005a98fcbea516cf06857215779fd812ca3bef1b320000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000000a68c3c4030b4e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340454f11d58e27858926d7a4ece8bfea2c33e97b138b1ccac8";

    const { zap, usdt, deployer, vault, weth } = await loadFixture(StrategyBalancerMultiRewardGaugeUniV3Deployment);

    await beefIn(data, usdt, deployer, zap, vault, weth, 1);

    // eslint-disable-next-line camelcase
    const tokenOut = IERC20__factory.connect("0xae78736Cd615f374D3085123A210448E74Fc6393", deployer);

    const dataNew =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d40000000000000000000000000000000000000000000000000142c4df6fa9804000000000000000000000000000000000000000000000000287c777bbe11dd61500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000553e9c493678d8606d6a5ba284643db2110df823800000000000000000000000f4ad61db72f114be877e87d62dc5e7bd52df4d9b8b1ccac8";

    await beefOutAndSwap(vault, deployer, zap, usdt, tokenOut, 0, 1, dataNew);
  });
});
