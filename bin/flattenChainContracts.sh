#!/bin/bash

rm tmp/*.sol

echo "// SPDX-License-Identifier: MIT" > tmp/TimelockController.sol
truffle-flattener node_modules/@openzeppelin-4/contracts/governance/TimelockController.sol | sed '/SPDX-License-Identifier/d' >> tmp/TimelockController.sol

echo "// SPDX-License-Identifier: MIT" > tmp/Treasury.sol
hardhat flatten contracts/infra/Treasury.sol | sed '/SPDX-License-Identifier/d' >> tmp/Treasury.sol

echo "// SPDX-License-Identifier: MIT" > tmp/Multicall.sol
hardhat flatten contracts/utils/Multicall.sol | sed '/SPDX-License-Identifier/d' >> tmp/Multicall.sol

echo "// SPDX-License-Identifier: MIT" > tmp/RewardPool.sol
hardhat flatten contracts/infra/RewardPool.sol | sed '/SPDX-License-Identifier/d' >> tmp/RewardPool.sol

echo "// SPDX-License-Identifier: MIT" > tmp/FeeBatchV2.sol
hardhat flatten contracts/infra/FeeBatchV2.sol | sed '/SPDX-License-Identifier/d' >> tmp/FeeBatchV2.sol


