// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.0 <0.8.0; // TickMath requires old version

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";

import "../libraries/DecimalsCorrectionLibrary.sol";

import "hardhat/console.sol";

interface IERC20Extended {
    function symbol() external view returns (string memory);

    function decimals() external view returns (uint256);
}

contract UniV3TwapOracle is AggregatorV3Interface {
    using DecimalsCorrectionLibrary for uint256;

    address public immutable pool;
    address public immutable tokenUsdFeed;
    address public immutable token;

    uint256 public constant DIVIDER = 10 ** 18;

    constructor(address _pool, address _token, address _usdFeed) {
        pool = _pool;
        tokenUsdFeed = _usdFeed;
        token = _token;
    }

    function getPriceTwap(
        address uniswapV3Pool,
        uint32 twapInterval
    ) public view returns (uint256) {
        uint160 sqrtPriceX96;
        address token0 = IUniswapV3Pool(uniswapV3Pool).token0();
        address token1 = IUniswapV3Pool(uniswapV3Pool).token1();
        if (twapInterval == 0) {
            (sqrtPriceX96, , , , , , ) = IUniswapV3Pool(uniswapV3Pool).slot0();
        } else {
            uint32[] memory secondsAgos = new uint32[](2);
            secondsAgos[0] = twapInterval; // from (before)
            secondsAgos[1] = 0; // to (now)

            (int56[] memory tickCumulatives, ) = IUniswapV3Pool(uniswapV3Pool)
                .observe(secondsAgos);

            // tick(imprecise as it's an integer) to price
            sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
                int24(
                    (tickCumulatives[1] - tickCumulatives[0]) /
                        int32(twapInterval)
                )
            );
        }

        uint256 price = (((10 ** IERC20Extended(token0).decimals()) *
            uint256(getPriceX96FromSqrtPriceX96(sqrtPriceX96))) >> 96);

        uint256 convertedPrice = price.convertToBase18(
            IERC20Extended(token1).decimals()
        );

        if (token == token1) {
            convertedPrice = 1e36 / convertedPrice;
        }

        return (uint256(tokenUsdPrice()) * convertedPrice) / DIVIDER;
    }

    function tokenUsdPrice() public view returns (uint256) {
        uint8 decimals = AggregatorV3Interface(tokenUsdFeed).decimals();

        (, int ethUsdPrice, , , ) = AggregatorV3Interface(tokenUsdFeed)
            .latestRoundData();

        return uint256(ethUsdPrice).convertToBase18(decimals);
    }

    function getPriceX96FromSqrtPriceX96(
        uint160 sqrtPriceX96
    ) public pure returns (uint256 priceX96) {
        return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
    }

    function decimals() external view override returns (uint8) {
        return 18;
    }

    function description() external view override returns (string memory) {}

    function version() external view override returns (uint256) {
        return 1;
    }

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.
    function getRoundData(
        uint80 _roundId
    )
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        revert("not implemented");
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, int256(getPriceTwap(pool, 3600)), 0, 0, 0);
    }
}
