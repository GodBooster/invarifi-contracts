// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../strategies/Curve/StrategyConvex.sol";
import "../../interfaces/gmx/IVault.sol";
import "../base/LpHelperBase.sol";
import "../../strategies/Stargate/StrategyStargateAccessableInitializable.sol";
import "../../interfaces/common/IWrappedNative.sol";
import "../../interfaces/stargate/IStargateRouter.sol";
import "../../interfaces/stargate/IStargateRouterETH.sol";

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

contract StargateLpHelper is LpHelperBase {
    using SafeERC20 for IERC20;
    using ERC20Helpers for IERC20;

    constructor(
        address _poolConfiguration,
        address _uniswapV3Router,
        address _ac
    ) LpHelperBase(_poolConfiguration, _uniswapV3Router, _ac) {}

    function _buildLpSwaps(
        address,
        address strategy,
        address,
        uint256 amount
    )
        public
        view
        virtual
        override
        returns (address[] memory swapTokens, uint256[] memory swapTokenAmount)
    {
        swapTokens = new address[](1);
        swapTokenAmount = new uint256[](1);

        swapTokens[0] = StrategyStargateAccessableInitializable(
            payable(strategy)
        ).depositToken();

        swapTokenAmount[0] = amount;
    }

    function _buildLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount,
        uint256[] memory minAmountsOut
    ) internal override returns (uint256) {
        StrategyStargateAccessableInitializable strat = StrategyStargateAccessableInitializable(
                payable(strategy)
            );

        address native = strat.native();

        (address[] memory swapTokens, ) = _buildLpSwaps(
            vault,
            strategy,
            lp,
            amount
        );

        uint bal = _swapFromStable(swapTokens[0], amount, minAmountsOut[0]);

        if (swapTokens[0] != native) {
            address router = strat.stargateRouter();

            IERC20(swapTokens[0]).approveIfNeeded(router);

            IStargateRouter(router).addLiquidity(
                strat.routerPoolId(),
                bal,
                address(this)
            );
        } else {
            IWrappedNative(native).withdraw(bal);

            uint256 toDeposit = address(this).balance;

            IStargateRouterETH(strat.stargateRouter()).addLiquidityETH{
                value: toDeposit
            }();
        }

        return IERC20(lp).balanceOf(address(this));
    }

    function _destroyLp(
        address vault,
        address strategy,
        address lp,
        uint256 amount
    )
        internal
        override
        returns (address[] memory lpTokens, uint256[] memory lpTokenAmounts)
    {
        StrategyStargateAccessableInitializable strat = StrategyStargateAccessableInitializable(
                strategy
            );

        lpTokens = new address[](1);
        lpTokenAmounts = new uint256[](1);
        lpTokens[0] = strat.depositToken();

        address native = strat.native();
        address router = strat.stargateRouter();

        uint16 routerPooldId;

        if (lpTokens[0] == native) {
            routerPooldId = IStargateRouterETH(router).poolId();
            router = IStargateRouterETH(router).stargateRouter();
        } else {
            routerPooldId = uint16(strat.routerPoolId());
        }

        IStargateRouter(router).instantRedeemLocal(
            routerPooldId,
            amount,
            address(this)
        );

        if (lpTokens[0] == native) {
            uint256 bal = address(this).balance;

            IWrappedNative(native).deposit{value: bal}();
        }

        lpTokenAmounts[0] = IERC20(lpTokens[0]).balanceOf(address(this));
    }

    receive() external payable {}
}
