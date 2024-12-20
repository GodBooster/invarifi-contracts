// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "../../interfaces/common/IUniswapRouterV3WithDeadline.sol";
import "../libraries/SwapBytesHelper.sol";
import "../../utils/DecimalsCorrection.sol";
import "../PriceAggregator.sol";
import "./UniswapV3Test.sol";
import "../EarnConfiguration.sol";

import "hardhat/console.sol";

contract OneInchTest {
    address public immutable uniswapRouter;
    address public immutable earnConfig;

    constructor(address _uniswapRouter, address config) {
        uniswapRouter = _uniswapRouter;
        earnConfig = config;
    }

    function swap(
        address from,
        address to,
        uint256 amount,
        address recepient
    ) external {
        IERC20(from).transferFrom(msg.sender, address(this), amount);

        IERC20(from).approve(uniswapRouter, amount);

        bytes memory path = EarnConfiguration(earnConfig).swapPathes(from, to);

        UniswapV3Tester(uniswapRouter).exactInput(
            UniswapV3Tester.ExactInputParams(
                path,
                recepient,
                block.timestamp,
                amount,
                0
            )
        );
    }
}
