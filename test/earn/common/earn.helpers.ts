// eslint-disable-next-line node/no-missing-import
import {
  earnCommonAddresses,
  earnImpersonateContracts,
  infraDeployment,
  VaultDeployedConfig,
} from "./Infra.deployment";
import { BigNumber, constants } from "ethers";
import {
  // eslint-disable-next-line camelcase
  LpHelperBase__factory,
  // eslint-disable-next-line camelcase
  AggregatorV3InterfaceTest__factory,
  EarnPool,
  // eslint-disable-next-line camelcase
  EarnPoolChecker__factory,
  ERC20,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  PriceAggregatorTester,
  EarnPoolChecker,
  IAutomate__factory,
  OneInchTest__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  Account,
  formatBase18,
  formatTokenAmount,
  getAccount,
  OptionalCommonParams,
  parseBase18,
  parseTokenAmount,
  // eslint-disable-next-line node/no-missing-import
} from "./common.helpers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { IERC20__factory } from "../../../typechain-types/factories/contracts/infra/FlatZap.sol";

type CommonParamsDeposit = Pick<
  Awaited<ReturnType<typeof infraDeployment>>,
  "earnPoolChecker" | "ac" | "ec" | "aggregator" | "deployer" | "earn" | "vaultConfigs"
>;

type CommonParamsWithdraw = Pick<
  Awaited<ReturnType<typeof infraDeployment>>,
  "earnPoolChecker" | "ac" | "ec" | "aggregator" | "deployer" | "earn" | "vaultConfigs"
>;

type CommonParamsSetFee = Pick<Awaited<ReturnType<typeof infraDeployment>>, "deployer" | "earn">;

type DepositParams = {
  amountTokenIn: number;
  stopLossCost?: number;
  minAmountLpOut?: number;
  tokenIn?: Account;
  oneInchSwapData?: string;
  minAmountsOut?: number[][];
};

type DepositETHParams = Omit<DepositParams, "tokenIn">;

type WithdrawParams = {
  withdrawCost: number;
  stopLossCost?: number;
  minStableOut?: number;
  withdrawalToken?: string;
  unwrapNative?: boolean;
  oneInchSwapData?: string;
};

