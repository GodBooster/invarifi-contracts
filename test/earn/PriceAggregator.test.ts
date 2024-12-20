import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import { infraDeployment } from "./common/Infra.deployment";
import { expect } from "chai";
// eslint-disable-next-line camelcase,node/no-missing-import
import { AggregatorV3Interface__factory, ERC20__factory } from "../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { amountToBase18 } from "./common/common.helpers";
// eslint-disable-next-line node/no-extraneous-import
import { parseUnits } from "@ethersproject/units";

describe("PriceAggregator tests", () => {
  // it("deployment", async () => {
  //   const { aggregator, ac } = await loadFixture(infraDeployment);
  // });

  describe("getPrice()", async () => {
    it("should fail: invalid aggregator", async () => {
      const { aggregator } = await loadFixture(infraDeployment);

      // WBTC
      const mockedTokenAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

      await expect(aggregator.getPrice(mockedTokenAddress)).revertedWith("PA: invalid aggregator");
    });
    it("should not fail", async () => {
      const { aggregator, twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const priceFeedEntity = {
        token: twapPriceFeeds[0].token,
        address: twapPriceFeeds[0].contract.address,
      };
      // eslint-disable-next-line camelcase
      const chainlinkAggregator = AggregatorV3Interface__factory.connect(priceFeedEntity.address, deployer);

      const [, answer] = await chainlinkAggregator.latestRoundData();
      const decimals = await chainlinkAggregator.decimals();

      const expected = await amountToBase18(decimals, answer);

      expect(await aggregator.getPrice(priceFeedEntity.token)).eq(expected);
    });
  });

  describe("getCostForToken()", async () => {
    it("should fail: invalid aggregator", async () => {
      const { aggregator } = await loadFixture(infraDeployment);

      // WBTC
      const mockedTokenAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

      await expect(aggregator.getCostForToken(mockedTokenAddress, 0)).to.revertedWith("PA: invalid aggregator");
    });

    it("should not fail", async () => {
      const { aggregator, twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const priceFeedEntity = {
        token: twapPriceFeeds[0].token,
        address: twapPriceFeeds[0].contract.address,
      };
      // eslint-disable-next-line camelcase
      const chainlinkAggregator = AggregatorV3Interface__factory.connect(priceFeedEntity.address, deployer);

      const amount = parseUnits("15");

      const [, answer] = await chainlinkAggregator.latestRoundData();
      const decimals = await chainlinkAggregator.decimals();

      const price = await amountToBase18(decimals, answer);

      // eslint-disable-next-line camelcase
      const token = await ERC20__factory.connect(priceFeedEntity.token, deployer);
      const convertedAmount = await amountToBase18(await token.decimals(), amount);

      expect(await aggregator.getCostForToken(priceFeedEntity.token, amount)).eq(
        price.mul(convertedAmount).div(parseUnits("1"))
      );
    });
  });
});
