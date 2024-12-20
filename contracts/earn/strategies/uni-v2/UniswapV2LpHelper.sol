// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {LpHelperBase} from "../../base/LpHelperBase.sol";
import {LpHelperUniV2Base} from "../../base/LpHelperUniV2Base.sol";
import {UniswapLpHelper} from "../UniswapLpHelper.sol";

contract UniswapV2LpHelper is LpHelperUniV2Base, UniswapLpHelper {
    constructor(
        address _earnConfiguration,
        address _uniswapV2Router,
        address _ac
    ) UniswapLpHelper(_earnConfiguration, _uniswapV2Router, _ac) {}

    function _swap(
        address _tokenFrom,
        address _tokenTo,
        uint256 _amountIn,
        address _receiver
    )
        internal
        virtual
        override(LpHelperUniV2Base, LpHelperBase)
        returns (uint256 amountOut)
    {
        amountOut = LpHelperUniV2Base._swap(
            _tokenFrom,
            _tokenTo,
            _amountIn,
            _receiver
        );
    }
}
