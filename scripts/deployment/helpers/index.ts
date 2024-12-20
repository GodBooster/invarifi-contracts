import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { getKeyByValueEnum } from "../../../utils/getKeyByValueEnum";
import fs from "fs";
import { getConfigFilePath, readJsonConfig } from "../configs/save-config";
import { Network, NetworkConfig } from "../types/network-config";
import { configs } from "../configs";

export const getNetworkConfig = async (hre: HardhatRuntimeEnvironment) => {
  const chain = hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1;
  const filePath = getConfigFilePath(hre);

  let config: NetworkConfig;

  if (fs.existsSync(filePath)) {
    config = (await readJsonConfig(hre)).config ?? configs[chain as Network];
  } else {
    config = configs[chain as Network];
  }

  if (!config) {
    throw new Error("Network is not supported");
  }

  return config;
};
