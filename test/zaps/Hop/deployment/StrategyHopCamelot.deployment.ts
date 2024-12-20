import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInch__factory,
  ERC20__factory,
  HopZapOneInch__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyHopCamelot__factory,
  StrategyStargateBal__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { arbitrumContracts } from "../../../constants";
import { getArbHopETH_LPParams } from "../../../../scripts/deployment/deployers/arbitrum/hop/deployer-hop-ETH-LP";

export const StrategyHopDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyHop = await new StrategyHopCamelot__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyHop.address, "name", "symb", 21600);

  const params = getArbHopETH_LPParams({
    vault: vault.address,
    unirouter: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
    ac: ac.address,
    feeRecipient: "0x8237f3992526036787E8178Def36291Ab94638CD",
    feeConfig: "0x3d38BA27974410679afF73abD096D7Ba58870EAd",
  });

  await strategyHop.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [arbitrumContracts.tokens.USDC.holder],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      arbitrumContracts.tokens.USDC.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(arbitrumContracts.tokens.USDC.holder);
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(arbitrumContracts.tokens.USDC.token, deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(arbitrumContracts.tokens.WETH.token, deployer);

  const zap = await new HopZapOneInch__factory(deployer).deploy(arbitrumContracts.oneInchRouter, weth.address);

  return {
    strategyHop,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
  };
};
