// eslint-disable-next-line node/no-missing-import
import {
  BalancerAuraZapOneInchArb,
  BalancerAuraZapOneInchETH,
  VaultV7,
  ERC20,
  IERC20,
  IWETH,
  RetroGammaZapOneInchPoly,
} from "../../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseUnits } from "ethers/lib/utils";
import { expect } from "chai";
import { ethers } from "hardhat";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchArb,
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

  const amount = parseUnits("1000", await stableCoin.decimals());

  await stableCoin.connect(deployer).approve(zap.address, amount);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);

  console.log({ deposited: (await vault.balanceOf(deployer.address)).toString() });

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 0, encodedData);

  console.log({ deposited: (await vault.balanceOf(deployer.address)).toString() });

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchArb,
  tokenOut: IERC20,
  tokenIndexRoute: number
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const encodedDataToBeefOut = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // // @ts-ignore
          // { name: "token", type: "address" },
          // @ts-ignore
          { name: "tokenOut", type: "address" },
          // @ts-ignore
          { name: "tokenIndexRoute", type: "uint256" },
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        tokenOut: tokenOut.address,
        tokenIndexRoute,
        inputToken: "0x",
      },
    ]
  );

  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOut(vault.address, withdrawAmount, 0, encodedDataToBeefOut);

  expect(await tokenOut.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);

  return tokenOut;
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  stableCoin: ERC20,
  tokenOut: IERC20,
  tokenIndexRoute: number,
  data: string
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  // eslint-disable-next-line camelcase

  const encodedDataToBeefOut = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // // @ts-ignore
          // { name: "token", type: "address" },
          // @ts-ignore
          { name: "tokenOut", type: "address" },
          // @ts-ignore
          { name: "tokenIndexRoute", type: "uint256" },
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        tokenOut: tokenOut.address,
        tokenIndexRoute,
        inputToken: data,
      },
    ]
  );

  const balanceBefore = await stableCoin.balanceOf(deployer.address);

  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  console.log({ stable: (await stableCoin.balanceOf(deployer.address)).toString() });

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 0, ethers.constants.AddressZero, encodedDataToBeefOut);
  console.log({ stable: (await stableCoin.balanceOf(deployer.address)).toString() });

  const balanceAfter = await stableCoin.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
