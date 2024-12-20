import { ethers } from "hardhat";
import { expect } from "chai";
import {
  BalancerAuraZapOneInchETH,
  RewardPool,
  ERC20,
  IERC20,
  IWETH,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  strategy: RewardPool,
  weth: IWETH,
  stakedToken: ERC20
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "inputToken0", type: "address" },
          // @ts-ignore
          { name: "inputToken1", type: "address" },
          // @ts-ignore
          { name: "_token0", type: "bytes" },
          // @ts-ignore
          { name: "_token1", type: "bytes" },
        ],
      },
    ],
    [
      {
        inputToken0: stableCoin.address,
        inputToken1: ethers.constants.AddressZero,
        _token0: data,
        _token1: "0x",
      },
    ]
  );

  const amount = "100000000000000000000";

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await strategy.balanceOf(deployer.address)).eq(0);
  expect(await strategy.balanceOf(zap.address)).eq(0);
  expect(await stakedToken.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefIn(strategy.address, stableCoin.address, amount, 1, encodedData);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await strategy.balanceOf(deployer.address)).gt(0);
  expect(await strategy.balanceOf(zap.address)).eq(0);
  expect(await stakedToken.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  strategy: RewardPool,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  rewardToken: IWETH,
  stakedToken: ERC20
) => {
  const withdrawAmount = await strategy.balanceOf(deployer.address);
  console.log((await strategy.earned(deployer.address)).toString());

  const rewardTokenBefore = await rewardToken.balanceOf(deployer.address);
  const stakedTokenBefore = await stakedToken.balanceOf(deployer.address);

  await strategy.connect(deployer).approve(zap.address, withdrawAmount);
  await zap.connect(deployer).beefOut(strategy.address, withdrawAmount, 1, "0x");

  const rewardTokenAfter = await rewardToken.balanceOf(deployer.address);
  const stakedTokenAfter = await stakedToken.balanceOf(deployer.address);

  expect(rewardTokenAfter.sub(rewardTokenBefore)).gt(0);
  expect(stakedTokenAfter.sub(stakedTokenBefore)).gt(0);

  console.log(rewardTokenAfter.sub(rewardTokenBefore));
  console.log(stakedTokenAfter.sub(stakedTokenBefore));

  expect(await stakedToken.balanceOf(zap.address)).eq(0);
  expect(await rewardToken.balanceOf(zap.address)).eq(0);
  expect(await strategy.balanceOf(deployer.address)).eq(0);
  expect(await strategy.balanceOf(zap.address)).eq(0);
};

export const beefOutAndSwap = async (
  strategy: RewardPool,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  stableCoin: ERC20,
  rewardToken: IWETH,
  stakedToken: ERC20,
  data1: string,
  data2: string
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          // @ts-ignore
          { name: "token0", type: "bytes" },
          // @ts-ignore
          { name: "token1", type: "bytes" },
        ],
      },
    ],
    [
      {
        token0: data1,
        token1: data2,
      },
    ]
  );

  const withdrawAmount = await strategy.balanceOf(deployer.address);

  await strategy.connect(deployer).approveWithRewards(zap.address, withdrawAmount);

  const balanceBefore = await stableCoin.balanceOf(deployer.address);
  const rewardBalanceBefore = await rewardToken.balanceOf(deployer.address);
  const stakedBalanceBefore = await stakedToken.balanceOf(deployer.address);

  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await strategy.balanceOf(deployer.address)).gt(0);

  await zap.beefOutAndSwap(strategy.address, withdrawAmount, 1, ethers.constants.AddressZero, encodedData, {
    gasLimit: 30000000,
  });

  const balanceAfter = await stableCoin.balanceOf(deployer.address);
  const rewardBalanceAfter = await rewardToken.balanceOf(deployer.address);
  const stakedBalanceAfter = await stakedToken.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(rewardBalanceAfter.sub(rewardBalanceBefore)).eq(0);
  expect(stakedBalanceAfter.sub(stakedBalanceBefore)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await stakedToken.balanceOf(zap.address)).eq(0);
  expect(await rewardToken.balanceOf(zap.address)).eq(0);
  expect(await strategy.balanceOf(deployer.address)).eq(0);
};
