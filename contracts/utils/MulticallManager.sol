// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {AccessControlNotUpgradeableAbstract} from "./access/AccessControlNotUpgradeableAbstract.sol";

contract MulticallManager is AccessControlNotUpgradeableAbstract {
  struct Call {
    address target;
    bytes callData;
  }

  constructor(address _ac) AccessControlNotUpgradeableAbstract(_ac) {}

  function aggregate(
    Call[] calldata calls
  )
    external
    onlyManager
    returns (uint256 blockNumber, bytes[] memory returnData)
  {
    blockNumber = block.number;
    returnData = new bytes[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
      (bool success, bytes memory ret) = calls[i].target.call(
        calls[i].callData
      );
      require(success);
      returnData[i] = ret;
    }
  }
}
