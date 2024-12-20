// eslint-disable-next-line node/no-missing-import
import { VaultV7, CommonZapOneInch, ERC20, IWETH } from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { address } from "hardhat/internal/core/config/config-validation";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  vault: VaultV7,
  weth: IWETH
) => {
  // address[] path;
  // address _inputToken0;
  // address _inputToken1;
  // bytes _token0;
  // bytes _token1;

  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "_inputToken0", type: "address" },
          // @ts-ignore
          { name: "_inputToken1", type: "address" },
          // @ts-ignore
          { name: "_token0", type: "bytes" },
          // @ts-ignore
          { name: "_token1", type: "bytes" },
        ],
      },
    ],
    [
      {
        _inputToken0: stableCoin.address,
        _inputToken1: ethers.constants.AddressZero,
        _token0: data,
        _token1: "0x",
      },
    ]
  );

  const amount = "100000000";

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 5, encodedData);

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
  await zap.connect(deployer).beefOut(vault.address, withdrawAmount, 5, "0x");

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

  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "token0", type: "bytes" },
          // @ts-ignore
          { name: "token1", type: "bytes" },
        ],
      },
    ],
    [
      {
        token0: data,
        token1: "0x",
      },
    ]
  );

  const balanceStableCoinBefore = await stableCoin.balanceOf(deployer.address);
  console.log("Amount", await vault.balanceOf(deployer.address));

  console.log("StableBefore", balanceStableCoinBefore);

  const balanceWethBefore = await weth.balanceOf(deployer.address);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 5, weth.address, encodedData);

  const balanceStableCoinAfter = await stableCoin.balanceOf(deployer.address);
  console.log("StableAfter", balanceStableCoinAfter);
  const balanceWethAfter = await weth.balanceOf(deployer.address);

  expect(balanceStableCoinAfter.sub(balanceStableCoinBefore)).gt(0);
  expect(balanceWethAfter).eq(balanceWethBefore);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
};
