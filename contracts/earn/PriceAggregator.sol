// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../utils/access/AccessControlAbstract.sol";
import "../utils/DecimalsCorrection.sol";
import "../interfaces/common/IERC20Extended.sol";

import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

contract PriceAggregator is AccessControlAbstract {
    mapping(address => address) public dataFeeds;

    uint256[50] private _gap;

    function initialize(address _ac) external initializer {
        __AccessAccessControlAbstract_init(_ac);
    }

    function setDataFeedForToken(
        address _token,
        address _dataFeed
    ) external onlyOwner {
        dataFeeds[_token] = _dataFeed;
    }

    function getCostForToken(
        address _token,
        uint256 _amount
    ) external view returns (uint256) {
        uint256 _price = getPrice(_token);

        uint256 tokenDecimals = IERC20Extended(_token).decimals();

        _amount = DecimalsCorrection.convertToBase18(_amount, tokenDecimals);

        return (_price * _amount) / 10 ** 18;
    }

    function getPrice(address _token) public view returns (uint256) {
        address aggregator = dataFeeds[_token];

        require(aggregator != address(0), "PA: invalid aggregator");

        uint8 decimals = AggregatorV3Interface(aggregator).decimals();

        (, int256 answer, , , ) = AggregatorV3Interface(aggregator)
            .latestRoundData();

        return DecimalsCorrection.convertToBase18(uint256(answer), decimals);
    }
}
