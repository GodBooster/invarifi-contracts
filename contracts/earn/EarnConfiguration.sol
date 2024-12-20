// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../utils/access/AccessControlAbstract.sol";
import "./base/Constants.sol";

contract EarnConfiguration is AccessControlAbstract, Constants {
    address public stableToken;
    address public priceAggregator;
    uint256 public slippagePercents;
    uint256 public toReserveForAutomation;
    address public feeRecipient;

    mapping(address => mapping(address => bytes)) public swapPathes;
    mapping(address => address) public lpHelpers;

    address public gelatoSwapper;

    uint256[50] private _gap;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _ac,
        address _stableToken,
        address _priceAggregator,
        uint256 _toReserveForAutomation,
        address _feeRecipient,
        address _gelatoSwapper
    ) external initializer {
        __AccessAccessControlAbstract_init(_ac);
        feeRecipient = _feeRecipient;
        toReserveForAutomation = _toReserveForAutomation;

        stableToken = _stableToken;
        priceAggregator = _priceAggregator;
        slippagePercents = 10 * 10 ** 18;

        gelatoSwapper = _gelatoSwapper;
    }

    function setSlippage(uint256 newSlippage) external onlyEarnManager {
        require(newSlippage <= PERCENTS_100, "!newSlippage");
        slippagePercents = newSlippage;
    }

    function setToReserveForAutomation(uint256 newValue) external onlyOwner {
        toReserveForAutomation = newValue;
    }

    function setSwapper(address _swapper) external onlyOwner {
        gelatoSwapper = _swapper;
    }

    function setLpHelper(
        address vault,
        address helper
    ) external onlyEarnManager {
        lpHelpers[vault] = helper;
    }

    function setSwapPath(
        address tokenFrom,
        address tokenTo,
        bytes calldata path
    ) external onlyOwner {
        swapPathes[tokenFrom][tokenTo] = path;
    }
}
