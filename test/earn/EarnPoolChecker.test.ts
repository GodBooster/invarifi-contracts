import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  infraDeployment,
  transferImpersonatedTokens,
  vaults,
  // eslint-disable-next-line node/no-missing-import
} from "./common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import { testDeposit } from "./Earn.test";
// eslint-disable-next-line node/no-missing-import
import { halfPrices, stableReceivedStopLoss } from "./common/earn.helpers";
import { expect } from "chai";
// eslint-disable-next-line camelcase,node/no-missing-import
import { EarnPoolCheckerTester__factory, EarnPoolChecker__factory } from "../../typechain-types";

describe("EarnPoolChecker", () => {
  it("should return zeroes: original cost is 0", async () => {
    const params = await loadFixture(
      infraDeployment.bind(this, {
        vaultConfigs: [
          {
            part: 50,
            vault: vaults.TestUSDCVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
          {
            part: 50,
            vault: vaults.TestWETHVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
        ],
        mockUniswap: true,
      })
    );
    await transferImpersonatedTokens(params);

    const { deployer, earn } = params;

    const earnPoolChecker = await new EarnPoolCheckerTester__factory(deployer).deploy();

    (await earnPoolChecker.callStatic.stableReceivedStopLoss(earn.address, deployer.address)).forEach(answer =>
      expect(answer.toString()).eq("0")
    );
  });

  it("USDC and WETH vaults with usdc and weth x0.5 price", async () => {
    const params = await loadFixture(
      infraDeployment.bind(this, {
        vaultConfigs: [
          {
            part: 50,
            vault: vaults.TestUSDCVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
          {
            part: 50,
            vault: vaults.TestWETHVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
        ],
        mockUniswap: true,
      })
    );
    await transferImpersonatedTokens(params);

    const { deployer, earn, priceFeeds, vaultConfigs, stable, aggregator, earnPoolChecker } = params;

    await testDeposit(params, { amount: 1500, stopLossCost: 800 });

    await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDC_USD], deployer);

    await stableReceivedStopLoss(earn, vaultConfigs, stable, deployer, aggregator, earnPoolChecker);
  });

  it("USDT and WETH vaults with weth x0.5 price", async () => {
    const params = await loadFixture(
      infraDeployment.bind(this, {
        vaultConfigs: [
          {
            part: 50,
            vault: vaults.TestUSDTVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
          {
            part: 50,
            vault: vaults.TestWETHVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
        ],
        mockUniswap: true,
      })
    );
    await transferImpersonatedTokens(params);

    const { deployer, earn, priceFeeds, vaultConfigs, stable, aggregator, earnPoolChecker } = params;

    await testDeposit(params, { amount: 1500, stopLossCost: 800 });

    await halfPrices([priceFeeds.ETH_USD], deployer);

    await stableReceivedStopLoss(earn, vaultConfigs, stable, deployer, aggregator, earnPoolChecker);
  });

  it("USDT and WETH vaults with usdt and weth x0.5 price", async () => {
    const params = await loadFixture(
      infraDeployment.bind(this, {
        vaultConfigs: [
          {
            part: 50,
            vault: vaults.TestUSDTVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
          {
            part: 50,
            vault: vaults.TestWETHVault,
            helper: "TEST_SINGLE_TOKEN_HELPER",
          },
        ],
        mockUniswap: true,
      })
    );
    await transferImpersonatedTokens(params);

    const { deployer, earn, priceFeeds, vaultConfigs, stable, aggregator, earnPoolChecker } = params;

    await testDeposit(params, { amount: 1500, stopLossCost: 800 });

    await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDT_USD], deployer);

    await stableReceivedStopLoss(earn, vaultConfigs, stable, deployer, aggregator, earnPoolChecker);
  });
});
