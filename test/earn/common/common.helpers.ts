import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ERC20, ERC20__factory } from "../../../typechain-types";
import { ethers } from "hardhat";

export type OptionalCommonParams = {
  from?: SignerWithAddress;
  revertMessage?: string;
};

export type Account = SignerWithAddress | string;
export type AccountOrContract = Account | Contract;

export const getAccount = (account: AccountOrContract) => {
  return (account as SignerWithAddress).address ?? (account as Contract).address ?? (account as string);
};

export const parseTokenAmount = async (token: AccountOrContract, amountN: number) => {
  const _token = ERC20__factory.connect(getAccount(token), ethers.provider);
  return await tokenAmountFromBase18(_token, parseUnits(amountN.toString()));
};

export const formatTokenAmount = async (token: AccountOrContract, amount: BigNumberish) => {
  const _token = ERC20__factory.connect(getAccount(token), ethers.provider);
  amount = BigNumber.from(amount);
  const decimals = await _token.decimals();
  return +formatUnits(amount, decimals);
};

export const formatBase18 = (amount: BigNumberish) => {
  return +formatUnits(amount);
};

export const parseBase18 = (amount: number) => {
  return parseUnits(amount.toString());
};

export const approve = async (
  from: SignerWithAddress,
  token: AccountOrContract,
  to: AccountOrContract,
  amountN: number
) => {
  const _token = ERC20__factory.connect(getAccount(token), ethers.provider);
  to = getAccount(to);
  const amount = await parseTokenAmount(_token, amountN);
  await expect(_token.connect(from).approve(to, amount)).not.reverted;
};

export const approveBase18 = async (from: SignerWithAddress, token: ERC20, to: AccountOrContract, amountN: number) => {
  to = getAccount(to);
  const amount = await tokenAmountToBase18(token, parseUnits(amountN.toString()));
  await expect(token.connect(from).approve(to, amount)).not.reverted;
};

export const amountToBase18 = async (decimals: BigNumberish, amount: BigNumberish) => {
  amount = BigNumber.from(amount);
  return amount.mul(parseUnits("1")).div(parseUnits("1", decimals));
};

export const amountFromBase18 = async (decimals: BigNumberish, amount: BigNumberish) => {
  amount = BigNumber.from(amount);
  return amount.mul(parseUnits("1", decimals)).div(parseUnits("1"));
};

export const tokenAmountToBase18 = async (token: ERC20, amount: BigNumberish) => {
  const decimals = await token.decimals();
  return amountToBase18(decimals, amount);
};

export const tokenAmountFromBase18 = async (token: ERC20, amount: BigNumberish) => {
  const decimals = await token.decimals();
  return amountFromBase18(decimals, amount);
};

export const balanceOfBase18 = async (token: ERC20, of: AccountOrContract) => {
  if (token.address === ethers.constants.AddressZero) return ethers.constants.Zero;
  of = getAccount(of);
  const balance = await token.balanceOf(of);
  return tokenAmountToBase18(token, balance);
};