export const depositETH = async (
  { earnPoolChecker, ec, aggregator, deployer, earn, vaultConfigs }: CommonParamsDeposit,
  { amountTokenIn, stopLossCost, minAmountLpOut, minAmountsOut, oneInchSwapData }: DepositETHParams,
  opt?: OptionalCommonParams
) => {
  const sender = opt?.from ?? deployer;
  // eslint-disable-next-line camelcase
  const stable = ERC20__factory.connect(await earn.stable(), sender);
  const weth = ERC20__factory.connect(await earn.wETH(), sender);

  const feeRecipient = await ec.feeRecipient();
  const fees = await earn.fees();

  const amountTokenInParsed = await parseTokenAmount(weth, amountTokenIn);

  const swapData = new OneInchTest__factory(deployer).interface.encodeFunctionData("swap", [
    weth.address,
    stable.address,
    amountTokenInParsed.toString(),
    earn.address,
  ]);

  const parsedParams = {
    stopLossCost: parseUnits((stopLossCost ?? 0).toString()),
    minAmountLpOut: parseUnits((minAmountLpOut ?? 0).toString()),
    oneInchSwapData: oneInchSwapData ?? swapData,
    stopLossPercent: "0",
  };

  const wethPriceUSD = formatBase18(await aggregator.getPrice(weth.address));
  const stablePriceUSD = formatBase18(await aggregator.getPrice(stable.address));

  const wethPriceStable = wethPriceUSD / stablePriceUSD;

  const amountTokenInStable = wethPriceStable * amountTokenIn;
  const amountTokenInStableParsed = await parseTokenAmount(stable, amountTokenInStable);

  minAmountsOut ??= vaultConfigs.map(_ => [0]);

  const toReserveForAutomation = await ec.toReserveForAutomation();
  const userPosBefore = await earn.positions(sender.address);

  const expectedFee = amountTokenInStableParsed.mul(fees.depositFee).div(parseUnits("100"));

  // amount excluded fee
  let expectedAmountIn = amountTokenInStableParsed.sub(expectedFee);

  if (parsedParams.stopLossCost.eq(constants.Zero) && !userPosBefore.reservedForAutomation.eq(0)) {
    expectedAmountIn = expectedAmountIn.add(userPosBefore.reservedForAutomation);
  }

  if (!parsedParams.stopLossCost.eq(constants.Zero) && userPosBefore.reservedForAutomation.eq(0)) {
    expectedAmountIn = expectedAmountIn.sub(toReserveForAutomation);
  }

  const parts = await Promise.all(
    vaultConfigs.map(async v => {
      const amountIn = await formatTokenAmount(stable, expectedAmountIn);
      const amountToDepositStable = (v.part * amountIn) / 100;
      const price = formatBase18(await aggregator.getPrice(v.token ?? ""));

      const cost = amountToDepositStable / price;
      return {
        amountToDepositStable,
        amountToDepositStableParsed: await parseTokenAmount(stable, amountToDepositStable),
        expectedAmount: cost,
        price: price.toString(),
        vault: v.vault,
        token: v.token,
      };
    })
  );

  const minAmountsOutParsed = await Promise.all(
    minAmountsOut.map(async (v, i) => {
      const config = vaultConfigs[i];
      const part = parts[i];
      // eslint-disable-next-line camelcase
      const vHelper = LpHelperBase__factory.connect(await ec.lpHelpers(config.vault.address), sender);
      const [addresses] = await vHelper.buildLpSwaps(config.vault.address, part.amountToDepositStableParsed);

      const parsedAmounts = await Promise.all(
        addresses.map(async (token, iToken) => parseTokenAmount(token, v[iToken]))
      );

      return parsedAmounts;
    })
  );

  if (opt?.revertMessage) {
    await expect(
      earn.connect(sender).depositETH(parsedParams, minAmountsOutParsed, { value: amountTokenInParsed })
    ).revertedWith(opt?.revertMessage);
    return;
  }

  const getDeposited = async () =>
    await Promise.all(
      parts.map(v =>
        earn.vaultDeposited(sender.address, v.vault.address).then(a => formatTokenAmount(v.token ?? "", a))
      )
    );

  const [, posCostBefore] = await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, sender.address);

  const depositedBefore = await getDeposited();

  const feesBefore = await stable.balanceOf(feeRecipient);
  await earn.connect(sender).depositETH(parsedParams, minAmountsOutParsed, { value: amountTokenInParsed });
  const feesAfter = await stable.balanceOf(feeRecipient);

  const depositedAfter = await getDeposited();

  const userPosAfter = await earn.positions(sender.address);
  const [, posCostAfter] = await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, sender.address);

  parts.forEach((v, i) => {
    expect(depositedAfter[i] - v.expectedAmount).approximately(depositedBefore[i], 0.0001);
  });

  if (!userPosAfter.stopLossCost.eq(constants.Zero)) {
    expect(userPosAfter.reservedForAutomation).eq(toReserveForAutomation);
    expect(userPosAfter.automationTaskId).not.eq(constants.HashZero);
  }

  expect(feesBefore.add(expectedFee)).eq(feesAfter);

  expect(await formatTokenAmount(stable, userPosAfter.size.sub(userPosBefore.size))).approximately(
    formatBase18(posCostAfter.sub(posCostBefore)),
    0.001
  );
  expect(userPosAfter.size).eq(expectedAmountIn.add(userPosBefore.size));
  expect(await ethers.provider.getBalance(earn.address)).eq(0);
  expect(await weth.balanceOf(earn.address)).eq(0);
};

