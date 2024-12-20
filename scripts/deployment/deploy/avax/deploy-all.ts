import { BalancerAuraAURA_WETHDeployer } from "../../deployers/ethereum/Balancer/deployer-balancer-aura-AURA-WETH";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import hre from "hardhat";
import { getNetworkDeploymentConfig } from "../../types";

import { deployEarn, deployLpHelpers } from "../../types/earn-deployer";
import { loadAndDeploy } from "../../configs/save-config";
import { AvaxStargateUSDC_LPDeployer, AvaxStargateUSDT_LPDeployer } from "../../deployers/avax/stargate";
import { AvaxPangolinUSDC_AVAX_LPDeployer, AvaxPangolinUSDC_USDCe_LPDeployer } from "../../deployers/avax/pangolin";
import { AvaxPangolinUSDCe_AVAX_LPDeployer } from "../../deployers/avax/pangolin/deployer-pangolin-USDCe-AVAX-LP";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const stargateUsdc = await loadAndDeploy(AvaxStargateUSDC_LPDeployer, ...(await getDeploymentParams()));
  const stargateUsdt = await loadAndDeploy(AvaxStargateUSDT_LPDeployer, ...(await getDeploymentParams()));

  // const pangolinAvaxUsdc = await loadAndDeploy(AvaxPangolinUSDC_AVAX_LPDeployer, ...(await getDeploymentParams()));
  // const pangolinAvaxUsdce = await loadAndDeploy(AvaxPangolinUSDCe_AVAX_LPDeployer, ...(await getDeploymentParams()));
  // const pangolinUsdcUsdce = await loadAndDeploy(AvaxPangolinUSDC_USDCe_LPDeployer, ...(await getDeploymentParams()));

  networkConfig = await deployLpHelpers(hre, networkConfig);

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "avax-stargate-pangolin",
  //   name: "Stargate USDC_LP Pangolin USDC/USDCe LP",
  //   vaultsConfig: [
  //     {
  //       part: 50,
  //       vaultId: (await stargateUsdc.metadata()).id,
  //     },
  //     {
  //       part: 50,
  //       vaultId: (await pangolinUsdcUsdce.metadata()).id,
  //     },
  //   ],
  // });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
