import hre from "hardhat";
import { loadAndDeploy } from "../../configs/save-config";
import {
  OpCurveMIM_DAI_USDCe_USDT_Deployer,
  OpCurveSETH_ETH_Deployer,
  OpCurveSUSD_DAI_USDCe_USDT_Deployer,
} from "../../deployers/optimism/curve";
import {
  OpHopDai_LPDeployer,
  OpHopETH_LPDeployer,
  OpHopUSDCe_LPDeployer,
  OpHopUSDT_LPDeployer,
} from "../../deployers/optimism/hop";
import {
  OpStargateDAI_LPDeployer,
  OpStargateETH_LPDeployer,
  OpStargateUSDCe_LPDeployer,
} from "../../deployers/optimism/stargate";
import { OptimismVelodrome_ETH_USDCeDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-ETH-USDCe";
import { OptimismVelodrome_OP_ETHDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-OP-ETH";
import { OptimismVelodrome_OP_USDCeDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-OP-USDCe";
import { OptimismVelodrome_USDCe_USDTDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-USDCe-USDT";
import { OptimismVelodrome_VELO_OPDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-VELO-OP";
import { OptimismVelodrome_VELO_USDCeDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-VELO-USDCe";
import { OptimismVelodrome_sUSD_USDCeDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-sUSD-USDCe";
import { OptimismVelodrome_wstETH_ETHDeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-wstETH-ETH";
import { OptimismVelodrome_wstETH_LDODeployer } from "../../deployers/optimism/velodrome/deployer-velodrome-wstETH-LDO";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import { getNetworkDeploymentConfig } from "../../types";
import { deployEarn, deployLpHelpers } from "../../types/earn-deployer";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const hopUsdc = await loadAndDeploy(OpHopUSDCe_LPDeployer, ...(await getDeploymentParams()));
  const hopUsdt = await loadAndDeploy(OpHopUSDT_LPDeployer, ...(await getDeploymentParams()));
  const hopEth = await loadAndDeploy(OpHopETH_LPDeployer, ...(await getDeploymentParams()));
  const hopDai = await loadAndDeploy(OpHopDai_LPDeployer, ...(await getDeploymentParams()));

  const curveMimDaiUsdcUsdt = await loadAndDeploy(OpCurveMIM_DAI_USDCe_USDT_Deployer, ...(await getDeploymentParams()));
  const curveSethETh = await loadAndDeploy(OpCurveSETH_ETH_Deployer, ...(await getDeploymentParams()));
  const curveSusdDaiUsdcUsdt = await loadAndDeploy(
    OpCurveSUSD_DAI_USDCe_USDT_Deployer,
    ...(await getDeploymentParams())
  );

  const stargateUsdc = await loadAndDeploy(OpStargateUSDCe_LPDeployer, ...(await getDeploymentParams()));
  const stargateDai = await loadAndDeploy(OpStargateDAI_LPDeployer, ...(await getDeploymentParams()));
  const stargateEth = await loadAndDeploy(OpStargateETH_LPDeployer, ...(await getDeploymentParams()));

  const velodromeEthUsdce = await loadAndDeploy(OptimismVelodrome_ETH_USDCeDeployer, ...(await getDeploymentParams()));
  const velodromeOpEth = await loadAndDeploy(OptimismVelodrome_OP_ETHDeployer, ...(await getDeploymentParams()));
  const velodromeOpUsdce = await loadAndDeploy(OptimismVelodrome_OP_USDCeDeployer, ...(await getDeploymentParams()));
  const velodromesUsdUsdce = await loadAndDeploy(
    OptimismVelodrome_sUSD_USDCeDeployer,
    ...(await getDeploymentParams())
  );
  const velodromeUsdceUsdt = await loadAndDeploy(
    OptimismVelodrome_USDCe_USDTDeployer,
    ...(await getDeploymentParams())
  );
  const velodromeVeloOp = await loadAndDeploy(OptimismVelodrome_VELO_OPDeployer, ...(await getDeploymentParams()));
  const velodromeVeloUSDCe = await loadAndDeploy(
    OptimismVelodrome_VELO_USDCeDeployer,
    ...(await getDeploymentParams())
  );
  const velodromewstEthEth = await loadAndDeploy(
    OptimismVelodrome_wstETH_ETHDeployer,
    ...(await getDeploymentParams())
  );
  const velodromewstEthLdo = await loadAndDeploy(
    OptimismVelodrome_wstETH_LDODeployer,
    ...(await getDeploymentParams())
  );

  networkConfig = await deployLpHelpers(hre, networkConfig);

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "op-stargate-usdc-velo-wstETH-ETH-hop-DAI-1",
  //   name: "Stargate USDC Velodrome wstETH-ETH Hop DAI",
  //   vaultsConfig: [
  //     { part: 25, vaultId: (await stargateUsdc.metadata()).id },
  //     {
  //       part: 25,
  //       vaultId: (await velodromewstEthEth.metadata()).id,
  //     },
  //     {
  //       part: 25,
  //       vaultId: (await hopDai.metadata()).id,
  //     },
  //     {
  //       part: 25,
  //       vaultId: (await curveMimDaiUsdcUsdt.metadata()).id,
  //     },
  //   ],
  // });

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "op-stargate-usdc-hop-DAI",
    name: "Stargate USDC Hop DAI",
    description: "Stargate USDC Hop DAI",
    vaultsConfig: [
      { part: 50, vaultId: (await stargateUsdc.metadata()).id },
      {
        part: 50,
        vaultId: (await hopDai.metadata()).id,
      },
    ],
  });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
