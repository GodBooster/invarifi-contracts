import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInch__factory,
  ERC20__factory,
  HopZapOneInch__factory,
  IWETH__factory,
  AccessControlMain__factory,
  StrategyHopCamelot__factory,
  StrategyHopSolidly,
  StrategyHopSolidlyUniV3,
  StrategyHopSolidlyUniV3__factory,
} from "../../../../typechain-types";
import { BigNumber } from "ethers";
import { optimismContracts } from "../../../constants";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";

export const StrategyHopSolidlyUniV3OpDeployment = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer", deployer.address);
  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyHop = await new StrategyHopSolidlyUniV3__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyHop.address, "Test4", "Test4", 0);

  const params = [
    "0xF753A50fc755c6622BBCAa0f59F0522f264F006e",
    "0xAeB1b49921E0D2D96FcDBe0D486190B2907B3e0B",
    "0xeC4B41Af04cF917b54AEb6Df58c0f8D78895b5Ef",
    [
      {
        from: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
        to: "0x4200000000000000000000000000000000000006",
        stable: false,
      },
    ],
    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    ["0x4200000000000000000000000000000000000006", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"],
    [500],
    {
      vault: vault.address,
      unirouter: "0x9c12939390052919aF3155f41Bf4160Fd3666A6f",
      ac: ac.address,
      feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
      feeConfig: "0x216EEE15D1e3fAAD34181f66dd0B665f556a638d",
    },
  ] as StrategyConstructorParams<StrategyHopSolidlyUniV3>;

  await strategyHop.initialize(...params);
  console.log("initialized");
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
  const usdt = ERC20__factory.connect("0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(optimismContracts.tokens.WETH.token, deployer);

  const zap = await new HopZapOneInch__factory(deployer).deploy(optimismContracts.oneInchRouter, weth.address);

  return {
    strategyHop,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
    usdt,
  };
};
