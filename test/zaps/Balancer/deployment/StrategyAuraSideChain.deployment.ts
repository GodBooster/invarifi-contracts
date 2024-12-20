import { CommonAddressesAccessableStruct } from "../../../../scripts/deployment/types";
import { StrategyConstructorParams } from "../../../../scripts/deployment/types/strategy-constructor-params";
import {
  BalancerAuraZapOneInchArb__factory,
  BalancerAuraZapOneInchPoly__factory,
  VaultV7__factory,
  ERC20__factory,
  IWETH__factory,
  RetroGammaZapOneInchPoly__factory,
  AccessControlMain__factory,
  StrategyAuraSideChain,
  StrategyAuraSideChain__factory,
} from "../../../../typechain-types";
import hre, { ethers } from "hardhat";
import { earnCommonAddresses, earnImpersonateContracts } from "../../../earn/common/Infra.deployment";
import { BigNumber } from "ethers";
import { arbitrumContracts } from "../../../constants";

// Function: initialize(address, bool, (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], address, uint256, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x9791d590788598535278552EEcD4b211bFc790CB
// 2	_inputIsComposable	bool	true
// 2	_nativeToInputRoute.poolId	bytes32	0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498
// 2	_nativeToInputRoute.assetInIndex	uint256	0
// 2	_nativeToInputRoute.assetOutIndex	uint256	1
// 3	_outputToNativeRoute.poolId	bytes32	0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458
// 3	_outputToNativeRoute.assetInIndex	uint256	0
// 3	_outputToNativeRoute.assetOutIndex	uint256	1
// 4	_outputToNativeRoute.poolId	bytes32	0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001
// 4	_outputToNativeRoute.assetInIndex	uint256	1
// 4	_outputToNativeRoute.assetOutIndex	uint256	2
// 6	_booster	address	0x98Ef32edd24e2c92525E59afc4475C1242a30184
// 7	_pid	uint256	29
// 7	_nativeToInput	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 8	_nativeToInput	address	0x9791d590788598535278552EEcD4b211bFc790CB
// 9	_outputToNative	address	0x912CE59144191C1204E64559FE8253a0e49E6548
// 10	_outputToNative	address	0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8
// 11	_outputToNative	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 12	_commonAddresses.vault	address	0x9603a37C8b1370B5f6B8BdF0A9E6c6F07efb49D3
// 12	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 12	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 12	_commonAddresses.strategist	address	0xfB41Cbf2ce16E8f626013a2F465521d27BA9a610
// 12	_commonAddresses.feeRecipient	address	0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f
// 12	_commonAddresses.feeConfig	address	0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED

export const getwstETH_ETHLpV3Params = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x9791d590788598535278552EEcD4b211bFc790CB",
    true,
    [
      {
        poolId: "0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ],
    [
      {
        poolId: "0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    "0x98Ef32edd24e2c92525E59afc4475C1242a30184",
    29,
    ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", "0x9791d590788598535278552EEcD4b211bFc790CB"],
    [
      "0x912CE59144191C1204E64559FE8253a0e49E6548",
      "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    ],
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraSideChain>;

// Function: initialize(address, bool, (bytes32,uint256,uint256)[], (bytes32,uint256,uint256)[], address, uint256, address[], address[], (address,address,address,address,address,address))
// #	Name	Type	Data
// 1	_want	address	0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B
// 2	_inputIsComposable	bool	true
// 2	_nativeToInputRoute.poolId	bytes32	0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498
// 2	_nativeToInputRoute.assetInIndex	uint256	0
// 2	_nativeToInputRoute.assetOutIndex	uint256	1
// 3	_nativeToInputRoute.poolId	bytes32	0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481
// 3	_nativeToInputRoute.assetInIndex	uint256	1
// 3	_nativeToInputRoute.assetOutIndex	uint256	2
// 4	_outputToNativeRoute.poolId	bytes32	0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001
// 4	_outputToNativeRoute.assetInIndex	uint256	0
// 4	_outputToNativeRoute.assetOutIndex	uint256	1
// 6	_booster	address	0x98Ef32edd24e2c92525E59afc4475C1242a30184
// 7	_pid	uint256	23
// 7	_nativeToInput	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 8	_nativeToInput	address	0x5979D7b546E38E414F7E9822514be443A4800529
// 9	_nativeToInput	address	0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B
// 10	_outputToNative	address	0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8
// 11	_outputToNative	address	0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
// 12	_commonAddresses.vault	address	0x12c997FAdca32dB01E3145DE7Bf9cdB06455391D
// 12	_commonAddresses.unirouter	address	0xBA12222222228d8Ba445958a75a0704d566BF2C8
// 12	_commonAddresses.keeper	address	0x4fED5491693007f0CD49f4614FFC38Ab6A04B619
// 12	_commonAddresses.strategist	address	0xfB41Cbf2ce16E8f626013a2F465521d27BA9a610
// 12	_commonAddresses.feeRecipient	address	0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f
// 12	_commonAddresses.feeConfig	address	0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED

// eslint-disable-next-line camelcase
export const getcbETH_wstETH_rETHParams = (commonParameters: CommonAddressesAccessableStruct) =>
  [
    "0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B",
    true,
    [
      {
        poolId: "0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
      {
        poolId: "0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481",
        assetInIndex: 1,
        assetOutIndex: 2,
      },
    ],
    [
      {
        poolId: "0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001",
        assetInIndex: 0,
        assetOutIndex: 1,
      },
    ],
    "0x98Ef32edd24e2c92525E59afc4475C1242a30184",
    23,
    [
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "0x5979D7b546E38E414F7E9822514be443A4800529",
      "0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B",
    ],
    ["0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
    commonParameters,
  ] as StrategyConstructorParams<StrategyAuraSideChain>;

export const StrategyAuraSideChainDeployment = async () => {
  const [deployer] = await ethers.getSigners();

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  // eslint-disable-next-line camelcase
  const strategyAuraSideChain = await new StrategyAuraSideChain__factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategyAuraSideChain.address, "test", "test", 21600);

  const params = getcbETH_wstETH_rETHParams({
    vault: vault.address,
    unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    ac: ac.address,
    feeRecipient: "0x7313533ed72D2678bFD9393480D0A30f9AC45c1f",
    feeConfig: "0x8E98004FE65A2eAdA63AD1DE0F5ff76d845f14E7",
  });
  await strategyAuraSideChain.initialize(...params);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [arbitrumContracts.tokens.USDC.holder],
  });

  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      arbitrumContracts.tokens.USDC.holder,
      BigNumber.from(ethers.utils.parseEther("1000")).toHexString().replace("0x0", "0x"),
    ],
  });

  const signer = await ethers.getSigner(arbitrumContracts.tokens.USDC.holder);
  // eslint-disable-next-line camelcase
  const usdc = ERC20__factory.connect(arbitrumContracts.tokens.USDC.token, deployer);

  await usdc.connect(signer).transfer(deployer.address, await usdc.balanceOf(signer.address));

  // eslint-disable-next-line camelcase
  const weth = IWETH__factory.connect(arbitrumContracts.tokens.WETH.token, deployer);

  const zap = await new BalancerAuraZapOneInchArb__factory(deployer).deploy(
    earnCommonAddresses.ONE_INCH_ROUTER,
    weth.address
  );

  return {
    strategyAuraSideChain,
    weth,
    zap,
    stable: usdc,
    deployer,
    vault,
  };
};
