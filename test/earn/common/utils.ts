import { BigNumber } from "ethers";
// eslint-disable-next-line camelcase,node/no-missing-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { VaultV7, ERC20, ERC20__factory, IWETH, LpHelperBase } from "../../../typechain-types";

export const deposit = async (
  lpHelper: LpHelperBase,
  vault: VaultV7,
  caller: SignerWithAddress,
  stableCoin: ERC20,
  tokenToSwapViaUniswap: ERC20,
  amount: BigNumber,
  gyro: boolean = false
) => {
  // eslint-disable-next-line camelcase
  const want = ERC20__factory.connect(await vault.want(), caller);

  const balanceStableBefore = await stableCoin.balanceOf(caller.address);
  const balanceWantBefore = await want.balanceOf(caller.address);
  const balanceTokenToSwapBefore = await tokenToSwapViaUniswap.balanceOf(caller.address);

  expect(await vault.balanceOf(caller.address)).eq(0);

  await stableCoin.connect(caller).transfer(lpHelper.address, amount);
  await lpHelper.deposit(vault.address, amount, [0]);

  const balanceStableAfter = await stableCoin.balanceOf(caller.address);
  const balanceWantAfter = await want.balanceOf(caller.address);
  const balanceTokenToSwapAfter = await tokenToSwapViaUniswap.balanceOf(caller.address);

  expect(balanceStableBefore.sub(balanceStableAfter)).eq(amount);
  expect(balanceWantAfter.sub(balanceWantBefore)).eq(0);
  expect(await vault.balanceOf(caller.address)).gt(0);
  expect(balanceTokenToSwapAfter.sub(balanceTokenToSwapBefore)).eq(0);
  expect(await stableCoin.balanceOf(lpHelper.address)).eq(0);
  expect(await want.balanceOf(lpHelper.address)).eq(0);
  if (!gyro) {
    expect(await tokenToSwapViaUniswap.balanceOf(lpHelper.address)).eq(0);
  }
};

export const withdraw = async (
  lpHelper: LpHelperBase,
  vault: VaultV7,
  caller: SignerWithAddress,
  stableCoin: ERC20,
  tokenOut: ERC20 | IWETH
) => {
  await vault.transfer(lpHelper.address, await vault.balanceOf(caller.address));

  const balanceStableBefore = await stableCoin.balanceOf(caller.address);
  const balanceTokenOutBefore = await tokenOut.balanceOf(caller.address);

  await lpHelper.withdraw(vault.address, await vault.balanceOf(lpHelper.address));

  const balanceStableAfter = await stableCoin.balanceOf(caller.address);
  const balanceTokenOutAfter = await tokenOut.balanceOf(caller.address);

  expect(await vault.balanceOf(caller.address)).eq(0);
  expect(await vault.balanceOf(lpHelper.address)).eq(0);
  expect(await stableCoin.balanceOf(lpHelper.address)).eq(0);
  expect(await tokenOut.balanceOf(lpHelper.address)).eq(0);
  expect(balanceStableAfter.sub(balanceStableBefore)).gt(0);
  expect(balanceTokenOutAfter.sub(balanceTokenOutBefore)).eq(0);
};
