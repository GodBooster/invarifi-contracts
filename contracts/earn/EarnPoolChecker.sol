// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./EarnConfiguration.sol";
import "./EarnPool.sol";
import "./base/Constants.sol";

import "hardhat/console.sol";

contract EarnPoolChecker is Initializable, Constants {
    uint256[50] private __gap;

    constructor() {
        _disableInitializers();
    }

    function initialize() external initializer {}

    function stableReceivedStopLoss(
        address payable pool,
        address user
    ) public returns (uint256, uint256, uint256, uint256) {
        EarnPool earnPool = EarnPool(pool);

        try earnPool.getPositionCost(user) {} catch Error(string memory data) {
            (
                uint256 stableReceivedUsd,
                uint256 stableWithoutReservedUsd,
                uint256 stableWithoutReserved,
                uint256 stopLoss
            ) = abi.decode(bytes(data), (uint256, uint256, uint256, uint256));

            return (
                stableReceivedUsd,
                stableWithoutReservedUsd,
                stableWithoutReserved,
                stopLoss
            );
        }

        return (0, 0, 0, 0);
    }

    function getWithdrawAmountOut(
        address payable pool,
        address user,
        uint256 withdrawCost,
        uint256 stopLossCost
    ) public returns (uint256) {
        EarnPool earnPool = EarnPool(pool);

        try
            earnPool.getPositionCost(user, withdrawCost, stopLossCost)
        {} catch Error(string memory data) {
            uint256 stableReceived = abi.decode(bytes(data), (uint256));

            return (stableReceived);
        }

        return (0);
    }

    function checkUpkeep(
        address payable earn,
        address user
    ) external returns (bool canExec, bytes memory execPayload) {
        (
            ,
            uint256 stableWithoutReservedUsd,
            uint256 stableWithoutReserved,

        ) = stableReceivedStopLoss(earn, user);

        EarnPool earnPool = EarnPool(earn);
        EarnConfiguration earnConfig = EarnConfiguration(
            earnPool.earnConfiguration()
        );

        uint256 slippage = earnConfig.slippagePercents();

        if (slippage == 0) {
            slippage = 5 * 10 ** 18;
        }

        uint256 stopLoss = earnPool.userStopLossCost(user);

        if (stableWithoutReservedUsd <= stopLoss) {
            canExec = true;

            execPayload = abi.encodeCall(
                earnPool.closeByStopLoss,
                (
                    EarnPool.CloseParams({
                        user: user,
                        minStableOut: stableWithoutReserved -
                            ((stableWithoutReserved * slippage) / PERCENTS_100)
                    })
                )
            );
        } else {
            canExec = false;
            execPayload = abi.encodePacked("0x");
        }
    }
}
