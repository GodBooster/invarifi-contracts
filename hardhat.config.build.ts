import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import dotenv from "dotenv";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

import { HardhatUserConfig as WithEtherscanConfig } from "hardhat/config";
import { HardhatUserConfig } from "hardhat/src/types/config";

dotenv.config();

type DeploymentConfig = HardhatUserConfig & WithEtherscanConfig;

const config: DeploymentConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: process.env.EXPLORER_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v5",
    tsNocheck: true,

    // alwaysGenerateOverloads: true,
  },
  paths: {
    sources: "./contracts",
  },
  gasReporter: {
    enabled: true,
  },
  contractSizer: {
    runOnCompile: true,
  },
};

export default config;
