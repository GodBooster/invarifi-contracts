import {
  VaultV7,
  ERC20,
  IERC20,
  IWETH,
  RetroGammaZapOneInchPoly,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: RetroGammaZapOneInchPoly,
  vault: VaultV7,
  weth: IWETH,
  _type: number
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

  const amount = "1000000000000000000000";

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, _type, encodedData);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: RetroGammaZapOneInchPoly,
  tokenOut: IERC20
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  const balanceToken1Before = await ethers.provider.getBalance(deployer.address);
  const balanceToken2Before = await tokenOut.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);
  expect(await ethers.provider.getBalance(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOut(vault.address, withdrawAmount, 0, "0x");

  const balanceToken1After = await ethers.provider.getBalance(deployer.address);
  const balanceToken2After = await tokenOut.balanceOf(deployer.address);

  expect(balanceToken1After.sub(balanceToken1Before)).gt(0);
  expect(balanceToken2After.sub(balanceToken2Before)).gt(0);

  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await ethers.provider.getBalance(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: RetroGammaZapOneInchPoly,
  stableCoin: ERC20,
  tokenOut1: IERC20,
  tokenOut2: IERC20,
  data1: string,
  data2: string
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const encodedDataToBeefOut = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "inputToken0", type: "bytes" },
          // @ts-ignore
          { name: "inputToken1", type: "bytes" },
        ],
      },
    ],
    [
      {
        inputToken0: data1,
        inputToken1: data2,
      },
    ]
  );

  const balanceBefore = await stableCoin.balanceOf(deployer.address);
  const balanceToken1Before = await tokenOut1.balanceOf(deployer.address);
  const balanceToken2Before = await tokenOut2.balanceOf(deployer.address);

  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut1.balanceOf(zap.address)).eq(0);
  expect(await tokenOut2.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 0, stableCoin.address, encodedDataToBeefOut);

  const balanceAfter = await stableCoin.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut1.balanceOf(deployer.address)).eq(balanceToken1Before);
  expect(await tokenOut2.balanceOf(deployer.address)).eq(balanceToken2Before);
  expect(await tokenOut1.balanceOf(zap.address)).eq(0);
  expect(await tokenOut2.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
