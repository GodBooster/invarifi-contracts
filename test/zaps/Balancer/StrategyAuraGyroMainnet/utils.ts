import { ethers } from "hardhat";
import { expect } from "chai";
import {
  VaultV7,
  ZapOneInch,
  ERC20,
  IERC20,
  IERC20__factory,
  IWETH,
  StrategyAuraGyroMainnet,
} from "../../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const beefIn = async (
  data: string,
  stableCoin: ERC20,
  deployer: SignerWithAddress,
  zap: ZapOneInch,
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

  console.log(`Amount: ${ethers.utils.formatUnits(amount)}`);
  await stableCoin.connect(deployer).approve(zap.address, amount);

  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);

  await zap.connect(deployer).beefIn(vault.address, stableCoin.address, amount, 2, encodedData);

  console.log(`WETH: ${ethers.utils.formatUnits(await weth.balanceOf(zap.address))}`);
  // eslint-disable-next-line camelcase
  const token = await IERC20__factory.connect("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", deployer);
  console.log(`wstETH: ${ethers.utils.formatUnits(await token.balanceOf(zap.address))}`);
  expect(await weth.balanceOf(zap.address)).eq(0); // FIXME: weth balance is not 0 :(
  expect(await vault.balanceOf(deployer.address)).gt(0);
};

export const beefOut = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: ZapOneInch,
  weth: IWETH,
  tokenOut: IERC20
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  const tokenOutBefore = await tokenOut.balanceOf(deployer.address);
  const wethBefore = await weth.balanceOf(deployer.address);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOut(vault.address, withdrawAmount, 2, "0x");

  const tokenOutAfter = await tokenOut.balanceOf(deployer.address);
  const wethAfter = await weth.balanceOf(deployer.address);
  expect(tokenOutAfter.sub(tokenOutBefore)).gt(0);
  expect(wethAfter.sub(wethBefore)).gt(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await weth.balanceOf(zap.address)).eq(0);
  expect(await ethers.provider.getBalance(zap.address)).eq(0);

  // return tokenOut;
};

export const beefOutAndSwap = async (
  vault: VaultV7,
  deployer: SignerWithAddress,
  zap: ZapOneInch,
  stableCoin: ERC20,
  weth: IWETH,
  token0: string,
  token1: string,
  tokenOut: IERC20
) => {
  const withdrawAmount = await vault.balanceOf(deployer.address);

  await vault.connect(deployer).approve(zap.address, withdrawAmount);

  // address token;
  // bytes token0;
  // bytes token1;

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
        token0,
        token1,
      },
    ]
  );

  const balanceBefore = await stableCoin.balanceOf(deployer.address);
  const tokenOutBalanceBefore = await tokenOut.balanceOf(deployer.address);

  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).gt(0);

  await zap.beefOutAndSwap(vault.address, withdrawAmount, 2, ethers.constants.AddressZero, encodedDataToBeefOut);

  const balanceAfter = await stableCoin.balanceOf(deployer.address);
  const tokenOutBalanceAfter = await tokenOut.balanceOf(deployer.address);

  expect(balanceAfter.sub(balanceBefore)).gt(0);
  expect(tokenOutBalanceAfter.sub(tokenOutBalanceBefore)).eq(0);
  expect(await stableCoin.balanceOf(zap.address)).eq(0);
  expect(await tokenOut.balanceOf(zap.address)).eq(0);
  expect(await vault.balanceOf(deployer.address)).eq(0);
};
