// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/LpHelperBase.sol";
import "../EarnPool.sol";
import "../base/Constants.sol";

contract EarnHelper is Constants {
    using SafeERC20 for IERC20;

    struct DepositAmountsOut {
        address tokenSwapTo;
        address tokenSwapFrom;
        bytes swapPath;
        uint256 amountFrom;
    }

    struct WithdrawAmountsOut {
        address tokenSwapTo;
        address tokenSwapFrom;
        bytes swapPath;
        uint256 amountFrom;
    }

    function estimateAmountsOutDeposit(
        address payable earn,
        uint256 stableAmount
    ) external view returns (DepositAmountsOut[][] memory amountsOut) {
        EarnPool earnPool = EarnPool(earn);

        EarnConfiguration earnConfiguration = EarnConfiguration(
            earnPool.earnConfiguration()
        );

        address stable = earnConfiguration.stableToken();

        VaultConfig[] memory poolConfigs = earnPool.getVaultConfigs();

        amountsOut = new DepositAmountsOut[][](poolConfigs.length);

        for (uint256 i; i < poolConfigs.length; i++) {
            uint256 amountToDeposit = (poolConfigs[i].poolPart * stableAmount) /
                PERCENTS_100;
            address depositHelper = earnConfiguration.lpHelpers(
                poolConfigs[i].vault
            );
            require(depositHelper != address(0), "EP: !depositHelper");

            (
                address[] memory tokensInLp,
                uint256[] memory amountsInLp
            ) = LpHelperBase(depositHelper).buildLpSwaps(
                    poolConfigs[i].vault,
                    amountToDeposit
                );

            amountsOut[i] = new DepositAmountsOut[](tokensInLp.length);

            for (uint256 j; j < tokensInLp.length; j++) {
                address token = tokensInLp[j];
                uint256 amount = amountsInLp[j];
                amountsOut[i][j] = DepositAmountsOut({
                    tokenSwapTo: token,
                    tokenSwapFrom: stable,
                    swapPath: earnConfiguration.swapPathes(stable, token),
                    amountFrom: amount
                });
            }
        }
    }

    /**
        @dev should be called using callStatic 
        and using storage override to set balance of vault token on this contract 
     */
    function estimateAmountsOutWithdraw(
        address payable earn,
        address user,
        uint256 withdrawCost
    ) external returns (WithdrawAmountsOut[][] memory amountsOut) {
        EarnPool earnPool = EarnPool(earn);
        EarnConfiguration earnConfiguration = EarnConfiguration(
            earnPool.earnConfiguration()
        );

        address stable = earnConfiguration.stableToken();

        (, , uint256 size, , ) = earnPool.positions(user);

        VaultConfig[] memory poolConfigs = earnPool.getVaultConfigs();

        uint256 partToWithdraw = (withdrawCost * PERCENTS_100) / size;

        amountsOut = new WithdrawAmountsOut[][](poolConfigs.length);

        address[] memory lpTokens;
        uint256[] memory lpTokenAmounts;

        for (uint256 i; i < poolConfigs.length; i++) {
            {
                address vault = poolConfigs[i].vault;
                uint256 depositedToVault = earnPool.vaultDeposited(user, vault);
                uint256 amountToWithdraw = (depositedToVault * partToWithdraw) /
                    PERCENTS_100;
                address depositHelper = earnConfiguration.lpHelpers(vault);
                require(depositHelper != address(0), "EPH: !depositHelper");
                IERC20(vault).safeTransfer(depositHelper, amountToWithdraw);

                (lpTokens, lpTokenAmounts) = LpHelperBase(depositHelper)
                    .withdrawWrapper(vault, amountToWithdraw);
            }

            amountsOut[i] = new WithdrawAmountsOut[](lpTokens.length);

            for (uint256 j; j < lpTokens.length; j++) {
                address token = lpTokens[j];
                uint256 amount = lpTokenAmounts[j];
                amountsOut[i][j] = WithdrawAmountsOut({
                    tokenSwapTo: stable,
                    tokenSwapFrom: token,
                    swapPath: earnConfiguration.swapPathes(token, stable),
                    amountFrom: amount
                });
            }
        }
    }
}
