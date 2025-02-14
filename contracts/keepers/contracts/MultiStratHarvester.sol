// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStrategy {
    function harvest(address _to) external;
}

interface IERC20 {
    function balanceOf(address _user) external view returns (uint256);
}

contract MultiStratHarvester {

    struct Config {
        uint256 lowerWaitForExec;
        uint256 upperWaitForExec;
        uint256 gasPriceLimit;
        uint256 lowerTvlLimit;
        uint256 upperTvlLimit;
    }

    Config public config;

    address[] public problemStrats;

    address public treasury;
    address public owner;
    address public weth;

    event Harvest(address[] indexed strats, uint256 time);

    constructor(
        address _treasury,
        address _weth
    ) {
        treasury = _treasury;
        weth = _weth;
        owner = msg.sender;

        problemStrats.push(0xE31e2e731DE87FfD0eCE2cE2f486E9095C8eBE63);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "!Owner");
        _;
    }

    function encodeData(address one, address two, address three, uint num) external pure returns (bytes memory) {
        if (num == 1) {
            return abi.encode(one);
        } else if (num == 2) {
            return abi.encode(one, two);
        } else {
            return abi.encode(one, two, three);
        }
    }

    function decodeData(bytes memory _data, uint num) internal pure returns (address[] memory) {
        if (num == 1) {
            address[] memory strats = new address[](num);
            address decodedAddress = abi.decode(_data, (address));
            strats[0] = decodedAddress;
            return strats;
        } else if (num == 2) {
            address[] memory strats = new address[](num);
            (address one, address two) = abi.decode(_data, (address, address));
            strats[0] = one;
            strats[1] = two;
            return strats;
        } else {
            (address one, address two, address three) = abi.decode(_data, (address, address, address));
            address[] memory strats = new address[](num);
            strats[0] = one;
            strats[1] = two;
            strats[2] = three;
            return strats;
        }
    }

    function harvestMultiple(bytes memory _data, uint num) external {
        address[] memory strats = decodeData(_data, num);

        for (uint i; i < strats.length;) {
            uint256 before = IERC20(weth).balanceOf(treasury);
            try IStrategy(strats[i]).harvest(treasury) {
                uint256 diff = IERC20(weth).balanceOf(treasury) - before;
                if (diff == 0) problemStrats.push(strats[i]);
            } catch {
                problemStrats.push(strats[i]);
            }
            unchecked { ++i; }
        }

        emit Harvest(strats, block.timestamp);
    }

    function cleanProblemStrats() external onlyOwner {
        delete problemStrats;
    }

    function problems() external view returns (address[] memory) {
        return problemStrats;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    // Sets harvester configuration
    function setConfig(Config calldata _config) external onlyOwner {
        config = _config;
    }
}