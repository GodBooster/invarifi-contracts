import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInchOp__factory,
  CommonZapOneInch__factory,
  ERC20__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyStargateBridgeBal__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import { baseContracts } from "../../../constants";
import { StrategyStargateBridgeBal } from "../../../../typechain-types/contracts/strategies/Stargate/StrategyStargateBridgeBal.sol/StrategyStargateBridgeBal";

export const StrategyStargateBridgeBalDeployment = async () => {
  const [deployer] = await hre.ethers.getSigners();
  console.log(await ethers.provider.getBalance(deployer.address));
  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyStargateBridge = await new StrategyStargateBridgeBal__factory(deployer).deploy();
  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyStargateBridge.address, "test3", "test3", 0);

  const params = [
    "0x28fc411f9e1c480AD312b3d9C60c22b965015c6B",
    "0xE3B53AF74a4BF62Ae5511055290838050bf764Df",
    0,
    "0x06Eb48763f117c7Be887296CDcdfad2E4092739C",
    "0x50B6EbC2103BFEc165949CC946d739d5650d7ae4",
    0,
    50000000000000000000n,
    "0xC8C86F0A4879A0479554c7599dDe3ef51614996E",
    ["0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d"],
    ["0x4200000000000000000000000000000000000006"],
    {
      vault: vault.address,
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb",
    },
  ] as StrategyConstructorParams<StrategyStargateBridgeBal>;
  await strategyStargateBridge.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [baseContracts.tokens.USDbC.holder],
  });
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      baseContracts.tokens.USDbC.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(baseContracts.tokens.USDbC.holder);

  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(baseContracts.tokens.USDbC.token, deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(baseContracts.tokens.WETH.token, deployer);

  const zap = await new CommonZapOneInch__factory(deployer).deploy(baseContracts.oneInchRouter, weth.address);
  return {
    strategyStargateBridge,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
    usdc,
  };
};
