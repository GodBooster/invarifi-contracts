// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {LpHelperUniV2Base} from "../../base/LpHelperUniV2Base.sol";
import "../StargateLpHelper.sol";

contract StargateUniV2LpHelper is StargateLpHelper, LpHelperUniV2Base {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;

    constructor(
        address _earnConfiguration,
        address _uniswapV2Router,
        address _ac
    ) StargateLpHelper(_earnConfiguration, _uniswapV2Router, _ac) {}

    function _swap(
        address _tokenFrom,
        address _tokenTo,
        uint256 _amountIn,
        address _receiver
    )
        internal
        virtual
        override(LpHelperUniV2Base, LpHelperBase)
        returns (uint256)
    {
        return
            LpHelperUniV2Base._swap(_tokenFrom, _tokenTo, _amountIn, _receiver);
    }
}
