import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VaultV7, CommonZapOneInch, ERC20, IWETH } from "../../../typechain-types";
import { parseUnits } from "ethers/lib/utils";
import { expect } from "chai";
import { ethers } from "hardhat";

export const beefIn = async (
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  vault: VaultV7,
  weth: IWETH
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        // @ts-ignore
        components: [{ name: "inputToken", type: "bytes" }],
      },
    ],
    [
      {
        inputToken:
          "0x12aa3caf000000000000000000000000b63aae6c353636d66df13b89ba4425cfe13d10ba0000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff850000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000b63aae6c353636d66df13b89ba4425cfe13d10ba000000000000000000000000a2c05eea117c78fd0c79b2c3a9385c54cef8ecae000000000000000000000000000000000000000000000000000000003b9aca00000000000000000000000000000000000000000000000000000000001dcec33b0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010e0000000000000000000000000000000000000000000000000000000000f0512050a39b94b1dc8472faa08c36a3ef5b0a01c5bd100b2c639c533813f4aa9d7837caf62653d097ff8500449908fc8b0000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff850000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000000000657d8ad40000000000000000000000000000000000008b1ccac8",
      },
    ]
  );
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
  wstETH: ERC20,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  vault: VaultV7,
  weth: IWETH
) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          // @ts-ignore
          { name: "tokenIndex", type: "uint256" },
          // @ts-ignore
          { name: "token", type: "address" },
          // @ts-ignore
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        tokenIndex: 1,
        token: wstETH.address,
        inputToken: "0x",
      },
    ]
  );

  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const balanceBefore = await wstETH.balanceOf(deployer.address);

  expect(await vault.balanceOf(deployer.address)).gt(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  await zap.connect(deployer).beefOut(vault.address, withdrawAmount, 5, encodedData);

  const balanceAfter = await wstETH.balanceOf(deployer.address);
  console.log(balanceAfter.toString());

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await vault.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);

  console.log(balanceAfter.sub(balanceBefore).toString());
};

export const beefOutAndSwap = async (
  wstETH: ERC20,
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: CommonZapOneInch,
  stableCoin: ERC20,
  weth: IWETH
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  const encodedData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple",
        components: [
          { name: "tokenIndex", type: "uint256" },
          { name: "token", type: "address" },
          { name: "inputToken", type: "bytes" },
        ],
      },
    ],
    [
      {
        tokenIndex: 1,
        token: wstETH.address,
        inputToken:
          "0xbc80f1a80000000000000000000000007de698721cf8505c26e6da3d7e91e2c5687e8e9f000000000000000000000000000000000000000000000000000000003b937cae000000000000000000000000000000000000000000000000000000001dc88d34000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000018000000000000000000000002ab22ac86b25bd448a4d9dc041bd2384655299c48b1ccac8",
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
