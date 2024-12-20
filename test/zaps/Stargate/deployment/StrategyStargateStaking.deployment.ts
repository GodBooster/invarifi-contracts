import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInchOp__factory,
  CommonZapOneInch__factory,
  ERC20__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyStargateStakingAvax__factory,
  StrategyStargateStakingAvax,
  FeeConfigurator__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import { avalancheContracts } from "../../../constants";

export const StrategyStargateStakingDeployment = async () => {
  const [deployer] = await hre.ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyStargateStaking = await new StrategyStargateStakingAvax__factory(deployer).deploy();
  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyStargateStaking.address, "test3", "test3", 0);

  const params = [
    "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
    0,
    1,
    "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
    "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
    [
      "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    ],
    ["0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"],
    {
      vault: vault.address,
      unirouter: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0x216EEE15D1e3fAAD34181f66dd0B665f556a638d",
    },
  ] as StrategyConstructorParams<StrategyStargateStakingAvax>;
  await strategyStargateStaking.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [avalancheContracts.tokens.USDT.holder],
  });
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      avalancheContracts.tokens.USDT.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(avalancheContracts.tokens.USDT.holder);
  // eslint-disable-next-line camelcase
  const usdt = ERC20__factory.connect(avalancheContracts.tokens.USDT.token, deployer);
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(avalancheContracts.tokens.USDC.token, deployer);

  await usdt.connect(signer).transfer(deployer.address, await usdt.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const wavax = IWETH__factory.connect(avalancheContracts.tokens.WAVAX.token, deployer);

  const zap = await new CommonZapOneInch__factory(deployer).deploy(avalancheContracts.oneInchRouter, wavax.address);
  return {
    strategyStargateStaking,
    wavax,
    zap,
    stableCoin: usdt,
    deployer,
    vault,
    usdc,
  };
};