export const deposit = async (
  { earnPoolChecker, ec, aggregator, deployer, earn, vaultConfigs }: CommonParamsDeposit,
  { amountTokenIn, stopLossCost, minAmountLpOut, minAmountsOut, oneInchSwapData, tokenIn }: DepositParams,
  opt?: OptionalCommonParams
) => {
  const sender = opt?.from ?? deployer;
  // eslint-disable-next-line camelcase
  const stable = ERC20__factory.connect(await earn.stable(), sender);

  const feeRecipient = await ec.feeRecipient();
  const fees = await earn.fees();

  const parsedParams = {
    amountTokenIn: await parseTokenAmount(stable, amountTokenIn),
    stopLossCost: parseUnits((stopLossCost ?? 0).toString()),
    minAmountLpOut: parseUnits((minAmountLpOut ?? 0).toString()),
    tokenIn: getAccount(tokenIn ?? stable),
    oneInchSwapData: oneInchSwapData ?? "0x",
    stopLossPercent: "0",
  };

  minAmountsOut ??= vaultConfigs.map(_ => [0]);

  const toReserveForAutomation = await ec.toReserveForAutomation();
  const userPosBefore = await earn.positions(sender.address);

  const expectedFee = parsedParams.amountTokenIn.mul(fees.depositFee).div(parseUnits("100"));

  // amount excluded fee
  let expectedAmountIn = parsedParams.amountTokenIn.sub(expectedFee);

  if (parsedParams.stopLossCost.eq(constants.Zero) && !userPosBefore.reservedForAutomation.eq(0)) {
    expectedAmountIn = expectedAmountIn.add(userPosBefore.reservedForAutomation);
  }

  if (!parsedParams.stopLossCost.eq(constants.Zero) && userPosBefore.reservedForAutomation.eq(0)) {
    expectedAmountIn = expectedAmountIn.sub(toReserveForAutomation);
  }

  const parts = await Promise.all(
    vaultConfigs.map(async v => {
      const amountIn = await formatTokenAmount(parsedParams.tokenIn, expectedAmountIn);
      const amountToDepositStable = (v.part * amountIn) / 100;
      const price = formatBase18(await aggregator.getPrice(v.token ?? ""));

      const cost = amountToDepositStable / price;
      return {
        amountToDepositStable,
        amountToDepositStableParsed: await parseTokenAmount(stable, amountToDepositStable),
        expectedAmount: cost,
        price: price.toString(),
        vault: v.vault,
        token: v.token,
      };
    })
  );

  const minAmountsOutParsed = await Promise.all(
    minAmountsOut.map(async (v, i) => {
      const config = vaultConfigs[i];
      const part = parts[i];
      // eslint-disable-next-line camelcase
      const vHelper = LpHelperBase__factory.connect(await ec.lpHelpers(config.vault.address), sender);
      const [addresses] = await vHelper.buildLpSwaps(config.vault.address, part.amountToDepositStableParsed);

      const parsedAmounts = await Promise.all(
        addresses.map(async (token, iToken) => parseTokenAmount(token, v[iToken]))
      );

      return parsedAmounts;
    })
  );

  if (opt?.revertMessage) {
    await expect(earn.connect(sender).deposit(parsedParams, minAmountsOutParsed)).revertedWith(opt?.revertMessage);
    return;
  }

  const getDeposited = async () =>
    await Promise.all(
      parts.map(v =>
        earn.vaultDeposited(sender.address, v.vault.address).then(a => formatTokenAmount(v.token ?? "", a))
      )
    );

  const [, posCostBefore] = await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, sender.address);

  const depositedBefore = await getDeposited();

  const feesBefore = await stable.balanceOf(feeRecipient);
  await earn.connect(sender).deposit(parsedParams, minAmountsOutParsed);
  const feesAfter = await stable.balanceOf(feeRecipient);

  const depositedAfter = await getDeposited();

  const userPosAfter = await earn.positions(sender.address);
  const [, posCostAfter] = await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, sender.address);

  parts.forEach((v, i) => {
    expect(depositedAfter[i] - v.expectedAmount).approximately(depositedBefore[i], 0.0001);
  });

  if (!userPosAfter.stopLossCost.eq(constants.Zero)) {
    expect(userPosAfter.reservedForAutomation).eq(toReserveForAutomation);
    expect(userPosAfter.automationTaskId).not.eq(constants.HashZero);
  }

  expect(feesBefore.add(expectedFee)).eq(feesAfter);

  expect(await formatTokenAmount(stable, userPosAfter.size.sub(userPosBefore.size))).approximately(
    formatBase18(posCostAfter.sub(posCostBefore)),
    0.001
  );
  expect(userPosAfter.size).eq(expectedAmountIn.add(userPosBefore.size));
};

