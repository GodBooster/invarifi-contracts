import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import dotenv from "dotenv";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import { HardhatUserConfig as WithEtherscanConfig, extendEnvironment, task } from "hardhat/config";
import { HardhatUserConfig } from "hardhat/src/types/config";
import { HttpNetworkUserConfig } from "hardhat/types";
import buildConfig from "./hardhat.config.build";
import "./hardhat.extensions";
import {
  clearLocalBoostsMetadatas,
  clearLocalEarnMetadatas,
  clearLocalVaultMetadatas,
  clearLocalZapMetadatas,
  removeDeploymentConfig,
  removeOneInchZapMetadata,
  removeOzFilePath,
  saveCuberaMetadata,
  saveEarnMetadataAll,
  saveVaultMetadataAll,
} from "./scripts/deployment/configs/save-config";
import "./tasks";
import { buildHardhatNetworkAccounts, getPKs } from "./utils/configInit";
dotenv.config();

type DeploymentConfig = HardhatUserConfig & WithEtherscanConfig;

export enum NetworkName {
  ETHEREUM = "ethereum",
  BSC = "bsc",
  POLYGON = "polygon",
  ARBITRUM = "arbitrum",
  OPTIMISM = "optimism",
  AVAX = "avax",
  BASE = "base",
}

const defaultForkBlocks: Record<NetworkName, number | undefined> = {
  [NetworkName.ETHEREUM]: 18684797, // 18318491,
  [NetworkName.BSC]: undefined,
  [NetworkName.POLYGON]: undefined,
  [NetworkName.ARBITRUM]: undefined,
  [NetworkName.OPTIMISM]: undefined,
  [NetworkName.AVAX]: 39033598,
  [NetworkName.BASE]: 7622338,
  // [NetworkName.OPTIMISM]: 113347900,
  // TODO: add all networks in this config
};

const forkPorts: Record<NetworkName, number> = {
  [NetworkName.ETHEREUM]: 8545,
  [NetworkName.BSC]: 9545,
  [NetworkName.POLYGON]: 10545,
  [NetworkName.ARBITRUM]: 11545,
  [NetworkName.OPTIMISM]: 12545,
  [NetworkName.AVAX]: 13545,
  [NetworkName.BASE]: 14545,
};

const forkChainIds: Record<NetworkName, number> = {
  [NetworkName.ETHEREUM]: 31337,
  [NetworkName.BSC]: 31338,
  [NetworkName.POLYGON]: 31339,
  [NetworkName.ARBITRUM]: 31340,
  [NetworkName.OPTIMISM]: 31341,
  [NetworkName.AVAX]: 31342,
  [NetworkName.BASE]: 31343,
};

const accounts = getPKs();
const hardhatNetworkAccounts = buildHardhatNetworkAccounts(accounts);

const resetLocalConfigs = (process.env.RESET_LOCAL_CONFIGS ?? "true") === "true";

const forkingNetwork = (process.env.FORK_NETWORK ?? "ethereum") as NetworkName;

const forkingBlockEnv = process.env.FORK_BLOCK;
let forkingBlock = forkingBlockEnv ?? defaultForkBlocks[forkingNetwork];

forkingBlock = forkingBlock !== undefined ? +forkingBlock : undefined;

const localhostPort = forkPorts[forkingNetwork] ?? forkPorts[NetworkName.ETHEREUM];

const forkChainId = forkChainIds[forkingNetwork] ?? forkChainIds[NetworkName.ETHEREUM];

