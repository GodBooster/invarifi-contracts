import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkDeploymentConfig } from "../../types";
import { VaultDeployer } from "../../types/vault-deployer";
import { ArbStargateETH_LPDeployer, ArbStargateUSDT_LPDeployer } from "./stargate";
import {
  ArbSolidlizardARB_ETH_vLPDeployer,
  ArbSolidlizardARB_USDCe_vLPDeployer,
  ArbSolidlizardETH_USDCe_vLPDeployer,
} from "./solidlizard";

export const arbDeployersRegistry = (hre: HardhatRuntimeEnvironment, config: NetworkDeploymentConfig) => {
  const arr = [
    // Stargate vaults
    [new ArbStargateETH_LPDeployer(hre, config), "0xd7c1db8914a9826b8d7eab9fbe7927330dc9d019"],
    [new ArbStargateUSDT_LPDeployer(hre, config), "0x5bf2ee44b04e5abf65e629ad1391e9ca80634a2a"],

    // Solidlizard vaults
    [new ArbSolidlizardARB_ETH_vLPDeployer(hre, config), "0xfe35466fc9e8f657a3f889e37e25db82a2a16b8d"],
    [new ArbSolidlizardETH_USDCe_vLPDeployer(hre, config), "0xa717cc87fa4f4f14b700f483fa4c5409bd00526c"],
    [new ArbSolidlizardARB_USDCe_vLPDeployer(hre, config), "0x540d4edb540314b7679dce0f7153d5dc4ff56cb6"],
  ] as [VaultDeployer, string][];

  return Object.fromEntries(arr.map(v => [v[0].vaultName(), { deployer: v[0], wantHolder: v[1] }]));
};
