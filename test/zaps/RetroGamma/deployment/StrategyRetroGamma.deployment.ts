import hre, { ethers } from "hardhat";
import {
  // eslint-disable-next-line camelcase
  VaultV7__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  // eslint-disable-next-line camelcase
  IWETH__factory,
  // eslint-disable-next-line camelcase
  RetroGammaZapOneInchPoly__factory,
  // eslint-disable-next-line camelcase
  AccessControlMain__factory,
  StrategyRetroGamma,
  // eslint-disable-next-line camelcase
  StrategyRetroGamma__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { BigNumber } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../scripts/deployment/types";
// eslint-disable-next-line node/no-missing-import
import { earnCommonAddresses, earnImpersonateContracts } from "../../../earn/common/Infra.deployment";
import { getUsdcMaticRetroGammaInitializeParams } from "../../../../scripts/deployment/deployers/polygon/retro-gamma/deployer-retro-gamma-usdc-matic";

export const StrategyRetroGammaDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyRetroGamma = await new StrategyRetroGamma__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyRetroGamma.address, "test", "test", 21600);

  const params = getUsdcMaticRetroGammaInitializeParams({
    vault: vault.address,
    unirouter: "0x1891783cb3497Fdad1F25C933225243c2c7c4102",
    ac: ac.address,
    feeRecipient: "0x7313533ed72D2678bFD9393480D0A30f9AC45c1f",
    feeConfig: "0x8E98004FE65A2eAdA63AD1DE0F5ff76d845f14E7",
  });
  await strategyRetroGamma.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [earnImpersonateContracts.LIDO_POLYGON],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      earnImpersonateContracts.LIDO_POLYGON,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(earnImpersonateContracts.LIDO_POLYGON);
  // eslint-disable-next-line camelcase
  const lido = await ERC20__factory.connect(earnCommonAddresses.tokens.polygon.LIDO, deployer);

  await lido.connect(signer).transfer(deployer.address, await lido.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = await IWETH__factory.connect(earnCommonAddresses.tokens.polygon.WMATIC, deployer);

  const zap = await new RetroGammaZapOneInchPoly__factory(deployer).deploy(
    earnCommonAddresses.ONE_INCH_ROUTER,
    weth.address
  );

  return {
    strategyRetroGamma,
    weth,
    zap,
    stable: lido,
    deployer,
    vault,
  };
};
