// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/utils/math/Math.sol";
import "../zapInterfaces/IVault.sol";
import "../zapInterfaces/IWETH.sol";

import "hardhat/console.sol";

abstract contract BaseZapOneInch {
    using SafeERC20 for IERC20;
    using SafeERC20 for IVault;

    // needed addresses for zap
    address public immutable oneInchRouter;
    address public immutable WETH;
    uint256 public constant minimumAmount = 1000;

    event TokenReturned(address token, uint256 amount);
    event ZapIn(address vault, address tokenIn, uint256 amountIn);
    event ZapOut(address vault, address desiredToken, uint256 mooTokenIn);

    constructor(address _oneInchRouter, address _WETH) {
        // Safety checks to ensure WETH token address
        IWETH(_WETH).deposit{value: 0}();
        IWETH(_WETH).withdraw(0);
        WETH = _WETH;

        oneInchRouter = _oneInchRouter;
    }

    function beefInETH(
        address _vault,
        uint8 _type,
        bytes calldata data
    ) external payable {
        require(msg.value >= minimumAmount, "Zaps: Insignificant input amount");
        IWETH(WETH).deposit{value: msg.value}();

        (IVault vault, address want) = _getVaultWant(_vault);

        address[] memory tokens = _beefIn(
            vault,
            want,
            WETH,
            msg.value,
            _type,
            data
        );

        _approveTokenIfNeeded(want, _vault);
        vault.depositAll(msg.sender);

        _returnAsset(WETH);
        _returnAssets(tokens);

        emit ZapIn(_vault, WETH, msg.value);
    }

    function beefIn(
        address _vault,
        address _inputToken,
        uint256 _tokenInAmount,
        uint8 _type,
        bytes calldata data
    ) external returns (uint256 wantDeposited) {
        require(
            _tokenInAmount >= minimumAmount,
            "Zaps: Insignificant input amount"
        );
        IERC20(_inputToken).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenInAmount
        );

        (IVault vault, address want) = _getVaultWant(_vault);
        address[] memory tokens = _beefIn(
            vault,
            want,
            _inputToken,
            _tokenInAmount,
            _type,
            data
        );

        _approveTokenIfNeeded(want, _vault);

        wantDeposited = IERC20(want).balanceOf(address(this));

        vault.deposit(wantDeposited, msg.sender);

        _returnAsset(_inputToken);
        _returnAssets(tokens);

        emit ZapIn(_vault, _inputToken, _tokenInAmount);
    }

    function beefOut(
        address _vault,
        uint256 _withdrawAmount,
        uint8 _want,
        bytes calldata data
    ) external returns (address[] memory returnTokens) {
        (IVault vault, address want) = _getVaultWant(_vault);

        IERC20(_vault).safeTransferFrom(
            msg.sender,
            address(this),
            _withdrawAmount
        );
        vault.withdraw(_withdrawAmount, msg.sender);

        returnTokens = _beefOut(vault, want, _withdrawAmount, _want, data);

        _returnAssets(returnTokens);

        emit ZapOut(_vault, want, _withdrawAmount);
    }

    function beefOutBalances(
        address _vault,
        uint256 _withdrawAmount,
        uint8 _want,
        bytes calldata data
    )
        external
        returns (address[] memory returnTokens, uint256[] memory amounts)
    {
        (IVault vault, address want) = _getVaultWant(_vault);

        IERC20(_vault).safeTransferFrom(
            msg.sender,
            address(this),
            _withdrawAmount
        );
        vault.withdraw(_withdrawAmount, msg.sender);

        returnTokens = _beefOut(vault, want, _withdrawAmount, _want, data);
        amounts = _getReturnAssetBalances(returnTokens);

        _returnAssets(returnTokens);

        emit ZapOut(_vault, want, _withdrawAmount);
    }

    function beefOutAndSwap(
        address _vault,
        uint256 _withdrawAmount,
        uint8 _type,
        address _desiredToken,
        bytes calldata data
    ) external {
        (IVault vault, address want) = _getVaultWant(_vault);

        vault.safeTransferFrom(msg.sender, address(this), _withdrawAmount);
        vault.withdraw(_withdrawAmount, msg.sender); // get bpt

        address[] memory tokens = _beefOutAndSwap(
            vault,
            want,
            _desiredToken,
            _withdrawAmount,
            _type,
            data
        );

        console.log("returning");

        _returnAsset(_desiredToken);
        _returnAssets(tokens);

        emit ZapOut(_vault, _desiredToken, _withdrawAmount);
    }

    function _beefIn(
        IVault _vault,
        address want,
        address _inputToken,
        uint256 _tokenInAmount,
        uint8 _type,
        bytes calldata data
    ) internal virtual returns (address[] memory tokens);

    function _beefOut(
        IVault _vault,
        address want,
        uint256 _withdrawAmount,
        uint8 _type,
        bytes calldata data
    ) internal virtual returns (address[] memory tokens);

    function _beefOutAndSwap(
        IVault _vault,
        address want,
        address _inputToken,
        uint256 _withdrawAmount,
        uint8 _type,
        bytes calldata data
    ) internal virtual returns (address[] memory tokens);

    function _getVaultWant(
        address _vault
    ) internal pure returns (IVault vault, address pair) {
        vault = IVault(_vault);
        pair = vault.want();
    }

    function _swapViaOneInch(
        address _inputToken,
        bytes memory _callData
    ) internal {
        console.log(_inputToken);
        console.log(IERC20(_inputToken).balanceOf(address(this)));
        _approveTokenIfNeeded(_inputToken, address(oneInchRouter));
        (bool success, bytes memory retData) = oneInchRouter.call(_callData);
        console.log(success);
        console.log(IERC20(_inputToken).balanceOf(address(this)));

        propagateError(success, retData, "1inch");

        require(success == true, "calling 1inch got an error");
    }

    function _returnAssets(address[] memory _tokens) internal {
        for (uint256 i; i < _tokens.length; i++) {
            _returnAsset(_tokens[i]);
        }
    }

    function _returnAsset(address _token) internal {
        if (_token == address(0)) return;

        uint256 balance = IERC20(_token).balanceOf(address(this));

        if (balance > 0) {
            if (_token == WETH) {
                IWETH(WETH).withdraw(balance);
                (bool success, ) = msg.sender.call{value: balance}(
                    new bytes(0)
                );
                require(success, "Zap: ETH transfer failed");
                emit TokenReturned(_token, balance);
            } else {
                IERC20(_token).safeTransfer(msg.sender, balance);
                emit TokenReturned(_token, balance);
            }
        }
    }

    function _approveTokenIfNeeded(address _token, address _spender) internal {
        if (IERC20(_token).allowance(address(this), _spender) == 0) {
            IERC20(_token).safeApprove(_spender, type(uint).max);
        }
    }

    // Error reporting from our call to the aggrator contract when we try to swap.
    function propagateError(
        bool success,
        bytes memory data,
        string memory errorMessage
    ) public pure {
        // Forward error message from call/delegatecall
        if (!success) {
            if (data.length == 0) revert(errorMessage);
            assembly {
                revert(add(32, data), mload(data))
            }
        }
    }

    function _getReturnAssetBalances(
        address[] memory tokens
    ) private view returns (uint256[] memory balances) {
        balances = new uint256[](tokens.length);

        for (uint256 i; i < tokens.length; ++i) {
            balances[i] = IERC20(tokens[i]).balanceOf(address(this));
        }
    }

    receive() external payable {}
}
