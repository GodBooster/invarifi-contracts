// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../../utils/UniswapV2Utils.sol";
import "./GelatoSwapper.sol";

contract GelatoSwapperUniV2 is GelatoSwapper {
    function _swap(
        address,
        uint256 amountStable,
        address receiver
    ) internal override returns (uint256) {
        address[] memory path = abi.decode(
            stableToWNativeSwapPath,
            (address[])
        );

        return UniswapV2Utils.swap(router, path, amountStable, receiver);
    }
}
