import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RewardPoolDeployment } from "./deployment/RewardPool.deployment";
import { expect } from "chai";
import { balancerContracts } from "../Balancer.contracts";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";
import { ethers, network } from "hardhat";

describe("RewardPool zap tests", () => {
  it("deployment", async () => {
    const { rewardToken, stakedToken, stableCoin, zap } = await loadFixture(RewardPoolDeployment);

    expect(rewardToken.address).eq(balancerContracts.WETH);
    expect(await zap.oneInchRouter()).eq(balancerContracts.oneInchRouter);
    expect(stakedToken.address).eq(balancerContracts.BNB);
    expect(stableCoin.address).eq(balancerContracts.LIDO);
  });

  it("beef in", async () => {
    const { rewardToken, stakedToken, stableCoin, zap, deployer, rewardPool } = await loadFixture(
      RewardPoolDeployment
    );

    const data =
      "0xbc80f1a8000000000000000000000000afcc790f80617eb451e9214ad86a24c75c85cdf50000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000001c7f62cfa29841f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748000000000000000000000009e7809c21ba130c1a51c112928ea6474d9a9ae3c8b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, rewardPool, rewardToken, stakedToken);
  });

  it("beef out", async () => {
    const { rewardToken, stakedToken, stableCoin, zap, deployer, rewardPool } = await loadFixture(
      RewardPoolDeployment
    );

    const data =
      "0xbc80f1a8000000000000000000000000afcc790f80617eb451e9214ad86a24c75c85cdf50000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000001c7f62cfa29841f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748000000000000000000000009e7809c21ba130c1a51c112928ea6474d9a9ae3c8b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, rewardPool, rewardToken, stakedToken);

    await rewardPool.notifyRewardAmount(ethers.utils.parseUnits("1"));

    await beefOut(rewardPool, deployer, zap, rewardToken, stakedToken);
  });

  it("beef out and swap test", async () => {
    const { rewardToken, stakedToken, stableCoin, zap, deployer, rewardPool } = await loadFixture(
      RewardPoolDeployment
    );

    const data =
      "0xbc80f1a8000000000000000000000000afcc790f80617eb451e9214ad86a24c75c85cdf50000000000000000000000000000000000000000000000056bc75e2d6310000000000000000000000000000000000000000000000000000001c7f62cfa29841f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748000000000000000000000009e7809c21ba130c1a51c112928ea6474d9a9ae3c8b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, rewardPool, rewardToken, stakedToken);

    await rewardPool.notifyRewardAmount(ethers.utils.parseUnits("1"));

    const data1 =
      "0xbc80f1a8000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000000000000000000000000000035674659fd57bcd00000000000000000000000000000000000000000000000281b57d863951f9a5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000009e7809c21ba130c1a51c112928ea6474d9a9ae3c800000000000000000000000a3f558aebaecaf0e11ca4b2199cc5ed341edfd748b1ccac8";

    const data2 =
      "0xf78dc253000000000000000000000000610acfd59bef98f34740b780b81d04079ac732d4000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000150d9925c7b30000000000000000000000000000000000000000000000000027735bf1de7ad700000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340c558f600b34a5f69dd2f0d06cb8a88d829b7420a8b1ccac8";

    await beefOutAndSwap(rewardPool, deployer, zap, stableCoin, rewardToken, stakedToken, data1, data2);
  });
});
