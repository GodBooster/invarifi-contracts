import hre, { ethers } from "hardhat";
import {
  VaultV7__factory,
  CommonZapOneInch__factory,
  CurveZapOneInchOp__factory,
  ERC20__factory,
  AccessControlMain__factory,
  StrategyCurveLPUniV3Router,
  StrategyCurveLPUniV3Router__factory,
} from "../../../../typechain-types";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import { optimismContracts } from "../../../constants";
import { BigNumber } from "ethers";
import { IWETH__factory } from "../../../../typechain-types/factories/contracts/zaps/zapInterfaces";
import { CommonAddressesAccessableStruct } from "../../../../scripts/deployment/types";
import {
  getOpCurveMIM_DAI_USDCe_USDTParams,
  getOpCurveSETH_ETH_Params,
} from "../../../../scripts/deployment/deployers/optimism/curve";

export const get_curveOp_wstETH_ETHLpParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0xEfDE221f306152971D8e9f181bFe998447975810",
    "0xabC000d88f23Bb45525E447528DBF656A9D55bf5",
    "0xD53cCBfED6577d8dc82987e766e75E3cb73a8563",
    "0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415",
    [2, 0, 0, 0],
    [
      "0x0994206dfe8de6ec6920ff4d779b0d950605fb53000bb84200000000000000000000000000000000000006",
      "0x4200000000000000000000000000000000000006000bb84200000000000000000000000000000000000006",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyCurveLPUniV3Router>;

export const StrategyCurveLPUniV3RouterDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  const strategyCurveLPUniV3Router = await new StrategyCurveLPUniV3Router__factory(deployer).deploy();
  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyCurveLPUniV3Router.address, "name", "symb", 21600);

  const params = getOpCurveMIM_DAI_USDCe_USDTParams({
    ac: ac.address,
    unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    vault: vault.address,
    feeConfig: "0x216EEE15D1e3fAAD34181f66dd0B665f556a638d",
    feeRecipient: "0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B",
  });
  await strategyCurveLPUniV3Router.initialize(...params);
  await strategyCurveLPUniV3Router.setDepositNative(true);

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
  // eslint-disable-next-line camelcase
  const USDCe = ERC20__factory.connect(optimismContracts.tokens.USDCe.token, deployer);

  const zap = await new CurveZapOneInchOp__factory(deployer).deploy(optimismContracts.oneInchRouter, weth.address);

  return {
    strategyCurveLPUniV3Router,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
    tokenOut,
    USDCe,
  };
};
