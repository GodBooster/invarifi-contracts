import hre from "hardhat";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import { getNetworkDeploymentConfig } from "../../types";

import { loadAndDeploy } from "../../configs/save-config";
import { PolyRetroGammaMATIC_WETH_LPDeployer } from "../../deployers/polygon/retro-gamma/deployer-retro-gamma-matic-weth";
import { PolyRetroGammaUSDC_MATIC_LPDeployer } from "../../deployers/polygon/retro-gamma/deployer-retro-gamma-usdc-matic";
import { PolyRetroGammaUSDC_USDT_LPDeployer } from "../../deployers/polygon/retro-gamma/deployer-retro-gamma-usdc-usdt";
import { PolyRetroGammaUSDC_WETH_LPDeployer } from "../../deployers/polygon/retro-gamma/deployer-retro-gamma-usdc-weth";
import { PolyStargateUSDC_LPDeployer } from "../../deployers/polygon/stargate/deployer-stargate-USDC-LP";
import { PolyStargateUSDT_LPDeployer } from "../../deployers/polygon/stargate/deployer-stargate-USDT-LP";
import { deployLpHelpers } from "../../types/earn-deployer";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const stargateUsdc = await loadAndDeploy(PolyStargateUSDC_LPDeployer, ...(await getDeploymentParams()));
  const stargateUsdt = await loadAndDeploy(PolyStargateUSDT_LPDeployer, ...(await getDeploymentParams()));
  const retroGammaMaticWeth = await loadAndDeploy(
    PolyRetroGammaMATIC_WETH_LPDeployer,
    ...(await getDeploymentParams())
  );
  const retroGammaUsdcMatic = await loadAndDeploy(
    PolyRetroGammaUSDC_MATIC_LPDeployer,
    ...(await getDeploymentParams())
  );
  const retroGammaUsdcUsdt = await loadAndDeploy(PolyRetroGammaUSDC_USDT_LPDeployer, ...(await getDeploymentParams()));
  const retroGammaUsdcWeth = await loadAndDeploy(PolyRetroGammaUSDC_WETH_LPDeployer, ...(await getDeploymentParams()));

  networkConfig = await deployLpHelpers(hre, networkConfig);

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "poly-earn-stargate-usdc",
  //   name: "Stargate USDC",
  //   vaultsConfig: [
  //     { part: 25, vaultId: (await stargateUsdc.metadata()).id },
  //     {
  //       part: 75,
  //       vaultId: (await stargateUsdt.metadata()).id,
  //     },
  //   ],
  // });

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "poly-earn-retro-usdc-weth",
  //   name: "Stargate USDC",
  //   vaultsConfig: [
  //     { part: 50, vaultId: (await retroGammaUsdcWeth.metadata()).id },
  //     {
  //       part: 50,
  //       vaultId: (await retroGammaUsdcMatic.metadata()).id,
  //     },
  //   ],
  // });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
