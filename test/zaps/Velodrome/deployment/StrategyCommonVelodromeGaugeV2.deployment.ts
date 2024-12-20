import hre, { ethers } from "hardhat";
import {
  // eslint-disable-next-line camelcase
  VaultV7__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  // eslint-disable-next-line camelcase
  IWETH__factory,
  // eslint-disable-next-line camelcase
  AccessControlMain__factory,
  StrategyCommonVelodromeGaugeV2,
  // eslint-disable-next-line camelcase
  StrategyCommonVelodromeGaugeV2__factory,
  // eslint-disable-next-line camelcase
  VelodromeZapOneInchOp__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { optimismContracts } from "../../../constants";
import { BigNumber } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { CommonAddressesAccessableStruct } from "../../../../scripts/deployment/types";
// eslint-disable-next-line node/no-missing-import
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";

// Function: initialize(address, address, (address,address,address,address,address,address), (address,address,bool,address)[], (address,address,bool,address)[], (address,address,bool,address)[])
// #	Name	Type	Data
// 1	_want	address	0x95a05D06Decf8e1Eb93aE09B612FbD342F2F9E2E
// 2	_gauge	address	0x5B97B8a28bD16E3a46E2baF85a25d946f2bc36CD
// 2	_commonAddresses.vault	address	0xcAa74e50428bDC4Af6A7Ead65fFFf77F0D231E80
// 2	_commonAddresses.unirouter	address	0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858
// 2	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 2	_commonAddresses.strategist	address	0xc41Caa060d1a95B27D161326aAE1d7d831c5171E
// 2	_commonAddresses.feeRecipient	address	0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8
// 2	_commonAddresses.feeConfig	address	0x216EEE15D1e3fAAD34181f66dd0B665f556a638d
// 3	_outputToNativeRoute.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 3	_outputToNativeRoute.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 3	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 4	_outputToNativeRoute.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 4	_outputToNativeRoute.to	address	0x4200000000000000000000000000000000000006
// 4	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 5	_outputToLp0Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 5	_outputToLp0Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 5	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// 6	_outputToLp1Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 6	_outputToLp1Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 6	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000
// 7	_outputToLp1Route.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 7	_outputToLp1Route.to	address	0xC03b43d492d904406db2d7D57e67C7e8234bA752
// 7	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000

export const getOpVelodromeUSDCe_wUSDR = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x95a05D06Decf8e1Eb93aE09B612FbD342F2F9E2E",
    "0x5B97B8a28bD16E3a46E2baF85a25d946f2bc36CD",
    commonParameters,
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0x4200000000000000000000000000000000000006",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0xC03b43d492d904406db2d7D57e67C7e8234bA752",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
  ] as StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>;
//
// Function: initialize(address, address, (address,address,address,address,address,address), (address,address,bool,address)[], (address,address,bool,address)[], (address,address,bool,address)[])
// #	Name	Type	Data
// 1	_want	address	0x8134A2fDC127549480865fB8E5A9E8A8a95a54c5
// 2	_gauge	address	0x84195De69B8B131ddAa4Be4F75633fCD7F430b7c
// 2	_commonAddresses.vault	address	0x746c19A336A3131fD85D3AB5F16576b1b047F512
// 2	_commonAddresses.unirouter	address	0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858
// 2	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 2	_commonAddresses.strategist	address	0xb2e4A61D99cA58fB8aaC58Bb2F8A59d63f552fC0
// 2	_commonAddresses.feeRecipient	address	0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8
// 2	_commonAddresses.feeConfig	address	0x216EEE15D1e3fAAD34181f66dd0B665f556a638d
// 3	_outputToNativeRoute.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 3	_outputToNativeRoute.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 3	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 4	_outputToNativeRoute.from	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 4	_outputToNativeRoute.to	address	0x4200000000000000000000000000000000000006
// 4	_outputToNativeRoute.factory	address	0x0000000000000000000000000000000000000000
// 5	_outputToLp0Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 5	_outputToLp0Route.to	address	0x7F5c764cBc14f9669B88837ca1490cCa17c31607
// 5	_outputToLp0Route.factory	address	0x0000000000000000000000000000000000000000
// 6	_outputToLp1Route.from	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 6	_outputToLp1Route.to	address	0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db
// 6	_outputToLp1Route.factory	address	0x0000000000000000000000000000000000000000

export const getOpVelodromeVELO_USDCe = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x8134A2fDC127549480865fB8E5A9E8A8a95a54c5",
    "0x84195De69B8B131ddAa4Be4F75633fCD7F430b7c",
    commonParameters,
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
      {
        from: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        to: "0x4200000000000000000000000000000000000006",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
    [
      {
        from: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        to: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
        factory: "0x0000000000000000000000000000000000000000",
        stable: false,
      },
    ],
  ] as StrategyConstructorParams<StrategyCommonVelodromeGaugeV2>;

export const StrategyCommonVelodromeGaugeV2Deployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyVelodrome = await new StrategyCommonVelodromeGaugeV2__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();

  await vault.initialize(strategyVelodrome.address, "name", "symb", 21600);

  const params = getOpVelodromeUSDCe_wUSDR({
    vault: vault.address,
    unirouter: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
    ac: ac.address,
    feeRecipient: "0x8237f3992526036787E8178Def36291Ab94638CD",
    feeConfig: "0x3d38BA27974410679afF73abD096D7Ba58870EAd",
  });

  await strategyVelodrome.initialize(...params);

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
  const weth = IWETH__factory.connect(optimismContracts.tokens.WETH.token, deployer);

  const zap = await new VelodromeZapOneInchOp__factory(deployer).deploy(optimismContracts.oneInchRouter, weth.address);

  return {
    strategyVelodrome,
    weth,
    zap,
    stableCoin: usdc,
    deployer,
    vault,
  };
};
