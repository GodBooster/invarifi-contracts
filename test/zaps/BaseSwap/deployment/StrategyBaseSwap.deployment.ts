import hre, { ethers } from "hardhat";
import { CommonAddressesAccessableStruct } from "../../../../scripts/deployment/types";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import {
  BaseSwapZapOneInchBase__factory,
  VaultV7__factory,
  ERC20__factory,
  AccessControlMain__factory,
  StrategyBaseSwap,
  StrategyBaseSwap__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { IWETH__factory } from "../../../../typechain-types/factories/contracts/zaps/zapInterfaces";
import { baseContracts } from "../../../constants";

export const get_baseSwap_cbETH_ETHLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x858a8B8143F8A510f663F8EeF31D9bF1Fb4d986F",
    ["0xd5046B976188EB40f6DE40fB527F89c05b323385", "0x4200000000000000000000000000000000000006"],
    ["0x4200000000000000000000000000000000000006", "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22"],
    ["0x4200000000000000000000000000000000000006"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyBaseSwap>;

export const StrategyBaseSwapDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  const strategyBaseSwap = await new StrategyBaseSwap__factory(deployer).deploy();
  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyBaseSwap.address, "name", "symb", 21600);

  const params = get_baseSwap_cbETH_ETHLpParams({
    ac: ac.address,
    unirouter: baseContracts.pancakeRouter,
    vault: vault.address,
    feeConfig: "0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb",
    feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
  });
  await strategyBaseSwap.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [baseContracts.tokens.USDC.holder],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      baseContracts.tokens.USDC.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(baseContracts.tokens.USDC.holder);

  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(baseContracts.tokens.USDC.token, deployer);
  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const cbETH = ERC20__factory.connect(baseContracts.tokens.cbETH.token, deployer);
  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(baseContracts.tokens.WETH.token, deployer);
  const zap = await new BaseSwapZapOneInchBase__factory(deployer).deploy(baseContracts.oneInchRouter, weth.address);

  return {
    strategyBaseSwap,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
    cbETH,
  };
};
