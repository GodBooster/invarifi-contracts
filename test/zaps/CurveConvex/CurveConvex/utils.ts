import {
  BalancerAuraZapOneInchETH,
  VaultV7,
  CurveConvexZapOneInchETH,
  ERC20,
  IWETH,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: CurveConvexZapOneInchETH,
  vault: VaultV7,
  weth: IWETH
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        inputToken: data,
      },
    ]
  );

  const amount = "100000000000000000000";

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 1, encodedData);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: CurveConvexZapOneInchETH,
  vault: VaultV7,
  weth: IWETH
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "token", type: "address" },
          // @ts-ignore
          { name: "tokenIndex", type: "uint256" },
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        token: weth.address,
        tokenIndex: 2,
        inputToken: "0x",
      },
    ]
  );

  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const wethBefore = await weth.balanceOf(deployer.address);
  const ethBefore = await ethers.provider.getBalance(deployer.address);

  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefOut(vault.address, withdrawAmount, 1, encodedData);

  const wethAfter = await weth.balanceOf(deployer.address);
  const ethAfter = await ethers.provider.getBalance(deployer.address);

  expect(wethAfter.sub(wethBefore)).eq(0);
  expect(ethAfter.sub(ethBefore)).gt(0);
  console.log(wethAfter.sub(wethBefore));
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  stableCoin: ERC20,
  weth: IWETH,
  data: string
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "token", type: "address" },
          // @ts-ignore
          { name: "tokenIndex", type: "uint256" },
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        token: weth.address,
        tokenIndex: 2,
        inputToken: data,
      },
    ]
  );

  const balanceStableCoinBefore = await stableCoin.balanceOf(deployer.address);
  const balanceWethBefore = await weth.balanceOf(deployer.address);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 1, ethers.constants.AddressZero, encodedData);

  const balanceStableCoinAfter = await stableCoin.balanceOf(deployer.address);
  const balanceWethAfter = await weth.balanceOf(deployer.address);

  expect(balanceStableCoinAfter.sub(balanceStableCoinBefore)).gt(0);
  expect(balanceWethAfter).eq(balanceWethBefore);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
