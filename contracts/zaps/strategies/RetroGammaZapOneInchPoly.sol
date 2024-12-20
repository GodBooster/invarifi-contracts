// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/BaseZapOneInch.sol";
import "../../strategies/Gamma/StrategyRetroGamma.sol";
import "../structs/BeefInParams/WantTypeRetroGammaParams.sol";
import "../structs/BeefOutParams/WantTypeRetroOutParams.sol";

contract RetroGammaZapOneInchPoly is BaseZapOneInch {
    using SafeERC20 for IVault;
    using SafeERC20 for IERC20;

    constructor(
        address _oneInchRouter,
        address _WETH
    ) BaseZapOneInch(_oneInchRouter, _WETH) {}

    function _beefIn(
        IVault _vault,
        address want,
        address inputToken,
        uint256,
        uint8,
        bytes calldata data
    ) internal override returns (address[] memory tokens) {
        StrategyRetroGamma strategyRetro = StrategyRetroGamma(
            _vault.strategy()
        );

        WantTypeRetroGammaParams memory params = abi.decode(
            data,
            (WantTypeRetroGammaParams)
        );

        if (params.inputToken.length != 0) {
            _swapViaOneInch(inputToken, params.inputToken);
        }

        _approveTokenIfNeeded(
            strategyRetro.native(),
            strategyRetro.unirouter()
        );

        address lpToken0 = strategyRetro.lpToken0();
        address lpToken1 = strategyRetro.lpToken1();

        (uint toLp0, uint toLp1) = strategyRetro.quoteAddLiquidity(
            address(this)
        );

        bytes memory nativeToLp0Path = strategyRetro.nativeToLp0Path();
        bytes memory nativeToLp1Path = strategyRetro.nativeToLp1Path();

        if (nativeToLp0Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(
                strategyRetro.unirouter(),
                strategyRetro.nativeToLp0Path(),
                toLp0
            );
        }
        if (nativeToLp1Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(
                strategyRetro.unirouter(),
                strategyRetro.nativeToLp1Path(),
                toLp1
            );
        }

        // stack too deep fix
        address wantCopy = want;
        uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));

        (uint amount1Start, uint amount1End) = strategyRetro
            .gammaProxy()
            .getDepositAmount(wantCopy, lpToken0, lp0Bal);
        if (lp1Bal > amount1End) {
            lp1Bal = amount1End;
        } else if (lp1Bal < amount1Start) {
            (, lp0Bal) = strategyRetro.gammaProxy().getDepositAmount(
                wantCopy,
                lpToken1,
                lp1Bal
            );
        }

        uint[4] memory minIn;

        _approveTokenIfNeeded(lpToken0, wantCopy);
        _approveTokenIfNeeded(lpToken1, wantCopy);

        strategyRetro.gammaProxy().deposit(
            lp0Bal,
            lp1Bal,
            address(this),
            wantCopy,
            minIn
        );

        tokens = new address[](2);
        tokens[0] = lpToken0;
        tokens[1] = lpToken1;
    }

    function _beefOut(
        IVault _vault,
        address want,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata
    ) internal override returns (address[] memory tokens) {
        StrategyRetroGamma strategyRetro = StrategyRetroGamma(
            _vault.strategy()
        );

        tokens = _beefOutRetro(strategyRetro, _withdrawAmount, want);
    }

    function _beefOutAndSwap(
        IVault _vault,
        address want,
        address _desiredToken,
        uint256 _withdrawAmount,
        uint8,
        bytes calldata data
    ) internal override returns (address[] memory path) {
        StrategyRetroGamma strategyRetro = StrategyRetroGamma(
            _vault.strategy()
        );

        path = _beefOutRetro(strategyRetro, _withdrawAmount, want);

        WantTypeRetroOutParams memory params = abi.decode(
            data,
            (WantTypeRetroOutParams)
        );

        if (_desiredToken != path[0]) {
            _swapViaOneInch(path[0], params.inputToken0);
        }
        if (_desiredToken != path[1]) {
            _swapViaOneInch(path[1], params.inputToken1);
        }
    }

    function _beefOutRetro(
        StrategyRetroGamma strategy,
        uint256 _withdrawAmount,
        address want
    ) private returns (address[] memory tokens) {
        uint256[4] memory minAmounts;

        IHypervisor(want).withdraw(
            _withdrawAmount,
            address(this),
            address(this),
            minAmounts
        );

        tokens = new address[](2);
        tokens[0] = strategy.lpToken0();
        tokens[1] = strategy.lpToken1();
    }
}