export const setFees = async (
  { earn, deployer }: CommonParamsSetFee,
  { depositFee = 0, withdrawalFee = 0 }: { depositFee?: number; withdrawalFee?: number },
  opt?: OptionalCommonParams
) => {
  const sender = opt?.from ?? deployer;
  const stable = ERC20__factory.connect(await earn.stable(), sender);

  const feesParsed = {
    depositFee: parseBase18(depositFee),
    withdrawalFee: parseBase18(withdrawalFee),
  };
  if (opt?.revertMessage) {
    await expect(earn.connect(sender).setFees(feesParsed)).revertedWith(opt?.revertMessage);
    return;
  }

  await expect(earn.connect(sender).setFees(feesParsed)).not.reverted;

  const newFees = await earn.fees();

  expect(newFees.depositFee).eq(feesParsed.depositFee);
  expect(newFees.withdrawalFee).eq(feesParsed.withdrawalFee);
};

export const withdraw = async (
  { earnPoolChecker, ec, aggregator, deployer, earn, vaultConfigs }: CommonParamsWithdraw,
  { stopLossCost, withdrawCost, minStableOut, oneInchSwapData, unwrapNative = false, withdrawalToken }: WithdrawParams,
  opt?: OptionalCommonParams
) => {
  const sender = opt?.from ?? deployer;
  // eslint-disable-next-line camelcase
  const stable = ERC20__factory.connect(await earn.stable(), sender);
  const weth = ERC20__factory.connect(await earn.wETH(), sender);

  withdrawalToken ??= stable.address;

  const wt = ERC20__factory.connect(withdrawalToken, sender);

  const wtPrice = formatBase18(await aggregator.getPrice(wt.address));
  const stablePrice = formatBase18(await aggregator.getPrice(stable.address));

  const getWtBalance = async () => {
    if (unwrapNative) {
      return +formatUnits(await ethers.provider.getBalance(sender.address));
    } else {
      return await formatTokenAmount(wt, await wt.balanceOf(sender.address));
    }
  };

  const fees = await earn.fees();

  const parsedParams = {
    withdrawCost: await parseTokenAmount(stable, withdrawCost),
    stopLossCost: parseUnits((stopLossCost ?? 0).toString()),
    minStableOut: parseUnits((minStableOut ?? 0).toString()),
    oneInchSwapData: oneInchSwapData ?? "0x",
    withdrawalToken,
    unwrapNative,
  } satisfies EarnPool.WithdrawParamsStruct;

  if (opt?.revertMessage) {
    await expect(earn.connect(sender).withdraw(parsedParams)).revertedWith(opt?.revertMessage);
    return;
  }

  const toReserveForAutomation = await ec.toReserveForAutomation();
  const toReserveForAutomationFormatted = await formatTokenAmount(stable, toReserveForAutomation);
  const userPosBefore = await earn.positions(sender.address);

  const parts = await Promise.all(
    vaultConfigs.map(async v => {
      const withdrawalCost = await formatTokenAmount(stable, parsedParams.withdrawCost);
      const posCost = await formatTokenAmount(stable, userPosBefore.size);

      const partToWithdraw = (withdrawalCost * 100) / posCost;
      const depositedToVault = await earn
        .vaultDeposited(sender.address, v.vault.address)
        .then(d => formatTokenAmount(v.token ?? "", d));

      const price = formatBase18(await aggregator.getPrice(v.token ?? ""));

      const amountToWithdraw = (depositedToVault * partToWithdraw) / 100;

      const cost = price * amountToWithdraw;

      return {
        cost,
        partToWithdraw,
        depositedToVault,
        expectedAmount: amountToWithdraw,
        price: price,
        vault: v.vault,
        token: v.token,
      };
    })
  );

  const getDeposited = async () =>
    await Promise.all(
      parts.map(v =>
        earn.vaultDeposited(sender.address, v.vault.address).then(a => formatTokenAmount(v.token ?? "", a))
      )
    );

  const depositedBefore = await getDeposited();
  const feeRecipient = await ec.feeRecipient();

  const balanceTokenBefore = await formatTokenAmount(stable, await stable.balanceOf(sender.address));

  const wtBalanceBefore = await getWtBalance();

  const feesBefore = await stable.balanceOf(feeRecipient);
  const stableBefore = await stable.balanceOf(sender.address);
  await earn.connect(sender).withdraw(parsedParams);
  const stableAfter = await stable.balanceOf(sender.address);
  const feesAfter = await stable.balanceOf(feeRecipient);
  const wtBalanceAfter = await getWtBalance();

  const wtWithdrawalCost = ((wtBalanceAfter - wtBalanceBefore) * wtPrice) / stablePrice;
  const unswappedStable = await formatTokenAmount(stable, (stableAfter - stableBefore) / stablePrice);

  const balanceTokenAfter = await formatTokenAmount(stable, await stable.balanceOf(sender.address));

  const depositedAfter = await getDeposited();

  const userPosAfter = await earn.positions(sender.address);
  const [, posCostAfter] = await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, sender.address);

  parts.forEach((v, i) => {
    expect(depositedAfter[i] + v.expectedAmount).approximately(depositedBefore[i], 0.0001);
  });

  let expectedReceivedToken = parts.reduce((prev, cur) => prev + cur.cost, 0);
  const expectedReceivedTokenParsed = await parseTokenAmount(stable, expectedReceivedToken);
  const expectedFee = expectedReceivedTokenParsed.mul(fees.withdrawalFee).div(parseUnits("100"));
  const expectedFeeFormatted = await formatTokenAmount(stable, expectedFee);

  expectedReceivedToken -= expectedFeeFormatted;

  if (userPosAfter.size.eq(0)) {
    expectedReceivedToken += await formatTokenAmount(stable, userPosBefore.reservedForAutomation);
    expect(userPosAfter.automationTaskId).eq(constants.HashZero);
    expect(userPosAfter.reservedForAutomation).eq(0);
  } else if (userPosBefore.stopLossCost.eq(0) && !userPosAfter.stopLossCost.eq(0)) {
    expectedReceivedToken -= toReserveForAutomationFormatted;
    expect(userPosBefore.automationTaskId).eq(constants.HashZero);
    expect(userPosAfter.reservedForAutomation).eq(toReserveForAutomation);
  }

  expect(feesBefore.add(expectedFee)).eq(feesAfter);
  expect(userPosBefore.size.sub(parsedParams.withdrawCost)).eq(userPosAfter.size);
  expect(userPosAfter.stopLossCost).eq(parsedParams.stopLossCost);
  if (!unwrapNative) {
    expect(balanceTokenAfter - balanceTokenBefore).approximately(expectedReceivedToken, 0.001);
  } else {
    expect(wtWithdrawalCost + unswappedStable).approximately(expectedReceivedToken, 10);
    expect(await ethers.provider.getBalance(earn.address)).eq(0);
  }
};

