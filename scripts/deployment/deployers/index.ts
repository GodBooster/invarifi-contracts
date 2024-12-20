import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkDeploymentConfig } from "../types";
import { Network } from "../types/network-config";
import { ethereumDeployersRegistry } from "./ethereum";
import { bscDeployersRegistry } from "./bsc";
import { arbDeployersRegistry } from "./arbitrum";
import { optimismDeployersRegistry } from "./optimism";

type RegistryTypeByNetwork = ReturnType<typeof ethereumDeployersRegistry>;

export const deployersRegistry = (
  hre: HardhatRuntimeEnvironment,
  config: NetworkDeploymentConfig
): RegistryTypeByNetwork => {
  const chain = hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1;
  const chainId = chain as Network;

  switch (chainId) {
    case Network.ETH_MAINNET:
      return ethereumDeployersRegistry(hre, config);
    case Network.BSC_MAINNET:
      return bscDeployersRegistry(hre, config);
    case Network.POLYGON_MAINNET:
      // FIXME
      return arbDeployersRegistry(hre, config);
    case Network.ARB_MAINNET:
      return arbDeployersRegistry(hre, config);
    case Network.OPTIMISM_MAINNET:
      return optimismDeployersRegistry(hre, config);
    default:
      throw new Error("Unknown network");
  }
};
