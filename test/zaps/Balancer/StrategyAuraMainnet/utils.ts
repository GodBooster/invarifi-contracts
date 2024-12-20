import { ethers } from "hardhat";
import { expect } from "chai";
// eslint-disable-next-line camelcase,node/no-missing-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  BalancerAuraZapOneInchETH,
  VaultV7,
  ZapOneInch,
  ERC20,
  IERC20,
  // eslint-disable-next-line camelcase
  IERC20__factory,
  IWETH,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
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

  const amount = "100000000000000000000";

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
  zap: BalancerAuraZapOneInchETH,
  tokenOut: IERC20,
  tokenIndexRoute: number,
  _type: number
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  // eslint-disable-next-line camelcase
  // const tokenOut = IERC20__factory.connect("0xac3E018457B222d93114458476f3E3416Abbe38F", deployer);

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

  await zap.beefOut(vault.address, withdrawAmount, _type, encodedDataToBeefOut);

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
  _type: number,
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

  await zap.beefOutAndSwap(vault.address, withdrawAmount, _type, ethers.constants.AddressZero, encodedDataToBeefOut);

  const balanceAfter = await stableCoin.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
