// eslint-disable-next-line node/no-missing-import
import { VaultV7, CommonZapOneInch, ERC20, IWETH } from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { address } from "hardhat/internal/core/config/config-validation";
import { parseUnits } from "ethers/lib/utils";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  vault: VaultV7,
  weth: IWETH
) => {
  const encodedData = data;

  const amount = parseUnits("1000", await stableCoin.decimals());

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 0, encodedData);

  console.log({ balance: (await vault.balanceOf(deployer.address)).toString() });
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  tokenOut: ERC20 | IWETH,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  vault: VaultV7,
  weth: IWETH,
  isNative?: boolean
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const balanceBefore = isNative
    ? await ethers.provider.getBalance(deployer.address)
    : await tokenOut.balanceOf(deployer.address);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefOut(vault.address, withdrawAmount, 0, "0x");

  const balanceAfter = isNative
    ? await ethers.provider.getBalance(deployer.address)
    : await tokenOut.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  console.log(balanceAfter.sub(balanceBefore).toString());
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  stableCoin: ERC20,
  weth: IWETH,
  data: string
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);
  console.log("WITHDRAW AMOUT", withdrawAmount);

  const encodedData = data;

  const balanceStableCoinBefore = await stableCoin.balanceOf(deployer.address);
  const balanceWethBefore = await weth.balanceOf(deployer.address);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  await zap.connect(deployer).beefOutAndSwap(vault.address, withdrawAmount, 0, stableCoin.address, encodedData);

  const balanceStableCoinAfter = await stableCoin.balanceOf(deployer.address);
  const balanceWethAfter = await weth.balanceOf(deployer.address);

  expect(balanceStableCoinAfter.sub(balanceStableCoinBefore)).gt(0);
  expect(balanceWethAfter).eq(balanceWethBefore);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
};
