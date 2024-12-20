import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInch__factory,
  ERC20__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyStargateOp,
  StrategyStargateOp__factory,
} from "../../../../typechain-types";
import { balancerContracts, balancerImpersonateAccounts } from "../../Balancer.contracts";
import { BigNumber } from "ethers";
import { getStargateETH_LPParams } from "../../../../scripts/deployment/deployers/ethereum/Stargate";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import { optimismContracts } from "../../../constants";

export const StrategyStargateOpDeployment = async () => {
  const [deployer] = await hre.ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyStargateOp = await new StrategyStargateOp__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyStargateOp.address, "test2", "test2", 0);

  const params = [
    "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298",
    0,
    "0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2",
    "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    1,
    {
      vault: vault.address,
      unirouter: "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0x216EEE15D1e3fAAD34181f66dd0B665f556a638d",
    },
    [["0x4200000000000000000000000000000000000042", "0x4200000000000000000000000000000000000006"]],
    [["0x4200000000000000000000000000000000000042", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"]],
    [[false], [false]],
  ] as StrategyConstructorParams<StrategyStargateOp>;
  await strategyStargateOp.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [optimismContracts.tokens.USDC.holder],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      optimismContracts.tokens.USDC.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(optimismContracts.tokens.USDC.holder);
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(optimismContracts.tokens.USDC.token, deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));
  // eslint-disable-next-line camelcase
  const tokenOut = ERC20__factory.connect("0x7F5c764cBc14f9669B88837ca1490cCa17c31607", deployer);

  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(optimismContracts.tokens.WETH.token, deployer);

  const zap = await new CommonZapOneInch__factory(deployer).deploy(optimismContracts.oneInchRouter, weth.address);

  return {
    strategyStargateOp,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
    tokenOut,
  };
};