export const halfPrices = async (priceFeeds: { address: string }[], deployer: SignerWithAddress) => {
  for (const p of Object.values(priceFeeds)) {
    // eslint-disable-next-line camelcase
    const feed = await AggregatorV3InterfaceTest__factory.connect(p.address, deployer);

    const [, price] = await feed.latestRoundData();

    await feed.setPrice(price.div(2));
  }
};

export const stableReceivedStopLoss = async (
  earn: EarnPool,
  vaultConfigs: VaultDeployedConfig[],
  stable: ERC20,
  deployer: SignerWithAddress,
  aggregator: PriceAggregatorTester,
  earnPoolChecker: EarnPoolChecker
) => {
  const expectedStableWithoutReserved = await withdrawExpectedAmount(vaultConfigs, stable, earn, deployer, aggregator);

  const [, stableWithoutReservedReceived] = await earnPoolChecker.callStatic.stableReceivedStopLoss(
    earn.address,
    deployer.address
  );
  // expect(await formatTokenAmount(stable, stableReceived)).eq(
  //   +formatUnits(price.mul(expectedStableWithoutReserved + (await formatTokenAmount(stable, reserved))))
  // );
  expect(await formatTokenAmount(stable, stableWithoutReservedReceived)).eq(expectedStableWithoutReserved);

  return await formatTokenAmount(stable, stableWithoutReservedReceived);
};

