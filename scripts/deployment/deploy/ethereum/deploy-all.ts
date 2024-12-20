import { BalancerAuraAURA_WETHDeployer } from "../../deployers/ethereum/Balancer/deployer-balancer-aura-AURA-WETH";
import { getNetworkConfig } from "../../helpers";
import { deployChain } from "../../infra/deploy-chain";
import hre, { ethers } from "hardhat";
import { getNetworkDeploymentConfig } from "../../types";
import { BalancerAuraETH_RETHDeployer } from "../../deployers/ethereum/Balancer/deployer-balancer-aura-ETH-rETH";
import { VaultDeployer } from "../../types/vault-deployer";
import { CurveConvexCVX_ETHDeployer } from "../../deployers/ethereum/Curve/deployer-curve-convex-CVX-ETH";
import { CurveConvexETH_RETHDeployer } from "../../deployers/ethereum/Curve/deployer-curve-convex-ETH-RETH";
import { StargateETH_LPDeployer } from "../../deployers/ethereum/Stargate/deployer-stargate-ETH-LP";
import { StargateUSDT_LPDeployer } from "../../deployers/ethereum/Stargate/deployer-stargate-USDT-LP";
import { loadOrCreateDeployer } from "../../configs/save-config";
import { SushiLDO_ETHLPDeployer } from "../../deployers/ethereum/Sushi/deployer-sushi-LDO-​ETH-LP";
import {
  CurveConvexLDO_ETHDeployer,
  CurveConvexMIM_DAI_USDC_USDTDeployer,
  CurveConvexTriCryptoDeployer,
  CurveConvexTriCryptoUSDCDeployer,
} from "../../deployers/ethereum/Curve";
import {
  BalancerAuraWSTETH_ETHDeployer,
  BalancerAuraWSTETH_RETH_SFRXETHDeployer,
} from "../../deployers/ethereum/Balancer";
import { deployEarn, deployLpHelpers, deploySharedEarn } from "../../types/earn-deployer";

const main = async () => {
  const gasPrice = hre.config.networks.hardhat.gasPrice;
  const [deployer] = await hre.ethers.getSigners();
  let balanceBefore = await ethers.provider.getBalance(deployer.address);
  let networkConfig = await getNetworkConfig(hre);
  networkConfig = await deployChain(hre, networkConfig);
  networkConfig = await deploySharedEarn(hre, networkConfig);

  let balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance difference infra: ${ethers.utils.formatUnits(balanceBefore.sub(balanceAfter))}`);

  const getDeploymentParams = async () => [hre, await getNetworkDeploymentConfig(hre, networkConfig)] as const;

  balanceBefore = balanceAfter;

  const sushiLdoEth = await loadOrCreateDeployer(SushiLDO_ETHLPDeployer, ...(await getDeploymentParams()));
  await VaultDeployer.deploy(sushiLdoEth);

  balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance difference vault: ${ethers.utils.formatUnits(balanceBefore.sub(balanceAfter))}`);

  // const stargateEth = await loadOrCreateDeployer(StargateETH_LPDeployer, ...(await getDeploymentParams()));
  // await VaultDeployer.deploy(stargateEth);

  const stargateUsdt = await loadOrCreateDeployer(StargateUSDT_LPDeployer, ...(await getDeploymentParams()));
  await VaultDeployer.deploy(stargateUsdt);

  // const curveLdoEth = await loadOrCreateDeployer(CurveConvexLDO_ETHDeployer, ...(await getDeploymentParams()));
  // await VaultDeployer.deploy(curveLdoEth);

  // const curveConvexTriCryptoUSDCDeployer = await loadOrCreateDeployer(
  //   CurveConvexTriCryptoUSDCDeployer,
  //   ...(await getDeploymentParams())
  // );
  // await VaultDeployer.deploy(curveConvexTriCryptoUSDCDeployer);

  // const curveMimDaiUsdcUsdt = await loadOrCreateDeployer(
  //   CurveConvexMIM_DAI_USDC_USDTDeployer,
  //   ...(await getDeploymentParams())
  // );
  // await VaultDeployer.deploy(curveMimDaiUsdcUsdt);

  // const balancerAuraWeth = await loadOrCreateDeployer(BalancerAuraAURA_WETHDeployer, ...(await getDeploymentParams()));
  // const balancerEthRETH = await loadOrCreateDeployer(BalancerAuraETH_RETHDeployer, ...(await getDeploymentParams()));
  const balancerAuraWeth = await loadOrCreateDeployer(BalancerAuraAURA_WETHDeployer, ...(await getDeploymentParams()));
  await VaultDeployer.deploy(balancerAuraWeth);
  const balancerEthRETH = await loadOrCreateDeployer(BalancerAuraETH_RETHDeployer, ...(await getDeploymentParams()));
  await VaultDeployer.deploy(balancerEthRETH);
  // const balancerWSTETH_RETH_SFRXEth = await loadOrCreateDeployer(
  //   BalancerAuraWSTETH_RETH_SFRXETHDeployer,
  //   ...(await getDeploymentParams())
  // );
  // await VaultDeployer.deploy(balancerWSTETH_RETH_SFRXEth);
  // const balancerwstEthEth = await loadOrCreateDeployer(
  //   BalancerAuraWSTETH_ETHDeployer,
  //   ...(await getDeploymentParams())
  // );
  // await VaultDeployer.deploy(balancerwstEthEth);

  networkConfig = await deployLpHelpers(hre, networkConfig);

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "eth-earn-sushi-ldo-eth",
    name: "Sushi Ldo/Eth Pool",
    vaultsConfig: [{ part: 100, vaultId: (await sushiLdoEth.metadata()).id }],
  });

  networkConfig = await deployEarn(hre, networkConfig, {
    id: "eth-earn-sushi-stargate-ldo-eth-usdt",
    name: "Sushi/Stargate LDO/ETH/USDT",
    vaultsConfig: [
      { part: 30, vaultId: (await stargateUsdt.metadata()).id },
      { part: 30, vaultId: (await balancerAuraWeth.metadata()).id },
      { part: 40, vaultId: (await sushiLdoEth.metadata()).id },
    ],
  });

  // const deployedBalancerAuraWeth = await VaultDeployer.deploy(balancerAuraWeth);
  // const deployedBalancerEthRETH = await VaultDeployer.deploy(balancerEthRETH);

  // const curveCVXETH = await loadOrCreateDeployer(CurveConvexCVX_ETHDeployer, ...(await getDeploymentParams()));
  // const curveETHRETH = await loadOrCreateDeployer(CurveConvexETH_RETHDeployer, ...(await getDeploymentParams()));

  // const deployedCurveCVXETH = await VaultDeployer.deploy(curveCVXETH);
  // const deployedCurveETHRETH = await VaultDeployer.deploy(curveETHRETH);

  console.log(`Balance before: ${balanceBefore}`);
  console.log(`Balance after: ${balanceAfter}`);
  console.log(`Balance difference: ${ethers.utils.formatUnits(balanceBefore.sub(balanceAfter))}`);
  console.log(`Gasprice: ${gasPrice}`);
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
