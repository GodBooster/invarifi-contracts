import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkDeploymentConfig } from "../../types";
import {
  BalancerAuraAURA_WETHDeployer,
  BalancerAuraETH_RETHDeployer,
  BalancerAuraWSTETH_ETHDeployer,
  BalancerAuraWSTETH_RETH_SFRXETHDeployer,
} from "./Balancer";

import {
  CurveConvexCVX_ETHDeployer,
  CurveConvexETH_RETHDeployer,
  CurveConvexLDO_ETHDeployer,
  CurveConvexMIM_DAI_USDC_USDTDeployer,
  CurveConvexTUSD_DAI_USDC_USDTDeployer,
  CurveConvexTriCryptoDeployer,
  CurveConvexTriCryptoUSDCDeployer,
  CurveConvexUSDD_DAI_USDC_USDTDeployer,
  CurveConvexcvxCRV_CRVDeployer,
} from "./Curve";

import { SushiLDO_ETHLPDeployer } from "./Sushi";

import { VaultDeployer } from "../../types/vault-deployer";
import { StargateETH_LPDeployer, StargateUSDT_LPDeployer } from "./Stargate";

export const ethereumDeployersRegistry = (hre: HardhatRuntimeEnvironment, config: NetworkDeploymentConfig) => {
  const arr = [
    // Balancer Aura vaults
    [new BalancerAuraAURA_WETHDeployer(hre, config), "0x7b523a0c714988e5c4acaa71198ef0b52e0fb6b0"],
    [new BalancerAuraETH_RETHDeployer(hre, config), "0xa7dB55e153C0c71Ff35432a9aBe2A853f886Ce0D"],
    [new BalancerAuraWSTETH_ETHDeployer(hre, config), "0xebD9467eCe9e86878e673c25120ccB4D4ED60c6d"],
    [new BalancerAuraWSTETH_RETH_SFRXETHDeployer(hre, config), "0x3F3f4e8738313D996a735b91419940DaaEA0C4C7"],

    // Curve Convex vaults
    [new CurveConvexCVX_ETHDeployer(hre, config), "0x14D2f4D1b0B5A7bB98b8Ec62Eb3723d461ffBcD2"],
    [new CurveConvexETH_RETHDeployer(hre, config), "0x8dBE264c4fDCf340A39709Bd033AeAad4b5fE323"],
    [new CurveConvexLDO_ETHDeployer(hre, config), "0x35405DF56Cd53ed3980b220fb66578f004F543Ee"],
    [new CurveConvexMIM_DAI_USDC_USDTDeployer(hre, config), "0x310D5C8EE1512D5092ee4377061aE82E48973689"],
    [new CurveConvexTUSD_DAI_USDC_USDTDeployer(hre, config), "0xD34f3e85bB7C8020C7959B80a4B87a369D639dc0"],
    [new CurveConvexTriCryptoDeployer(hre, config), "0x347140c7F001452e6A60131D24b37103D0e34231"],
    [new CurveConvexTriCryptoUSDCDeployer(hre, config), "0x0a7b9483030994016567b3B1B4bbB865578901Cb"],
    [new CurveConvexUSDD_DAI_USDC_USDTDeployer(hre, config), "0xfe6Bc0f11013642C983e3691A272CB71374F774A"],
    [new CurveConvexcvxCRV_CRVDeployer(hre, config), "0x1Da722CfA8B0dFda57CF8D787689039C7A63F049"],

    // Stargate vaults
    [new StargateETH_LPDeployer(hre, config), "0x8BD431fFf72b55231d562482e7661997a16E0A3b"],
    [new StargateUSDT_LPDeployer(hre, config), "0x5Fd343b233b2A0204825DB25DBe039f3219af03c"],
    
    // Sushi vaults
    [new SushiLDO_ETHLPDeployer(hre, config), "0xA3d489d13B35872cB0d69535F3D69C7cFB38D1b5"],
  ] as [VaultDeployer, string][];

  return Object.fromEntries(arr.map(v => [v[0].vaultName(), { deployer: v[0], wantHolder: v[1] }]));
};
