import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import { DeployedTwapFeed, earnCommonAddresses, infraDeployment, uniV3Pools } from "./common/Infra.deployment";
// eslint-disable-next-line camelcase,node/no-missing-import
import {
  UniV3TwapOracle,
  // eslint-disable-next-line camelcase
  UniV3TwapOracle__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { formatUnits } from "ethers/lib/utils";

const getUniOracle = async (
  token: string,
  twapPriceFeeds: DeployedTwapFeed[],
  deployer: SignerWithAddress
): Promise<UniV3TwapOracle> => {
  const twapOracle = twapPriceFeeds.find(t => t.token === token);

  // eslint-disable-next-line camelcase
  return UniV3TwapOracle__factory.connect(
    twapOracle?.contract?.address ?? twapPriceFeeds[0].contract.address,
    deployer
  );
};

describe("UniV3TwapOracle tests", () => {
  it("deployment", async () => {
    const { twapPriceFeeds, deployer, priceFeeds } = await loadFixture(infraDeployment);

    const uniOracle = await getUniOracle(earnCommonAddresses.tokens.WETH, twapPriceFeeds, deployer);

    expect(await uniOracle.DIVIDER()).eq(ethers.utils.parseUnits("1"));
    expect(await uniOracle.pool()).eq(uniV3Pools.USDT_ETH.address);
    expect(await uniOracle.token()).eq(earnCommonAddresses.tokens.WETH);
    expect(await uniOracle.tokenUsdFeed()).eq(priceFeeds.USDT_USD.address);
  });

  // it.only("tokenUsdPrice()", async () => {
  //   const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);
  //
  //   const uniOracle = await getUniOracle(earnCommonAddresses.tokens.WETH, twapPriceFeeds, deployer);
  //
  //   // eslint-disable-next-line camelcase
  //   const aggregator = AggregatorV3Interface__factory.connect(chainLinkPriceFeeds.USDT_USD.address, deployer);
  //
  //   const [, expected] = await aggregator.latestRoundData();
  //
  //   expect(parseUnits(await uniOracle.tokenUsdPrice())).eq(parseUnits(expected.toString()));
  // });

  describe("getPriceTwap()", async () => {
    it("USDT_ETH pool with WETH token (decimals - 18)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.WETH, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.USDT_ETH.address, 3600);

      console.log(formatUnits(priceTwap));
    });

    it("LDO_USDT pool with LDO token (decimals - 18)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.LDO, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.LDO_USDT.address, 3600);

      console.log(formatUnits(priceTwap));
    });

    it("USDC_USDT pool with USDC token (decimals - 6)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.USDC, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.USDC_USDT.address, 3600);

      console.log(formatUnits(priceTwap));
    });

    it("USDT_DVF pool with DVF token (decimals - 18)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.DVF, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.USDT_DVF.address, 3600);

      console.log(formatUnits(priceTwap));
    });

    it("USDC_USDT pool with USDT token (decimals - 6)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.USDT, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.USDC_USDT.address, 3600);

      console.log(formatUnits(priceTwap));
    });

    it("wstETH_ETH pool with wstETH token (decimals - 18)", async () => {
      const { twapPriceFeeds, deployer } = await loadFixture(infraDeployment);

      const uniOracle = await getUniOracle(earnCommonAddresses.tokens.wstETH, twapPriceFeeds, deployer);

      const priceTwap = await uniOracle.getPriceTwap(uniV3Pools.wstETH_ETH.address, 3600);

      console.log(formatUnits(priceTwap));
    });
  });
});
