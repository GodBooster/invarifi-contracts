import hre from "hardhat";
import { loadAndDeploy } from "../../configs/save-config";
import { ArbHopETH_LPDeployer } from "../../deployers/arbitrum/hop/deployer-hop-ETH-LP";
import { ArbHopUSDT_LPDeployer } from "../../deployers/arbitrum/hop/deployer-hop-USDT-LP";
import {
  ArbSolidlizardARB_ETH_vLPDeployer,
  ArbSolidlizardARB_USDCe_vLPDeployer,
  ArbSolidlizardETH_USDCe_vLPDeployer,
} from "../../deployers/arbitrum/solidlizard";
import { ArbStargateETH_LPDeployer, ArbStargateUSDT_LPDeployer } from "../../deployers/arbitrum/stargate";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import { getNetworkDeploymentConfig } from "../../types";
import { deployEarn, deployLpHelpers } from "../../types/earn-deployer";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const stargateEth = await loadAndDeploy(ArbStargateETH_LPDeployer, ...(await getDeploymentParams()));
  const stargateUsdt = await loadAndDeploy(ArbStargateUSDT_LPDeployer, ...(await getDeploymentParams()));

  const solArbEth = await loadAndDeploy(ArbSolidlizardARB_ETH_vLPDeployer, ...(await getDeploymentParams()));
  const solArbUsdce = await loadAndDeploy(ArbSolidlizardARB_USDCe_vLPDeployer, ...(await getDeploymentParams()));
  const solEthUsdce = await loadAndDeploy(ArbSolidlizardETH_USDCe_vLPDeployer, ...(await getDeploymentParams()));
  const hopEthLp = await loadAndDeploy(ArbHopETH_LPDeployer, ...(await getDeploymentParams()));
  const hopUsdtLp = await loadAndDeploy(ArbHopUSDT_LPDeployer, ...(await getDeploymentParams()));
  // const hopUsdcLp = await loadAndDeploy(ArbHopUSDCe_LPDeployer, ...(await getDeploymentParams()));
  // const hopDaiLp = await loadAndDeploy(ArbHopDAI_LPDeployer, ...(await getDeploymentParams()));
  // const balancerAuraWstETHEth = await loadAndDeploy(
  //   ArbBalancerAuraWSTETH_ETHDeployer,
  //   ...(await getDeploymentParams())
  // );
  // const balancerAuraUsdcDaiUsdtUsdce = await loadAndDeploy(
  //   ArbBalancerAuraUSDC_DAI_USDT_USDCeDeployer,
  //   ...(await getDeploymentParams())
  // );

  networkConfig = await deployLpHelpers(hre, networkConfig);

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "arb-earn-stargate-eth-usdt",
  //   name: "Stargate ETH/USDT",
  //   vaultsConfig: [
  //     { part: 25, vaultId: (await stargateEth.metadata()).id },
  //     {
  //       part: 75,
  //       vaultId: (await stargateUsdt.metadata()).id,
  //     },
  //   ],
  // });

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "arb-earn-stargate-solidlizard-eth-usdc",
    name: "Stargate/Solidlizard/USDT/ETH/USDCe",
    description: "Stargate/Solidlizard/USDT/ETH/USDCe",
    vaultsConfig: [
      { part: 50, vaultId: (await stargateEth.metadata()).id },
      { part: 50, vaultId: (await solEthUsdce.metadata()).id },
    ],
  });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