const withdrawExpectedAmount = async (
  vaultConfigs: VaultDeployedConfig[],
  stable: ERC20,
  earn: EarnPool,
  user: SignerWithAddress,
  aggregator: PriceAggregatorTester
) => {
  const parts = await Promise.all(
    vaultConfigs.map(async v => {
      const [, , size] = await earn.positions(user.address);
      const withdrawalCost = await formatTokenAmount(stable, size);
      const posCost = await formatTokenAmount(stable, size);

      const partToWithdraw = (withdrawalCost * 100) / posCost;
      const depositedToVault = await earn
        .vaultDeposited(user.address, v.vault.address)
        .then(d => formatTokenAmount(v.token ?? "", d));

      const price = formatBase18(await aggregator.getPrice(v.token ?? ""));

      const amountToWithdraw = (depositedToVault * partToWithdraw) / 100;
      const usdtPrice = v.token === stable.address ? 1 : formatBase18(await aggregator.getPrice(stable.address));
      return price * amountToWithdraw * usdtPrice;
    })
  );

  return parts.reduce((prev, cur) => prev + cur, 0);
};

export const automateGelato = async (
  earn: EarnPool,
  earnPoolChecker: EarnPoolChecker,
  deployer: SignerWithAddress,
  stable: ERC20,
  canExecExpected: boolean,
  aggregator: PriceAggregatorTester,
  signer: SignerWithAddress,
  fee: BigNumber = BigNumber.from(0),
  opts?: {
    revertedWith?: string;
    callOnUser?: boolean;
  }
) => {
  // eslint-disable-next-line camelcase
  const gelato = IAutomate__factory.connect(earnCommonAddresses.GELATO_AUTOMATE, deployer);

  const { canExec, execPayload } = await earnPoolChecker.callStatic.checkUpkeep(earn.address, deployer.address);
  const weth = IERC20__factory.connect(await earn.wETH(), deployer);

  expect(canExec).eq(canExecExpected);
  expect(execPayload.length).gt(canExecExpected ? -1 : 0);

  if (!canExec) {
    return;
  }

  const stableBalanceBefore = await formatTokenAmount(stable, await stable.balanceOf(deployer.address));
  const [, reserved] = await earn.positions(deployer.address);

  const [, , stableReceivedExpected] = await earnPoolChecker.callStatic.stableReceivedStopLoss(
    earn.address,
    deployer.address
  );
  const expectedStableOut = stableReceivedExpected;

  const [taskId] = await gelato.getTaskIdsByUser(earn.address);
  const taskCreator = earn.address;

  const encodedDataFunc = earnPoolChecker.interface.encodeFunctionData("checkUpkeep", [earn.address, deployer.address]);
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [earnPoolChecker.address, encodedDataFunc]
  );
  const moduleData = {
    modules: [0, 2],
    args: [encodedData, "0x"],
  };

  const gelatoTaskId = await gelato.getTaskId(
    taskCreator,
    earn.address,
    execPayload.slice(0, 10),
    moduleData,
    weth.address
  );

  const feeFormatted = await formatTokenAmount(stable, fee);
  const reservedFormatted = await formatTokenAmount(stable, reserved);
  const ethPrice = formatBase18(await aggregator.getPrice(weth.address));
  const usdtPrice = formatBase18(await aggregator.getPrice(stable.address));
  const reservedInEth = reservedFormatted / ethPrice;
  const feeInEth = feeFormatted / ethPrice;

  const expectedWEthReceived = reservedInEth - feeInEth;

  const txFee = parseBase18(feeInEth);

  await impersonateAccount(signer.address);

  expect(gelatoTaskId).eq(taskId);

  if (opts?.revertedWith) {
    if (opts.callOnUser) {
      await expect(earn.connect(signer).closeByStopLoss({ minStableOut: 0, user: signer.address })).to.revertedWith(
        opts.revertedWith
      );
    } else {
      await expect(
        gelato.connect(signer).exec(taskCreator, earn.address, execPayload, moduleData, txFee, weth.address, true)
      ).to.revertedWith(opts.revertedWith);
    }
    return;
  }

  const balanceWethBefore = formatBase18(await weth.balanceOf(deployer.address));

  await gelato.connect(signer).exec(taskCreator, earn.address, execPayload, moduleData, txFee, weth.address, true);

  const balanceWethAfter = formatBase18(await weth.balanceOf(deployer.address));

  const stableBalanceAfter = await formatTokenAmount(stable, await stable.balanceOf(deployer.address));

  expect(balanceWethAfter - balanceWethBefore).approximately(expectedWEthReceived, 0.0001);
  expect(stableBalanceAfter - stableBalanceBefore).approximately(
    await formatTokenAmount(stable, expectedStableOut),
    0.0001
  );
};
