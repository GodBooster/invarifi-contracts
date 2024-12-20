import {
  BalancerAuraZapOneInchETH,
  VaultV7,
  ERC20,
  IERC20,
  IWETH,
  VelodromeZapOneInchOp,
} from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseUnits } from "ethers/lib/utils";
import { expect } from "chai";
import { ethers } from "hardhat";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: VelodromeZapOneInchOp,
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
  tokenOut1: ERC20,
  tokenOut2: ERC20,
  deployer: SignerWithAddress,
  zap: VelodromeZapOneInchOp,
  vault: VaultV7,
  weth: IWETH,
  isNative?: boolean
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const balanceBeforeToken1 = await tokenOut1.balanceOf(deployer.address);
  const balanceBeforeToken2 = await tokenOut2.balanceOf(deployer.address);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefOut(vault.address, withdrawAmount, 0, "0x");

  const balanceAfterToken1 = await tokenOut1.balanceOf(deployer.address);
  const balanceAfterToken2 = await tokenOut2.balanceOf(deployer.address);

  expect(balanceAfterToken1.sub(balanceBeforeToken1)).gt(0);
  expect(balanceAfterToken2.sub(balanceBeforeToken2)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  stableCoin: ERC20,
  tokenOut1: IERC20,
  tokenOut2: IERC20,
  data1: string,
  data2: string
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  // eslint-disable-next-line camelcase

  const encodedDataToBeefOut = ethers.utils.defaultAbiCoder.encode(
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
        token0: data1,
        token1: data2,
      },
    ]
  );

  const balanceBefore = await stableCoin.balanceOf(deployer.address);
  const balanceBeforeToken0 = await tokenOut1.balanceOf(deployer.address);
  const balanceBeforeToken1 = await tokenOut2.balanceOf(deployer.address);

  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut1.balanceOf(zap.address)).eq(0);
  expect(await tokenOut2.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  console.log({ stable: (await stableCoin.balanceOf(deployer.address)).toString() });

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 0, ethers.constants.AddressZero, encodedDataToBeefOut);
  console.log({ stable: (await stableCoin.balanceOf(deployer.address)).toString() });

  const balanceAfter = await stableCoin.balanceOf(deployer.address);
  const balanceAfterToken0 = await tokenOut1.balanceOf(deployer.address);
  const balanceAfterToken1 = await tokenOut2.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(balanceAfterToken0.sub(balanceBeforeToken0)).eq(0);
  expect(balanceAfterToken1.sub(balanceBeforeToken1)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut1.balanceOf(zap.address)).eq(0);
  expect(await tokenOut2.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
