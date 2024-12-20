import hre, { ethers } from "hardhat";
import {
  BalancerAuraZapOneInchArb__factory,
  VaultV7__factory,
  ERC20__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyBalancerMultiReward,
  StrategyBalancerMultiReward__factory,
} from "../../../../typechain-types";

import { BigNumber } from "ethers";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import { baseContracts } from "../../../constants";

export const StrategyBalancerMultiRewardDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyBalancerMultiReward = await new StrategyBalancerMultiReward__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyBalancerMultiReward.address, "test", "test", 0);

  const params = [
    "0xC771c1a5905420DAEc317b154EB13e4198BA97D0",
    true,
    true,
    [
      {
        poolId: "0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ],
    [
      {
        poolId: "0xb328b50f1f7d97ee8ea391ab5096dd7657555f49000100000000000000000048",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0x433f09ca08623e48bac7128b7105de678e37d988000100000000000000000047",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    [
      [
        "0x4158734D47Fc9692176B5085E0F52ee0Da5d47F1",
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "0x4200000000000000000000000000000000000006",
      ],
      ["0x4200000000000000000000000000000000000006", "0xC771c1a5905420DAEc317b154EB13e4198BA97D0"],
    ],
    "0x8D118063B521e0CB9947A934BE90f7e32d02b158",
    {
      vault: vault.address,
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb",
    },
  ] as StrategyConstructorParams<StrategyBalancerMultiReward>;
  await strategyBalancerMultiReward.initialize(...params);

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
  const usdc = await ERC20__factory.connect(baseContracts.tokens.USDC.token, deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = await IWETH__factory.connect(baseContracts.tokens.WETH.token, deployer);

  const zap = await new BalancerAuraZapOneInchArb__factory(deployer).deploy(baseContracts.oneInchRouter, weth.address);

  return {
    strategyBalancerMultiReward,
    weth,
    zap,
    usdc,
    deployer,
    vault,
  };
};