console.log({ localhostPort, forkChainId, forkingBlock });
let networks: DeploymentConfig["networks"] = {
  [NetworkName.ETHEREUM]: {
    url: process.env.ETH_RPC || "https://rpc.ankr.com/eth",
    chainId: 1,
    accounts,
  },
  [NetworkName.BSC]: {
    url: process.env.BSC_RPC || "https://rpc.ankr.com/bsc",
    chainId: 56,
    gasPrice: 6 * 10 ** 9,
    gasMultiplier: 1.3,
    accounts,
  },
  [NetworkName.POLYGON]: {
    url: process.env.POLYGON_RPC || "https://rpc.ankr.com/polygon",
    chainId: 137,
    gasPrice: 150 * 10 ** 9,
    accounts,
  },
  [NetworkName.ARBITRUM]: {
    url: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    accounts,
  },
  [NetworkName.OPTIMISM]: {
    url: process.env.OPTIMISM_RPC || "https://rpc.ankr.com/optimism",
    chainId: 10,
    gasPrice: 0.007 * 10 ** 9, 
    accounts,
  },
  [NetworkName.AVAX]: {
    url: process.env.AVAX_RPC || "https://rpc.ankr.com/avalanche",
    chainId: 43114,
    gasPrice: 240 * 10 ** 9,
    accounts,
  },
  [NetworkName.BASE]: {
    url: process.env.BASE_RPC || "https://base-pokt.nodies.app",
    chainId: 8453,
    accounts,
    gasPrice: 100000,
  },
  heco: {
    url: process.env.HECO_RPC || "https://http-mainnet-node.huobichain.com",
    chainId: 128,
    accounts,
  },
  fantom: {
    url: process.env.FANTOM_RPC || "https://rpc.ankr.com/fantom",
    chainId: 250,
    accounts,
  },
  one: {
    url: process.env.ONE_RPC || "https://api.s0.t.hmny.io/",
    chainId: 1666600000,
    accounts,
  },

  moonriver: {
    url: process.env.MOONRIVER_RPC || "https://rpc.moonriver.moonbeam.network",
    chainId: 1285,
    accounts,
  },
  celo: {
    url: process.env.CELO_RPC || "https://forno.celo.org",
    chainId: 42220,
    accounts,
  },
  cronos: {
    // url: "https://evm-cronos.crypto.org",
    url: process.env.CRONOS_RPC || "https://rpc.vvs.finance/",
    chainId: 25,
    accounts,
  },
  testnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    chainId: 97,
    accounts,
  },
  kovan: {
    url: "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    chainId: 42,
    accounts,
  },
  aurora: {
    url: process.env.AURORA_RPC || "https://mainnet.aurora.dev/Fon6fPMs5rCdJc4mxX4kiSK1vsKdzc3D8k6UF8aruek",
    chainId: 1313161554,
    accounts,
  },
  fuse: {
    url: process.env.FUSE_RPC || "https://rpc.fuse.io",
    chainId: 122,
    accounts,
  },
  metis: {
    url: process.env.METIS_RPC || "https://andromeda.metis.io/?owner=1088",
    chainId: 1088,
    accounts,
  },
  moonbeam: {
    url: process.env.MOONBEAM_RPC || "https://rpc.api.moonbeam.network",
    chainId: 1284,
    accounts,
  },
  sys: {
    url: process.env.SYS_RPC || "https://rpc.syscoin.org/",
    chainId: 57,
    accounts,
  },
  emerald: {
    url: process.env.EMERALD_RPC || "https://emerald.oasis.dev",
    chainId: 42262,
    accounts,
  },

  kava: {
    url: process.env.KAVA_RPC || "https://evm.kava.io",
    chainId: 2222,
    accounts,
  },
  canto: {
    url: process.env.CANTO_RPC || "https://canto.slingshot.finance",
    chainId: 7700,
    accounts,
  },
  zkevm: {
    url: process.env.ZKEVM_RPC || "https://zkevm-rpc.com",
    chainId: 1101,
    accounts,
  },
} as const;

const forkConfig = networks[forkingNetwork] as HttpNetworkUserConfig | undefined;

networks = {
  ...networks,
  localhost: {
    chainId: forkChainId,
    url: `http://127.0.0.1:${localhostPort}`,
    accounts,
  },
  hardhat: {
    chainId: forkChainId,
    accounts: hardhatNetworkAccounts,
    gasPrice: 10 * 10 ** 9,
    initialBaseFeePerGas: 1 * 10 ** 9,
    forking: {
      blockNumber: forkingBlock,
      enabled: !!forkConfig,
      url: forkConfig?.url ?? `http://127.0.0.1:${localhostPort}`,
    },
    allowUnlimitedContractSize: true,
  },
};

extendEnvironment(hre => {
  const config = hre.network.config as HttpNetworkUserConfig;

  if (!process.env.TEST && (hre.network.name == "hardhat" || hre.network.name == "localhost")) {
    console.log("Extend hardhat for local network");
    hre.forkingNetwork = { ...forkConfig, name: forkingNetwork };

    if (config?.url) {
      hre.ethers.provider = new hre.ethers.providers.JsonRpcProvider(config.url);
    }
  }
});

task("node", async (_, hre, runSuper) => {
  if (!forkConfig) {
    console.log("Forking network is not found");
  } else {
    console.log(
      `Running localnode in fork mode. Fork network: ${forkingNetwork}\nFork url: ${hre.forkingNetwork?.url}\nFork block: ${forkingBlock}`
    );

    // reset existing metadata file
    if (resetLocalConfigs) {
      clearLocalVaultMetadatas();
      clearLocalEarnMetadatas();
      clearLocalBoostsMetadatas();
      clearLocalZapMetadatas();
    }

    saveVaultMetadataAll(hre, []);
    saveEarnMetadataAll(hre, []);

    removeDeploymentConfig(hre);
    saveCuberaMetadata(hre, {});
    removeOzFilePath(hre);
    removeOneInchZapMetadata(hre);

    console.log(`Existing deployment configs for ${forkingNetwork} fork were removed`);
  }

  return runSuper();
});

const config: DeploymentConfig = {
  ...buildConfig,
  networks: networks,
};

export default config;
