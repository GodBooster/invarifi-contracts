import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkDeploymentConfig } from "../../types";

import { VaultDeployer } from "../../types/vault-deployer";
import { OpHopDai_LPDeployer, OpHopETH_LPDeployer, OpHopUSDCe_LPDeployer, OpHopUSDT_LPDeployer } from "./hop";

export const optimismDeployersRegistry = (hre: HardhatRuntimeEnvironment, config: NetworkDeploymentConfig) => {
  const arr = [
    // HOP vaults
    [new OpHopDai_LPDeployer(hre, config), "0x1fb5621ec27371a71cc285d6f1a2b05d3660fe11"],
    [new OpHopETH_LPDeployer(hre, config), "0x39c9e3940d6d67106124aa47b7682de75f1bf0ae"],
    [new OpHopUSDCe_LPDeployer(hre, config), "0xcfb6f21f7de4b51b9fb76a440401e4de52394fcd"],
    [new OpHopUSDT_LPDeployer(hre, config), "0x2669a693ebdf20b1333dcc8ef892fd9ae52d3ae9"],
  ] as [VaultDeployer, string][];

  return Object.fromEntries(arr.map(v => [v[0].vaultName(), { deployer: v[0], wantHolder: v[1] }]));
};
