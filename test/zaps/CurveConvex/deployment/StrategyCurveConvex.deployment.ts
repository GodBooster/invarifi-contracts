import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CurveConvexZapOneInchETH__factory,
  ERC20__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyCurveConvex__factory,
} from "../../../../typechain-types";
import { getCurveConvexTriCryptoUSDCParams } from "../../../../scripts/deployment/deployers/ethereum/Curve";
import { balancerContracts, balancerImpersonateAccounts } from "../../Balancer.contracts";
import { BigNumber } from "ethers";

export const StrategyCurveConvexDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyCurveConvex = await new StrategyCurveConvex__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyCurveConvex.address, "Moo Convex TriCryptoUSDC", "mooConvexTriCryptoUSDC", 21600);

  const params = getCurveConvexTriCryptoUSDCParams({
    vault: vault.address,
    unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    ac: ac.address,
    feeRecipient: "0x8237f3992526036787E8178Def36291Ab94638CD",
    feeConfig: "0x3d38BA27974410679afF73abD096D7Ba58870EAd",
  });
  await strategyCurveConvex.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [balancerImpersonateAccounts.LIDO],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      balancerImpersonateAccounts.LIDO,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(balancerImpersonateAccounts.LIDO);
  // eslint-disable-next-line camelcase
  const usdt = await ERC20__factory.connect(balancerContracts.LIDO, deployer);

  await usdt.connect(signer).transfer(deployer.address, await usdt.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = await IWETH__factory.connect(balancerContracts.WETH, deployer);

  const zap = await new CurveConvexZapOneInchETH__factory(deployer).deploy(
    balancerContracts.oneInchRouter,
    weth.address
  );

  return {
    strategyCurveConvex,
    weth,
    zap,
    stableCoin: usdt,
    deployer,
    vault,
  };
};
