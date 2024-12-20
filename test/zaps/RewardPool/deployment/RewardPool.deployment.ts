import {
  RewardPool__factory,
  CommonZapOneInch__factory,
  ERC20,
  ERC20__factory,
  IWETH,
  IWETH__factory,
} from "../../../../typechain-types";
import { balancerContracts, balancerImpersonateAccounts } from "../../Balancer.contracts";
import hre, { ethers } from "hardhat";
import { BigNumber } from "ethers";

export const RewardPoolDeployment = async () => {
  const [deployer] = await ethers.getSigners();
  // eslint-disable-next-line camelcase
  const rewardToken = await IWETH__factory.connect(balancerContracts.WETH, deployer);

  // eslint-disable-next-line camelcase
  const stakedToken = await ERC20__factory.connect(balancerContracts.BNB, deployer);

  await impersonateAndTransfer("0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3", deployer.address, rewardToken);

  await impersonateAndTransfer(balancerImpersonateAccounts.BNB, deployer.address, stakedToken);

  // eslint-disable-next-line camelcase
  const stableCoin = await ERC20__factory.connect(balancerContracts.LIDO, deployer);

  await impersonateAndTransfer(balancerImpersonateAccounts.LIDO, deployer.address, stableCoin);

  const rewardPool = await new RewardPool__factory(deployer).deploy(stakedToken.address, rewardToken.address);

  const zap = await new CommonZapOneInch__factory(deployer).deploy(
    balancerContracts.oneInchRouter,
    rewardToken.address
  );

  await rewardToken.connect(deployer).transfer(rewardPool.address, ethers.utils.parseUnits("100"));

  return {
    rewardPool,
    stableCoin,
    stakedToken,
    rewardToken,
    deployer,
    zap,
  };
};

export const impersonateAndTransfer = async (
  addressToImpersonate: string,
  addressToTransfer: string,
  token: ERC20 | IWETH
) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [addressToImpersonate],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [addressToImpersonate, BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x")],
  });

  const signer = await ethers.getSigner(addressToImpersonate);

  await token.connect(signer).transfer(addressToTransfer, await token.balanceOf(signer.address));
};
