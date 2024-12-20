import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import {
  DeploymentReturn,
  earnCommonAddresses,
  earnImpersonateContracts,
  infraDeployment,
  transferImpersonatedTokens,
  vaults,
  // eslint-disable-next-line node/no-missing-import
} from "./common/Infra.deployment";
// eslint-disable-next-line node/no-missing-import
import {
  automateGelato,
  deposit,
  depositETH,
  halfPrices,
  setFees,
  stableReceivedStopLoss,
  withdraw,
  // eslint-disable-next-line node/no-missing-import
} from "./common/earn.helpers";
// eslint-disable-next-line node/no-missing-import
import { approve, getAccount, parseTokenAmount } from "./common/common.helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ERC20, EarnPool, OneInchTest__factory } from "../../typechain-types";

export const testDeposit = async (
  params: DeploymentReturn,
  { from = params.deployer, amount, stopLossCost }: { from?: SignerWithAddress; amount: number; stopLossCost?: number }
) => {
  await approve(from, params.stable, params.earn, amount);

  await deposit(params, {
    amountTokenIn: amount,
    stopLossCost,
  });
};

describe("EarnPool", () => {
  it("deployment", async () => {
    // eslint-disable-next-line no-unused-vars
    const { usdt, aggregator } = await loadFixture(infraDeployment);
  });

  describe("deposit", async () => {
    it("should revert: when amount is <= reserved for automation", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      const { deployer, stable, earn, reservedForAutomation } = params;
      await transferImpersonatedTokens(params);

      await approve(deployer, stable, earn, 100);

      await deposit(
        params,
        {
          amountTokenIn: 100,
          stopLossCost: 1,
        },
        {
          revertMessage: "EP: !reserve",
        }
      );
    });

    it("should revert: when amount is 0", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      const { deployer, stable, earn, reservedForAutomation } = params;
      await transferImpersonatedTokens(params);

      await approve(deployer, stable, earn, 100);

      await deposit(
        params,
        {
          amountTokenIn: 0,
          stopLossCost: 0,
        },
        {
          revertMessage: "EP: !deposit",
        }
      );
    });

    it("should revert: when deposit helper is not set", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
          setLpHelpers: false,
        })
      );
      const { deployer, stable, earn } = params;
      await transferImpersonatedTokens(params);

      await approve(deployer, stable, earn, 200);

      const parsedParams = {
        amountTokenIn: await parseTokenAmount(stable, 200),
        stopLossCost: await parseTokenAmount(stable, 0),
        minAmountLpOut: parseUnits((0).toString()),
        tokenIn: getAccount(stable),
        oneInchSwapData: "0x",
        stopLossPercent: 0,
      };

      await expect(earn.deposit(parsedParams, [[0]])).to.revertedWith("EP: !depositHelper");
    });

    it("should revert: when minAmountOut is > actual get from swap", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      const { deployer, stable, earn } = params;
      await transferImpersonatedTokens(params);

      await approve(deployer, stable, earn, 100);

      await deposit(
        params,
        {
          amountTokenIn: 100,
          minAmountsOut: [[0.051]],
        },
        {
          revertMessage: "LHB: !minOut",
        }
      );
    });

    it("should revert: when pool is paused", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await params.earn.pause();

      await deposit(
        params,
        {
          amountTokenIn: 200,
        },
        {
          revertMessage: "Pausable: paused",
        }
      );
    });

    it("should revert: when deposit using ETH without swap data", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await depositETH(
        params,
        {
          amountTokenIn: 1,
          oneInchSwapData: "0x",
          stopLossCost: 0,
        },
        {
          revertMessage: "EP: !swapData",
        }
      );
    });

    it("when deposit fee is non 0", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 200);

      await setFees(params, { depositFee: 0.1 });

      await deposit(params, {
        amountTokenIn: 200,
        stopLossCost: 0,
      });
    });

    it("when deposit helper is set", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 200);

      await deposit(params, {
        amountTokenIn: 200,
        stopLossCost: 0,
      });
    });

    it("when deposit using ETH without stoploss", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockOneInch: true,
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await depositETH(params, {
        amountTokenIn: 1,
        stopLossCost: 0,
      });
    });

    it("when deposit using ETH with stoploss", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockOneInch: true,
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await depositETH(params, {
        amountTokenIn: 1,
        stopLossCost: 500,
      });
    });

    it("when stop loss is set and reserved amount for automation is 0", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 500);

      await deposit(params, {
        amountTokenIn: 500,
        stopLossCost: 100,
      });
    });

    it.skip("when 2 vaults are congigured", async () => {
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

      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 500);

      await deposit(params, {
        amountTokenIn: 500,
        // stopLossCost: 100,
      });
    });

    it.skip("when 3 vaults are congigured", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 25,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 50,
              vault: vaults.TestUSDCVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);
      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 500);

      await deposit(params, {
        amountTokenIn: 500,
        stopLossCost: 100,
      });
    });

    it.skip("when 4 vaults are congigured", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 25,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestUSDCVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestwstETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);
      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 500);

      await deposit(params, {
        amountTokenIn: 500,
        stopLossCost: 100,
      });
    });

    it.skip("when 2 vaults are configured and 2 deposits happened", async () => {
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

      const { deployer, stable, earn, reservedForAutomation } = params;

      await approve(deployer, stable, earn, 1000);

      await deposit(params, {
        amountTokenIn: 500,
        stopLossCost: 100,
      });

      await transferImpersonatedTokens(params);

      await deposit(params, {
        amountTokenIn: 500,
        stopLossCost: 100,
      });
    });
  });

  describe("withdraw", async () => {
    const getWithdrawNativeParams = async (
      { deployer, stable, weth, earn }: { earn: EarnPool; deployer: SignerWithAddress; stable: ERC20; weth: ERC20 },
      amount: number,
      unwrapNative = true
    ) => {
      return {
        withdrawalToken: weth.address,
        unwrapNative,
        oneInchSwapData: new OneInchTest__factory(deployer).interface.encodeFunctionData("swap", [
          stable.address,
          weth.address,
          await parseTokenAmount(stable, amount),
          earn.address,
        ]),
      };
    };

    it("should revert: when withdraw cost > original cost", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      const { deployer, stable, earn, reservedForAutomation } = params;
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 100 });

      await withdraw(
        params,
        {
          withdrawCost: 101,
        },
        {
          revertMessage: "EP: !withdrawCost",
        }
      );
    });

    it("should revert: when user doesnt have a position", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await withdraw(
        params,
        {
          withdrawCost: 100,
        },
        {
          revertMessage: "EP: !pos",
        }
      );
    });

    it("should revert: when minStableOut is > stableReceived", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 100 });

      await withdraw(
        params,
        {
          withdrawCost: 100,
          minStableOut: 1000,
        },
        {
          revertMessage: "EP: !stableReceived",
        }
      );
    });

    it("should revert: when minStableOut is > stableReceived", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 100 });

      await withdraw(
        params,
        {
          withdrawCost: 100,
          minStableOut: 1000,
        },
        {
          revertMessage: "EP: !stableReceived",
        }
      );
    });

    it("when withdraw fee is non 0", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
        })
      );
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200 });

      await setFees(params, { withdrawalFee: 0.1 });

      await withdraw(params, {
        withdrawCost: 100,
      });
    });

    it("when withdraw to ETH token without unwrap", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockOneInch: true,
          mockUniswap: true,
          usdtAddress: earnCommonAddresses.tokens.USDC,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 2000 });

      await withdraw(params, {
        withdrawCost: 1000,
        ...(await getWithdrawNativeParams(params, 1000)),
      });
    });

    it("when withdraw to ETH token without unwrap and return not swapped stable", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockOneInch: true,
          mockUniswap: true,
          usdtAddress: earnCommonAddresses.tokens.USDC,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 2000 });

      await withdraw(params, {
        withdrawCost: 1000,
        ...(await getWithdrawNativeParams(params, 900)),
      });
    });

    it("when user has a position opened without stopLoss and wants to close it partially with stop loss ", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200 });

      await withdraw(
        params,
        {
          withdrawCost: 50,
          stopLossCost: 25,
        },
        { revertMessage: "EP: !toReserve" }
      );
    });

    it("when user has a position opened and wants to close it fully", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 100 });

      await withdraw(params, {
        withdrawCost: 100,
      });
    });

    it("when user has a position opened and wants to close it partially", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 100 });

      await withdraw(params, {
        withdrawCost: 50,
      });
    });

    it("when user has a position opened with stopLoss reserved and wants to close it partially", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200, stopLossCost: 50 });

      await withdraw(params, {
        withdrawCost: 50,
        stopLossCost: 25,
      });
    });

    it("when user has a position opened without stopLoss and wants to close it partially with stop loss set", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200 });

      await withdraw(params, {
        withdrawCost: 150,
        stopLossCost: 25,
      });
    });

    it("when user has a position opened with stopLoss reserved and wants to close it fully", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 100,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200, stopLossCost: 50 });

      await withdraw(params, {
        withdrawCost: 100,
        stopLossCost: 0,
      });
    });

    it.skip("withdraw from the pool with a 2 vaults", async () => {
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

      await testDeposit(params, { amount: 200 });

      await withdraw(params, {
        withdrawCost: 100,
      });
    });

    it.skip("withdraw from the pool with a 3 vaults", async () => {
      const params = await loadFixture(
        infraDeployment.bind(this, {
          vaultConfigs: [
            {
              part: 50,
              vault: vaults.TestUSDTVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestWETHVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
            {
              part: 25,
              vault: vaults.TestUSDCVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );

      await transferImpersonatedTokens(params);

      await testDeposit(params, { amount: 200 });

      await withdraw(params, {
        withdrawCost: 100,
      });
    });
  });

  describe("stopLoss", async () => {
    it("should fail: !role gelato", async () => {
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

      const { deployer, earn, earnPoolChecker, priceFeeds, stable, aggregator } = params;

      await testDeposit(params, { amount: 250, stopLossCost: 100 });

      await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDC_USD], deployer);

      await automateGelato(
        earn,
        earnPoolChecker,
        deployer,
        stable,
        true,
        aggregator,
        deployer,
        parseUnits("150", await stable.decimals()),
        {
          revertedWith: "Gelatofied: Only gelato",
        }
      );
    });

    it("should fail: !role", async () => {
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

      const { deployer, earn, earnPoolChecker, priceFeeds, stable, aggregator } = params;

      await testDeposit(params, { amount: 250, stopLossCost: 100 });

      await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDC_USD], deployer);

      await automateGelato(
        earn,
        earnPoolChecker,
        deployer,
        stable,
        true,
        aggregator,
        deployer,
        parseUnits("150", await stable.decimals()),
        {
          revertedWith: "Only dedicated msg.sender",
          callOnUser: true,
        }
      );
    });
    it("should fail: (insufficient fee to pay gelato)", async () => {
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

      const { deployer, earn, earnPoolChecker, priceFeeds, stable, aggregator } = params;

      await testDeposit(params, { amount: 250, stopLossCost: 100 });

      await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDC_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(
        earn,
        earnPoolChecker,
        deployer,
        stable,
        true,
        aggregator,
        signer,
        parseUnits("150", await stable.decimals()),
        {
          revertedWith: "Automate.exec: OpsProxy.executeCall: EP: fee>reserved",
        }
      );
    });
    it("should not swap (cost > stopLoss)", async () => {
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

      const { deployer, earn, earnPoolChecker, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, false, aggregator, signer);
    });
    it("should not swap (cost > stopLoss) with x0.5 weth price", async () => {
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

      const { deployer, earn, earnPoolChecker, priceFeeds, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      await halfPrices([priceFeeds.USDC_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, false, aggregator, signer);
    });
    it("success case (USDC and WETH vaults)", async () => {
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

      const { deployer, earn, priceFeeds, earnPoolChecker, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDC_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, true, aggregator, signer);
    });
    it("success case (USDT AND WETH vaults)", async () => {
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

      const { deployer, earn, priceFeeds, earnPoolChecker, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      await halfPrices([priceFeeds.ETH_USD, priceFeeds.USDT_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, true, aggregator, signer);
    });
    it("success case (USDC AND USDT vaults)", async () => {
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
              vault: vaults.TestUSDCVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, earn, priceFeeds, earnPoolChecker, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      await halfPrices([priceFeeds.USDC_USD, priceFeeds.USDT_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, true, aggregator, signer);
    });
    it("success case (USDC AND USDT vaults) with fee 50 usdt", async () => {
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
              vault: vaults.TestUSDCVault,
              helper: "TEST_SINGLE_TOKEN_HELPER",
            },
          ],
          mockUniswap: true,
        })
      );
      await transferImpersonatedTokens(params);

      const { deployer, earn, priceFeeds, earnPoolChecker, stable, aggregator } = params;

      await testDeposit(params, { amount: 1500, stopLossCost: 800 });

      await halfPrices([priceFeeds.USDC_USD, priceFeeds.USDT_USD], deployer);

      const signer = await ethers.getSigner(earnImpersonateContracts.gelato);

      await automateGelato(earn, earnPoolChecker, deployer, stable, true, aggregator, signer, parseUnits("50", "6"));
    });
  });
});
