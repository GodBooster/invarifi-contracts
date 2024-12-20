// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

import "../libraries/DecimalsCorrectionLibrary.sol";

import "../../utils/UniswapV3Utils.sol";
import "../../vaults/VaultV7.sol";
import "../PriceAggregator.sol";
import "../EarnConfiguration.sol";
import "../libraries/ERC20Helpers.sol";
import "../../utils/access/AccessControlNotUpgradeableAbstract.sol";

import "hardhat/console.sol";

abstract contract LpHelperBase is AccessControlNotUpgradeableAbstract {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;
    using DecimalsCorrectionLibrary for uint256;

    address public immutable earnConfiguration;
    address public immutable uniswapV3Router;

    constructor(
        address _earnConfiguration,
        address _uniswapV3Router,
        address _ac
    ) AccessControlNotUpgradeableAbstract(_ac) {
        earnConfiguration = _earnConfiguration;
        uniswapV3Router = _uniswapV3Router;
    }

    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
            return;
        }
        IERC20(token).safeTransfer(to, amount);
    }

    function depositLpWrapper(
        address vault,
        uint256 amountStable,
        uint256[] memory minAmountsOut
    ) external returns (address lpToken, uint256 lpTokenAmount) {
        lpToken = address(VaultV7(vault).want());

        lpTokenAmount = _buildLp(
            vault,
            address(VaultV7(vault).strategy()),
            lpToken,
            amountStable,
            minAmountsOut
        );
    }

    function withdrawWrapper(
        address vault,
        uint256 amountShares
    )
        external
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        address lp = address(VaultV7(vault).want());

        VaultV7(vault).withdraw(amountShares);

        (lpTokens, lpTokenAmounts) = _destroyLp(
            vault,
            address(VaultV7(vault).strategy()),
            lp,
            IERC20(lp).balanceOf(address(this))
        );
    }

    function deposit(
        address vault,
        uint256 amountStable,
        uint256[] calldata minAmountsOut
    ) external returns (uint256 deposited) {
        IStrategyV7 strategy = VaultV7(vault).strategy();
        address lp = address(VaultV7(vault).want());

        uint256 lpBuilded = _buildLp(
            vault,
            address(strategy),
            lp,
            amountStable,
            minAmountsOut
        );

        IERC20(lp).approveIfNeeded(vault);

        VaultV7(vault).deposit(lpBuilded);
        deposited = VaultV7(vault).balanceOf(address(this));

        IERC20(vault).safeTransfer(msg.sender, deposited);
    }

    function withdraw(
        address vault,
        uint256 amountShares
    ) external returns (uint256 stableReceived) {
        IStrategyV7 strategy = VaultV7(vault).strategy();
        address lp = address(VaultV7(vault).want());

        VaultV7(vault).withdraw(amountShares);

        (
            address[] memory lpTokens,
            uint256[] memory lpTokenAmounts
        ) = _destroyLp(
                vault,
                address(strategy),
                lp,
                IERC20(lp).balanceOf(address(this))
            );

        stableReceived = _swapAllToStable(lpTokens, lpTokenAmounts, msg.sender);
    }

    function stable() public view returns (address) {
        return EarnConfiguration(earnConfiguration).stableToken();
    }

    function buildLpSwaps(
        address vault,
        uint256 amountStable
    ) public view returns (address[] memory, uint256[] memory) {
        return
            _buildLpSwaps(
                vault,
                address(VaultV7(vault).strategy()),
                address(VaultV7(vault).want()),
                amountStable
            );
    }

    function _buildLpSwaps(
        address vault,
        address strategy,
        address lp,
        uint256 amount
    ) public view virtual returns (address[] memory, uint256[] memory);

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal virtual returns (uint256);

    function _destroyLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount
    )
        internal
        virtual
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts);

    function _swapFromStable(
        address _token,
        uint256 _amount,
        uint256 minAmountOut
    ) internal returns (uint256 amountOut) {
        address _stable = stable();
        if (_token == _stable) return _amount;
        amountOut = _swap(_stable, _token, _amount, address(this));
        require(amountOut >= minAmountOut, "LHB: !minOut");
    }

    function _swapAllToStable(
        address[] memory lpTokens,
        uint256[] memory lpTokenAmounts,
        address receiver
    ) private returns (uint256 stableReceived) {
        address _stable = stable();
        for (uint256 i; i < lpTokens.length; i++) {
            if (lpTokens[i] == _stable) {
                IERC20(_stable).safeTransfer(receiver, lpTokenAmounts[i]);
                stableReceived += lpTokenAmounts[i];
                continue;
            }

            if (lpTokenAmounts[i] == 0) {
                continue;
            }

            stableReceived += _swap(
                lpTokens[i],
                _stable,
                lpTokenAmounts[i],
                receiver
            );
        }
    }

    function _swap(
        address _tokenFrom,
        address _tokenTo,
        uint256 _amountIn,
        address _receiver
    ) internal virtual returns (uint256 amountOut) {
        bytes memory swapPath = EarnConfiguration(earnConfiguration).swapPathes(
            _tokenFrom,
            _tokenTo
        );

        IERC20(_tokenFrom).approveIfNeeded(uniswapV3Router);

        amountOut = UniswapV3Utils.swap(
            uniswapV3Router,
            swapPath,
            _amountIn,
            _receiver
        );
    }
}
