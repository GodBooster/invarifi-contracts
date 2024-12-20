// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

library SwapBytesHelper {
    /// @dev The length of the bytes encoded address
    uint internal constant ADDR_SIZE = 20;

    /// @dev Converts encoded bytes
    function toAddress(
        bytes memory _bytes,
        uint _start
    ) internal pure returns (address) {
        require(_start + 20 >= _start, "toAddress: overflow");
        require(_bytes.length >= _start + 20, "toAddress: outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(
                mload(add(add(_bytes, 0x20), _start)),
                0x1000000000000000000000000
            )
        }

        return tempAddress;
    }

    function toUint24(
        bytes memory _bytes,
        uint _start
    ) internal pure returns (uint24) {
        require(_start + 3 >= _start, "toUint24_overflow");
        require(_bytes.length >= _start + 3, "toUint24_outOfBounds");
        uint24 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x3), _start))
        }

        return tempUint;
    }

    /// @notice counts addresses in the given encoded path
    /// @return addresses count
    function countAddresses(bytes memory path) internal pure returns (uint) {
        return path.length / ADDR_SIZE;
    }
}
