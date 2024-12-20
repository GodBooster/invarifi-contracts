// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "../../interfaces/common/IUniswapRouterV3WithDeadline.sol";
import "../libraries/SwapBytesHelper.sol";
import "../../utils/DecimalsCorrection.sol";
import "../PriceAggregator.sol";
import "hardhat/console.sol";

contract UniswapV3Tester {
    using DecimalsCorrection for uint256;
    using SwapBytesHelper for bytes;
    using SafeERC20 for IERC20;

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    PriceAggregator private immutable priceAggregator;
    address private immutable stable;

    constructor(address _priceAggregator, address _stable) {
        priceAggregator = PriceAggregator(_priceAggregator);
        stable = _stable;
    }

    function exactInput(
        ExactInputParams calldata params
    ) external payable returns (uint256 amountOut) {
        address from;
        address to;

        uint ADDR_SIZE = 20;
        uint FEE_SIZE = 3;

        uint pathLength = params.path.countAddresses();

        require(pathLength >= 2, "MQ: invalid-path");

        from = params.path.toAddress(0);

        to = params.path.toAddress(
            ADDR_SIZE * (pathLength - 1) + FEE_SIZE * (pathLength - 1)
        );

        IERC20(from).safeTransferFrom(
            msg.sender,
            address(this),
            params.amountIn
        );

        // buy token
        if (from == stable) {
            uint256 fromDecimal = IERC20Extended(from).decimals();
            uint256 tokenDecimal = IERC20Extended(to).decimals();

            uint256 price = priceAggregator.getPrice(to);

            uint256 amount = (params.amountIn.convertToBase18(fromDecimal) *
                1e18) / price;

            amount = amount.convertFromBase18(tokenDecimal);

            IERC20(to).safeTransfer(params.recipient, amount);

            return amount;
        }
        // sell token
        else {
            uint256 tokenDecimal = IERC20Extended(to).decimals();
            uint256 tokenFromDecimal = IERC20Extended(from).decimals();

            uint256 price = priceAggregator.getPrice(from);

            uint256 amount = ((price *
                params.amountIn.convertToBase18(tokenFromDecimal)) / 10 ** 18)
                .convertFromBase18(tokenDecimal);

            IERC20(to).safeTransfer(params.recipient, amount);
            return amount;
        }
    }

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut) {}

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactOutputSingleParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutputSingle(
        ExactOutputSingleParams calldata params
    ) external payable returns (uint256 amountIn) {}

    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another along the specified path (reversed)
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactOutputParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutput(
        ExactOutputParams calldata params
    ) external payable returns (uint256 amountIn) {}
}
