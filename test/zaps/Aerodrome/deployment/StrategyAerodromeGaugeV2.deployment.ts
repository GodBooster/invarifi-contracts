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
  StrategyVelodromeGaugeV2,
  StrategyVelodromeGaugeV2__factory,
  VelodromeZapOneInchOp__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { arbitrumContracts, baseContracts } from "../../../constants";
import { getArbHopETH_LPParams } from "../../../../scripts/deployment/deployers/arbitrum/hop/deployer-hop-ETH-LP";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";

export const StrategyAerodromeDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyAerodrome = await new StrategyVelodromeGaugeV2__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyAerodrome.address, "name", "symb", 0);

  const params = [
    "0xB4885Bc63399BF5518b994c1d0C153334Ee579D0",
    "0xeca7Ff920E7162334634c721133F3183B83B0323",
    {
      vault: vault.address,
      unirouter: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb",
    },
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
    [
      {
        from: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        to: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        stable: false,
        factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      },
    ],
  ] as StrategyConstructorParams<StrategyVelodromeGaugeV2>;
  await strategyAerodrome.initialize(...params);

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
  const weth = IWETH__factory.connect(baseContracts.tokens.WETH.token, deployer);

  const zap = await new VelodromeZapOneInchOp__factory(deployer).deploy(baseContracts.oneInchRouter, weth.address);

  return {
    strategyAerodrome,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
  };
};
