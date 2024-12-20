import hre from "hardhat";
import { loadAndDeploy } from "../../configs/save-config";
import { BaseAerodromecbETH_ETH_vLPDeployer } from "../../deployers/base/Aerodrome/deployer-aerodrome-cbETH-​ETH-vLP";
import { BaseBalancercbETH_ETHDeployer } from "../../deployers/base/Balancer/deployer-balancer-cbETH-ETH";
import { BaseBaseswap_USDC_ETH_LPDeployer } from "../../deployers/base/Baseswap/deployer-baseswap-USDC-ETH-LP";
import { BaseStargateETH_LPDeployer } from "../../deployers/base/Stragate/deployer-stargate-ETH-LP";
import { BaseStargateUSDbC_LPDeployer } from "../../deployers/base/Stragate/deployer-stargate-USDbC-LP";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import { getNetworkDeploymentConfig } from "../../types";
import { deployEarn, deployLpHelpers } from "../../types/earn-deployer";

const main = async () => {
  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);

  const stargateEth = await loadAndDeploy(BaseStargateETH_LPDeployer, ...(await getDeploymentParams()));
  const stargateUsdc = await loadAndDeploy(BaseStargateUSDbC_LPDeployer, ...(await getDeploymentParams()));

  const balancercbEth = await loadAndDeploy(BaseBalancercbETH_ETHDeployer, ...(await getDeploymentParams()));
  // const balancerUSDCUSDbCaxlUSDC = await loadAndDeploy(
  //   BaseBalancerUSDC_USDbC_axlUSDCDeployer,
  //   ...(await getDeploymentParams())
  // );

  // DO NOT UNCOMMENT
  // const aerodromeAeroUsdbc = await loadAndDeploy(
  //   BaseAerodrome_AERO_USDbC_vLPDeployer,
  //   ...(await getDeploymentParams())
  // );
  const aerodromecbEthEth = await loadAndDeploy(BaseAerodromecbETH_ETH_vLPDeployer, ...(await getDeploymentParams()));
  // DO NOT UNCOMMENT
  // const aerodromeDolaUsdbc = await loadAndDeploy(
  //   BaseAerodrome_DOLA_USDbC_sLPDeployer,
  //   ...(await getDeploymentParams())
  // );
  // const aerodromeEthDai = await loadAndDeploy(BaseAerodrome_ETH_DAI_vLPDeployer, ...(await getDeploymentParams()));
  // const aerodromeDaiUsdbc = await loadAndDeploy(BaseAerodrome_DAI_USDbC_sLPDeployer, ...(await getDeploymentParams()));
  // const aerodromeEthUsdbc = await loadAndDeploy(BaseAerodrome_ETH_USDbc_vLPDeployer, ...(await getDeploymentParams()));
  // const aerodromeUsdcUsdbc = await loadAndDeploy(
  //   BaseAerodrome_USDC_USDbc_sLPDeployer,
  //   ...(await getDeploymentParams())
  // );
  // // DO NOT UNCOMMENT
  // const aerodromewUSDRUSDbC = await loadAndDeploy(
  //   BaseAerodromewUSDR_USDbC_vLPDeployer,
  //   ...(await getDeploymentParams())
  // );

  const baseSwapUsdcEth = await loadAndDeploy(BaseBaseswap_USDC_ETH_LPDeployer, ...(await getDeploymentParams()));
  // const baseSwapcbEthEth = await loadAndDeploy(BaseBaseswap_cbETH_ETH_LPDeployer, ...(await getDeploymentParams()));
  // const baseSwapDaiEth = await loadAndDeploy(BaseBaseswap_DAI_ETH_LPDeployer, ...(await getDeploymentParams()));
  // const baseSwapUsdbcDai = await loadAndDeploy(BaseBaseswap_USDbC_DAI_LPDeployer, ...(await getDeploymentParams()));
  // // DO NOT UNCOMMENT
  // const baseSwapUsdbcEth = await loadAndDeploy(BaseBaseswap_USDbC_ETH_LPDeployer, ...(await getDeploymentParams()));
  // const baseSwapUsdcUsdbc = await loadAndDeploy(BaseBaseswap_USDC_USDbC_LPDeployer, ...(await getDeploymentParams()));

  networkConfig = await deployLpHelpers(hre, networkConfig);

  // networkConfig = await deployEarn(hre, networkConfig, {
  //   id: "base-earn-stargate-eth-usdt",
  //   name: "Stargate ETH/USDT",
  //   vaultsConfig: [
  //     { part: 25, vaultId: (await stargateEth.metadata()).id },
  //     { part: 25, vaultId: (await balancerUSDCUSDbCaxlUSDC.metadata()).id },
  //     {
  //       part: 50,
  //       vaultId: (await baseSwapUsdbcDai.metadata()).id,
  //     },
  //   ],
  // });

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "base-earn-aerodrom-baseswap-usdc-eth",
    name: "Aerodrom/BaseSwap/USDC/ETH",
    description: "Aerodrom/BaseSwap/USDC/ETH",
    vaultsConfig: [
      { part: 50, vaultId: (await aerodromecbEthEth.metadata()).id },
      { part: 50, vaultId: (await baseSwapUsdcEth.metadata()).id },
    ],
  });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
