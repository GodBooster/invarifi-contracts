import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkDeploymentConfig } from "../../types";
import { VaultDeployer } from "../../types/vault-deployer";
import { PancakeCAKE_BNBDeployer, PancakeCAKE_BUSDDeployer, PancakeCAKE_USDTDeployer } from "./pancake";
import { BscStargateBUSD_LPDeployer } from "./stargate/deployer-stargate-BUSD-LP";
import { BscStargateUSDT_LPDeployer } from "./stargate/deployer-stargate-USDT-LP";
import {
  BiswapETH_BNB_LPDeployer,
  BiswapETH_USDT_LPDeployer,
  BiswapUSDC_BNB_LPDeployer,
  BiswapUSDT_BNB_LPDeployer,
  BiswapUSDT_BUSD_LPDeployer,
} from "./biswap";

export * from "./pancake";

export const bscDeployersRegistry = (hre: HardhatRuntimeEnvironment, config: NetworkDeploymentConfig) => {
  const arr = [
    // Pancake vaults
    [new PancakeCAKE_BNBDeployer(hre, config), "0x14B2e8329b8e06BCD524eb114E23fAbD21910109"],
    [new PancakeCAKE_BUSDDeployer(hre, config), "0xbdDB01D0113401a07fFb18da356DE256386a9000"],
    [new PancakeCAKE_USDTDeployer(hre, config), "0x46c541b2D822933107ef02771d885573A85c448A"],
    // Stargate vaults
    [new BscStargateUSDT_LPDeployer(hre, config), "0xC195A2a7a30C7385263061e7e0400a62b165d1a3"],
    [new BscStargateBUSD_LPDeployer(hre, config), "0x21Dc8a8C58008a9C2D6Da54747a7899FF2c05781"],

    // Biswap vaults
    [new BiswapETH_BNB_LPDeployer(hre, config), "0x612e072e433A8a08496Ee0714930b357426c12Ce"],
    [new BiswapETH_USDT_LPDeployer(hre, config), "0xe4cf707e152E7D8a4cBf8B089a74E738F9300A54"],
    [new BiswapUSDC_BNB_LPDeployer(hre, config), "0x982630f975495Dbd49a6Ad02aFC4c47c5dC615Aa"],
    [new BiswapUSDT_BNB_LPDeployer(hre, config), "0x0c5ec72a2F1a07088B19Dd23661FDE69d4B0D9ED"],
    [new BiswapUSDT_BUSD_LPDeployer(hre, config), "0x8095aA5ff3fD6cfAc4e1c18E1B0f4F706189fa3B"],
  ] as [VaultDeployer, string][];

  return Object.fromEntries(arr.map(v => [v[0].vaultName(), { deployer: v[0], wantHolder: v[1] }]));
};
