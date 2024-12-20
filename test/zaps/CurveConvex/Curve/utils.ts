import {
  BalancerAuraZapOneInchETH,
  VaultV7,
  CurveConvexZapOneInchETH,
  ERC20,
  IERC20,
  IERC20__factory,
  IWETH,
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

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 0, encodedData);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
};

export const beefOut = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  tokenOut: ERC20
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOut(vault.address, withdrawAmount, 0, "0x");

  expect(await tokenOut.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: BalancerAuraZapOneInchETH,
  stableCoin: ERC20,
  data: string,
  tokenOut: ERC20
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const balanceBefore = await stableCoin.balanceOf(deployer.address);

  expect(await tokenOut.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  const encodedDataToBeefOut = ethers.utils.defaultAbiCoder.encode(
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

  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 0, ethers.constants.AddressZero, encodedDataToBeefOut);

  const balanceAfter = await stableCoin.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
};
