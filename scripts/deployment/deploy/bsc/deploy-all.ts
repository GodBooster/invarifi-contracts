import hre from "hardhat";
import { loadAndDeploy } from "../../configs/save-config";
import { PancakeCAKE_BNBDeployer, PancakeCAKE_BUSDDeployer, PancakeCAKE_USDTDeployer } from "../../deployers/bsc";
import {
  BiswapETH_BNB_LPDeployer
} from "../../deployers/bsc/biswap";
import { BscStargateUSDT_LPDeployer } from "../../deployers/bsc/stargate";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import { getNetworkDeploymentConfig } from "../../types";
import { deployEarn, deployLpHelpers } from "../../types/earn-deployer";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const pancakeCakeBnb = await loadAndDeploy(PancakeCAKE_BNBDeployer, ...(await getDeploymentParams()));
  const pancakeCakeBusd = await loadAndDeploy(PancakeCAKE_BUSDDeployer, ...(await getDeploymentParams()));
  const pancakeCakeUsdt = await loadAndDeploy(PancakeCAKE_USDTDeployer, ...(await getDeploymentParams()));

  // const stargateBusd = await loadAndDeploy(BscStargateBUSD_LPDeployer, ...(await getDeploymentParams()));
  const stargateUsdt = await loadAndDeploy(BscStargateUSDT_LPDeployer, ...(await getDeploymentParams()));

  const biswapEthBnb = await loadAndDeploy(BiswapETH_BNB_LPDeployer, ...(await getDeploymentParams()));
  // const biswapEthUsdt = await loadAndDeploy(BiswapETH_USDT_LPDeployer, ...(await getDeploymentParams()));
  // const biswapUsdcBnb = await loadAndDeploy(BiswapUSDC_BNB_LPDeployer, ...(await getDeploymentParams()));
  // const biswapUsdtBnb = await loadAndDeploy(BiswapUSDT_BNB_LPDeployer, ...(await getDeploymentParams()));
  // const biswapUsdtBusd = await loadAndDeploy(BiswapUSDT_BUSD_LPDeployer, ...(await getDeploymentParams()));

  networkConfig = await deployLpHelpers(hre, networkConfig);

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "bsc-earn-stargate-cake-biswap-busd-usdt-v4",
    name: "Stargate/Cake/Biswap BUSD/USDT V4",
    description: "Stargate/Cake/Biswap BUSD/USDT V4",
    vaultsConfig: [
      { part: 40, vaultId: (await pancakeCakeBnb.metadata()).id },
      {
        part: 50,
        vaultId: (await stargateUsdt.metadata()).id,
      },
      {
        part: 10,
        vaultId: (await biswapEthBnb.metadata()).id,
      },
    ],
  });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
