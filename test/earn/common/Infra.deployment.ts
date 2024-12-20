import {
  impersonateAccount,
  loadFixture,
  setBalance,
  stopImpersonatingAccount,
} from "@nomicfoundation/hardhat-network-helpers";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import {
  // eslint-disable-next-line camelcase
  AggregatorV3InterfaceTest__factory,
  VaultV7,
  DummyTest__factory,
  EarnConfiguration,
  EarnConfigurationTester__factory,
  EarnPoolCheckerTester__factory,
  // eslint-disable-next-line camelcase
  EarnPoolTester__factory,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  GelatoSwapperTester__factory,
  IUniswapRouterV3WithDeadline,
  IUniswapRouterV3WithDeadline__factory,
  LpHelperBase,
  // eslint-disable-next-line camelcase
  LpHelperTest__factory,
  OneInchTest__factory,
  PriceAggregator,
  // eslint-disable-next-line camelcase
  PriceAggregatorTester__factory,
  AccessControlMain,
  // eslint-disable-next-line camelcase
  AccessControlMain__factory,
  // eslint-disable-next-line camelcase
  StrategyAuraBalancerMultiRewardGaugeUniV3__factory,
  // eslint-disable-next-line camelcase
  StrategyAuraGyroMainnet__factory,
  // eslint-disable-next-line camelcase
  StrategyAuraMainnet__factory,
  StrategyAuraSideChain__factory,
  StrategyBalancerMultiReward__factory,
  // eslint-disable-next-line camelcase
  StrategyCommonChefLP__factory,
  // eslint-disable-next-line camelcase
  StrategyCommonVelodromeGaugeV2__factory,
  // eslint-disable-next-line camelcase
  StrategyConvex__factory,
  // eslint-disable-next-line camelcase
  StrategyCurveConvex__factory,
  StrategyCurveLPUniV3Router__factory,
  StrategyHopCamelot__factory,
  // eslint-disable-next-line camelcase
  StrategyRetroGamma__factory,
  StrategyStargateOpNative__factory,
  // eslint-disable-next-line camelcase
  UniswapV3Tester__factory,
  UniV3TwapOracle,
  // eslint-disable-next-line camelcase
  UniV3TwapOracle__factory,
  VaultV7Test,
} from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { getAccount } from "./common.helpers";
// eslint-disable-next-line node/no-extraneous-import
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import {
  // eslint-disable-next-line camelcase
  getBalancerAuraWSTETH_ETHInitializeParams,
  // eslint-disable-next-line camelcase
  getBalancerAuraWSTETH_RETH_SFRXETHInitializeParams,
  getInitalizeParams,
} from "../../../scripts/deployment/deployers/ethereum/Balancer";
import {
  // eslint-disable-next-line camelcase
  getCurveConvexLDO_ETHParams,
  // eslint-disable-next-line camelcase
  getCurveConvexMIM_DAI_USDC_USDTParams,
  getCurveConvexTriCryptoUSDCParams,
} from "../../../scripts/deployment/deployers/ethereum/Curve";
import { StratFeeManagerAccessableInitializable } from "../../../typechain-types/contracts/strategies/Curve/StrategyConvex";
import { deployVault } from "./vaults.helpers";

import CommonAddressesAccessableStruct = StratFeeManagerAccessableInitializable.CommonAddressesAccessableStruct;
// eslint-disable-next-line camelcase,node/no-missing-import
import { getArbHopETH_LPParams } from "../../../scripts/deployment/deployers/arbitrum/hop/deployer-hop-ETH-LP";
import { getSushiLDP_ETHLpParams } from "../../../scripts/deployment/deployers/ethereum/Sushi";
import {
  AccessControlNotUpgradeableMain,
  AccessControlNotUpgradeableMainInterface,
} from "../../../typechain-types/contracts/utils/access/NotUpgradeable/AccessControlNotUpgradeableMain";
import { arbitrumContracts, baseContracts, optimismContracts } from "../../constants";
import { getwstETH_ETHLpV3Params } from "../../zaps/Balancer/deployment/StrategyAuraSideChain.deployment";
import { get_curveOp_wstETH_ETHLpParams } from "../../zaps/CurveOp/deployment/StrategyCurveLPUniV3Router.deployment";
import { getUsdcMaticRetroGammaInitializeParams } from "../../zaps/RetroGamma/deployment/StrategyRetroGamma.deployment";
import { getStargateOpNativeDeploymentParams } from "../../zaps/Stargate/deployment/StrategyStargateOpNative.deployment";
import { getOpVelodromeVELO_USDCe } from "../../zaps/Velodrome/deployment/StrategyCommonVelodromeGaugeV2.deployment";

export type SwapPath = {
  path: string;
  tokenFrom: string;
  tokenTo: string;
};

export type Constructor<T> = new (...args: any) => T;

type ChainLinkPriceFeed = {
  token: string;
  address: string;
};

type MockChainLinkPriceFeed = {
  token: string;
  initialPrice: number;
};

type UniV3Pool = {
  firstToken: string;
  secondToken: string;
  fee: number;
  address: string;
};

type TwapPriceFeed = {
  token: string;
  uniV3Pool: UniV3Pool;
  // eslint-disable-next-line no-use-before-define
  usdFeed: keyof typeof chainLinkPriceFeeds;
};

// eslint-disable-next-line no-use-before-define
export type ChainLinkPriceFeeds = Record<
  keyof typeof chainLinkPriceFeeds | keyof typeof twapPriceFeeds,
  ChainLinkPriceFeed
>;

export type VaultConfig = {
  // eslint-disable-next-line no-use-before-define
  vault: DeployVaultConfig | VaultV7 | VaultV7Test;
  helper?: keyof typeof lpHelpers;
  part: number;
  id?: number;
  token?: string;
};

export type VaultDeployedConfig = Omit<VaultConfig, "vault"> & {
  vault: VaultV7;
  // eslint-disable-next-line no-use-before-define
  strategyKey: keyof typeof vaults;
};

type InitStrategyParams = {
  unirouter?: string;
};

export type TestVaultConfig = {
  id: number;
  isTest: true;
  token: string;
};
export type DeployVaultConfig<T extends ContractFactory = ContractFactory> =
  | {
      id: number;
      getParams: (commonParams: CommonAddressesAccessableStruct) => unknown[];
      factory: Constructor<T>;
      commonParams: InitStrategyParams;
    }
  | TestVaultConfig;

export type DeployVaultCommonParams = { deployer: SignerWithAddress; ac: AccessControlMain };

export const earnCommonAddresses = {
  tokens: {
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    wstETH: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    LDO: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    DVF: "0xDDdddd4301A082e62E84e43F474f044423921918",
    polygon: {
      LIDO: "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
  },
  UNI_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  ONE_INCH_ROUTER: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  GELATO_AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
} as const;

export const uniV3Pools = {
  USDC_ETH: {
    firstToken: earnCommonAddresses.tokens.USDC,
    secondToken: earnCommonAddresses.tokens.WETH,
    fee: 500,
    address: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
  },
  USDT_ETH: {
    firstToken: earnCommonAddresses.tokens.USDT,
    secondToken: earnCommonAddresses.tokens.WETH,
    fee: 3000,
    address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  },
  wstETH_ETH: {
    firstToken: earnCommonAddresses.tokens.wstETH,
    secondToken: earnCommonAddresses.tokens.WETH,
    fee: 100,
    address: "0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa",
  },
  rETH_ETH: {
    firstToken: earnCommonAddresses.tokens.rETH,
    secondToken: earnCommonAddresses.tokens.WETH,
    fee: 3000,
    address: "0xf0E02Cf61b31260fd5AE527d58Be16312BDA59b1",
  },
  USDC_USDT: {
    firstToken: earnCommonAddresses.tokens.USDC,
    secondToken: earnCommonAddresses.tokens.USDT,
    fee: 500,
    address: "0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf",
  },
  LDO_USDT: {
    firstToken: earnCommonAddresses.tokens.LDO,
    secondToken: earnCommonAddresses.tokens.USDT,
    fee: 3000,
    address: "0xd296B77f1CAD3F0eC64Ae00cdbFa749E24b1f9cb",
  },
  USDT_DVF: {
    firstToken: earnCommonAddresses.tokens.USDT,
    secondToken: earnCommonAddresses.tokens.DVF,
    fee: 3000,
    address: "0x7736B5006d90D5D5c0Ee8148F1Ea07ef82aB1677",
  },
  USDT_WMATIC: {
    firstToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    secondToken: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    fee: 500,
    address: "0x9B08288C3Be4F62bbf8d1C20Ac9C5e6f9467d8B7",
  },
  LDO_WMATIC: {
    firstToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    secondToken: "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756",
    fee: 3000,
    address: "0xD866faC7dB79994D08C0CA2221fee08935595B4B",
  },
  WMATIC_USDC: {
    firstToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    secondToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    fee: 500,
    address: "0xA374094527e1673A86dE625aa59517c5dE346d32",
  },
} as const satisfies Record<string, UniV3Pool>;

export const swapPathes = {
  USDT_TO_WETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDT_ETH.firstToken, uniV3Pools.USDT_ETH.fee, uniV3Pools.USDT_ETH.secondToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDT,
    tokenTo: earnCommonAddresses.tokens.WETH,
  },
  WETH_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDT_ETH.secondToken, uniV3Pools.USDT_ETH.fee, uniV3Pools.USDT_ETH.firstToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.WETH,
    tokenTo: earnCommonAddresses.tokens.USDT,
  },
  USDC_TO_WETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDC_ETH.firstToken, uniV3Pools.USDC_ETH.fee, uniV3Pools.USDC_ETH.secondToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDC,
    tokenTo: earnCommonAddresses.tokens.WETH,
  },
  WETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDC_ETH.secondToken, uniV3Pools.USDC_ETH.fee, uniV3Pools.USDC_ETH.firstToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.WETH,
    tokenTo: earnCommonAddresses.tokens.USDC,
  },
  wstETH_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        uniV3Pools.wstETH_ETH.firstToken,
        uniV3Pools.wstETH_ETH.fee,
        uniV3Pools.wstETH_ETH.secondToken,
        uniV3Pools.USDT_ETH.fee,
        uniV3Pools.USDT_ETH.firstToken,
      ]
    ),
    tokenFrom: earnCommonAddresses.tokens.wstETH,
    tokenTo: earnCommonAddresses.tokens.USDT,
  },
  USDT_TO_wstETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        uniV3Pools.USDT_ETH.firstToken,
        uniV3Pools.USDT_ETH.fee,
        uniV3Pools.wstETH_ETH.secondToken,
        uniV3Pools.wstETH_ETH.fee,
        uniV3Pools.wstETH_ETH.firstToken,
      ]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDT,
    tokenTo: earnCommonAddresses.tokens.wstETH,
  },
  RETH_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        uniV3Pools.rETH_ETH.firstToken,
        uniV3Pools.rETH_ETH.fee,
        uniV3Pools.rETH_ETH.secondToken,
        uniV3Pools.USDT_ETH.fee,
        uniV3Pools.USDT_ETH.firstToken,
      ]
    ),
    tokenFrom: earnCommonAddresses.tokens.rETH,
    tokenTo: earnCommonAddresses.tokens.USDT,
  },
  USDC_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDC_USDT.firstToken, uniV3Pools.USDC_USDT.fee, uniV3Pools.USDC_USDT.secondToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDC,
    tokenTo: earnCommonAddresses.tokens.USDT,
  },
  USDT_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDC_USDT.secondToken, uniV3Pools.USDC_USDT.fee, uniV3Pools.USDC_USDT.firstToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDT,
    tokenTo: earnCommonAddresses.tokens.USDC,
  },
  LDO_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.LDO_USDT.firstToken, uniV3Pools.LDO_USDT.fee, uniV3Pools.LDO_USDT.secondToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.LDO,
    tokenTo: earnCommonAddresses.tokens.USDT,
  },
  USDT_TO_LDO: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.LDO_USDT.secondToken, uniV3Pools.LDO_USDT.fee, uniV3Pools.LDO_USDT.firstToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.USDT,
    tokenTo: earnCommonAddresses.tokens.LDO,
  },
  USDT_TO_WMATIC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDT_WMATIC.secondToken, uniV3Pools.USDT_WMATIC.fee, uniV3Pools.USDT_WMATIC.firstToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.polygon.USDT,
    tokenTo: earnCommonAddresses.tokens.polygon.WMATIC,
  },
  WMATIC_TO_USDT: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [uniV3Pools.USDT_WMATIC.firstToken, uniV3Pools.USDT_WMATIC.fee, uniV3Pools.USDT_WMATIC.secondToken]
    ),
    tokenFrom: earnCommonAddresses.tokens.polygon.WMATIC,
    tokenTo: earnCommonAddresses.tokens.polygon.USDT,
  },
  USDT_TO_USDC_POLYGON: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        uniV3Pools.USDT_WMATIC.secondToken,
        uniV3Pools.USDT_WMATIC.fee,
        uniV3Pools.USDT_WMATIC.firstToken,
        uniV3Pools.WMATIC_USDC.fee,
        uniV3Pools.WMATIC_USDC.secondToken,
      ]
    ),
    tokenFrom: earnCommonAddresses.tokens.polygon.USDT,
    tokenTo: earnCommonAddresses.tokens.polygon.USDC,
  },
  USDC_TO_USDT_POLYGON: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        uniV3Pools.WMATIC_USDC.secondToken,
        uniV3Pools.WMATIC_USDC.fee,
        uniV3Pools.WMATIC_USDC.firstToken,
        uniV3Pools.USDT_WMATIC.fee,
        uniV3Pools.USDT_WMATIC.secondToken,
      ]
    ),
    tokenFrom: earnCommonAddresses.tokens.polygon.USDC,
    tokenTo: earnCommonAddresses.tokens.polygon.USDT,
  },
} as const satisfies Record<string, SwapPath>;

export const chainLinkPriceFeeds = {
  USDT_USD: {
    token: earnCommonAddresses.tokens.USDT,
    address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
  },
  ETH_USD: {
    token: earnCommonAddresses.tokens.WETH,
    address: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  },
  USDC_USD: {
    // initialPrice: 1,
    token: earnCommonAddresses.tokens.USDC,
    // isTest: true,
    address: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
  },
} as const satisfies Record<string, ChainLinkPriceFeed>;

export const mockedChainLinkPriceFeeds = {
  USDT_USD: {
    initialPrice: 1,
    token: earnCommonAddresses.tokens.USDT,
  },
  USDC_USD: {
    initialPrice: 1,
    token: earnCommonAddresses.tokens.USDC,
  },
  ETH_USD: {
    initialPrice: 2000,
    token: earnCommonAddresses.tokens.WETH,
  },
} as const satisfies Partial<
  Record<keyof typeof chainLinkPriceFeeds | keyof typeof twapPriceFeeds, MockChainLinkPriceFeed>
>;

export const twapPriceFeeds = {
  // TODO: fix me
  wstETH_USD: {
    token: earnCommonAddresses.tokens.wstETH,
    uniV3Pool: uniV3Pools.wstETH_ETH,
    usdFeed: "ETH_USD",
  },
  WETH_USDT: {
    token: earnCommonAddresses.tokens.WETH,
    uniV3Pool: uniV3Pools.USDT_ETH,
    usdFeed: "USDT_USD",
  },
  LDO_USDT: {
    token: earnCommonAddresses.tokens.LDO,
    uniV3Pool: uniV3Pools.LDO_USDT,
    usdFeed: "USDT_USD",
  },
  USDC_USDT: {
    token: earnCommonAddresses.tokens.USDC,
    uniV3Pool: uniV3Pools.USDC_USDT,
    usdFeed: "USDT_USD",
  },
  USDT_USDC: {
    token: earnCommonAddresses.tokens.USDT,
    uniV3Pool: uniV3Pools.USDC_USDT,
    usdFeed: "USDT_USD",
  },
  USDT_DVF: {
    token: earnCommonAddresses.tokens.DVF,
    uniV3Pool: uniV3Pools.USDT_DVF,
    usdFeed: "USDC_USD",
  },
} as const satisfies Record<string, TwapPriceFeed>;

export const earnImpersonateContracts = {
  USDT: "0x3D55CCb2a943d88D39dd2E62DAf767C69fD0179F",
  USDC: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  WETH: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
  wstETH: "0x176F3DAb24a159341c0509bB36B833E7fdd0a132",
  gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
  LIDO_POLYGON: "0x71719Ff5a6baF4863B4f1144c2E8d66a1eBad3b1",
  USDT_POLYGON: "0x555e179d64335945Fc6B155B7235a31B0a595542",
} as const;

export const earnImpersonateContractsPolygon = {
  LIDO_POLYGON: "0x71719Ff5a6baF4863B4f1144c2E8d66a1eBad3b1",
  USDT_POLYGON: "0x555e179d64335945Fc6B155B7235a31B0a595542",
};

export const vaults = {
  TestUSDTVault: {
    id: -3,
    isTest: true,
    token: earnCommonAddresses.tokens.USDT,
  },
  TestUSDCVault: {
    id: -2,
    isTest: true,
    token: earnCommonAddresses.tokens.USDC,
  },
  TestWETHVault: {
    id: -1,
    isTest: true,
    token: earnCommonAddresses.tokens.WETH,
  },
  TestwstETHVault: {
    id: -1,
    isTest: true,
    token: earnCommonAddresses.tokens.wstETH,
  },
  AuraWSTETH_RETH_SFRXETH: {
    id: 0,
    commonParams: {
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyAuraMainnet__factory,
    // eslint-disable-next-line camelcase
    getParams: getBalancerAuraWSTETH_RETH_SFRXETHInitializeParams,
  },
  AuraERTH_RETH: {
    id: 1,
    commonParams: {
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyAuraBalancerMultiRewardGaugeUniV3__factory,
    getParams: getInitalizeParams,
  },
  AuraWSTETH_ETH: {
    id: 3,
    commonParams: {
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyAuraGyroMainnet__factory,
    // eslint-disable-next-line camelcase
    getParams: getBalancerAuraWSTETH_ETHInitializeParams,
  },
  CurveConvexMIM_DAI_USDC_USDT: {
    id: 4,
    commonParams: {
      unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyConvex__factory,
    // eslint-disable-next-line camelcase
    getParams: getCurveConvexMIM_DAI_USDC_USDTParams,
  },
  CurveConvexLDO_ETH: {
    id: 5,
    commonParams: {
      unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyConvex__factory,
    // eslint-disable-next-line camelcase
    getParams: getCurveConvexLDO_ETHParams,
  },
  CurveConvexTriCryptoUSDC: {
    id: 6,
    commonParams: {
      unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyCurveConvex__factory,
    getParams: getCurveConvexTriCryptoUSDCParams,
  },
  SushiLDP_ETH: {
    id: 7,
    commonParams: {
      unirouter: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyCommonChefLP__factory,
    // eslint-disable-next-line camelcase
    getParams: getSushiLDP_ETHLpParams,
  },
  RetroGammaUSDC_MATIC: {
    id: 8,
    commonParams: {
      unirouter: "0x1891783cb3497Fdad1F25C933225243c2c7c4102",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyRetroGamma__factory,
    // eslint-disable-next-line camelcase
    getParams: getUsdcMaticRetroGammaInitializeParams,
  },
  ArbHopCamelotETH_LP: {
    id: 9,
    commonParams: {
      unirouter: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyHopCamelot__factory,
    // eslint-disable-next-line camelcase
    getParams: getArbHopETH_LPParams,
  },
  Aura_wstETH_WETH: {
    id: 10,
    commonParams: {
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyAuraSideChain__factory,
    // eslint-disable-next-line camelcase
    getParams: getwstETH_ETHLpV3Params,
  },
  OpStargateEth_LP: {
    id: 12,
    commonParams: {
      unirouter: "0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9",
    },
    factory: StrategyStargateOpNative__factory,
    getParams: getStargateOpNativeDeploymentParams,
  },
  CurveOp_wstETH_ETH: {
    id: 11,
    commonParams: {
      unirouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyCurveLPUniV3Router__factory,
    // eslint-disable-next-line camelcase
    getParams: get_curveOp_wstETH_ETHLpParams,
  },
  Velodrome_VELO_USDC: {
    id: 12,
    commonParams: {
      unirouter: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyCommonVelodromeGaugeV2__factory,
    // eslint-disable-next-line camelcase
    getParams: getOpVelodromeVELO_USDCe,
  },
  Balancer_cbETH_ETH: {
    id: 13,
    commonParams: {
      unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    // eslint-disable-next-line camelcase
    factory: StrategyBalancerMultiReward__factory,
    // eslint-disable-next-line camelcase
    getParams: getBalancercbETH_ETHParams,
  },
} as const satisfies Record<string, DeployVaultConfig>;

export const isTestVaultConfig = (config: DeployVaultConfig): config is TestVaultConfig => {
  return (config as TestVaultConfig).isTest;
};

type LpHelperConfig = {
  // eslint-disable-next-line camelcase
  factory: Constructor<LpHelperTest__factory>;
};

export const lpHelpers = {
  TEST_SINGLE_TOKEN_HELPER: {
    // eslint-disable-next-line camelcase
    factory: LpHelperTest__factory,
  },
} as const satisfies Record<string, LpHelperConfig>;

const isVaultConfig = (vault: VaultConfig["vault"]): vault is DeployVaultConfig => {
  return (vault as TestVaultConfig).isTest || (vault as any).factory !== undefined;
};

const deployVaultsIfNeeded = async (
  vaultConfigs: VaultConfig[],
  commonParams: DeployVaultCommonParams
): Promise<VaultDeployedConfig[]> => {
  for (const config of vaultConfigs) {
    if (!isVaultConfig(config.vault)) continue;
    config.id = config.vault.id;
    config.vault = await deployVault(config.vault, commonParams);
    config.token = await config.vault.want();
  }

  return vaultConfigs.map(v => {
    return {
      ...v,
      strategyKey: Object.keys(vaults).find(k => v.id === vaults[k as keyof typeof vaults].id),
    } as VaultDeployedConfig;
  });
};

export type DeployedTwapFeed = {
  contract: UniV3TwapOracle;
  token: string;
};

const deployUniV3TwapPriceFeeds = async (
  priceFeeds: Record<keyof typeof chainLinkPriceFeeds, ChainLinkPriceFeed>,
  { deployer }: { deployer: SignerWithAddress }
) => {
  const feeds: DeployedTwapFeed[] = [];
  for (const { token, uniV3Pool, usdFeed } of Object.values(twapPriceFeeds)) {
    const feed = await new UniV3TwapOracle__factory(deployer).deploy(
      uniV3Pool.address,
      token,
      priceFeeds[usdFeed].address
    );
    feeds.push({ contract: feed, token });
  }

  return feeds;
};

const deployPriceFeeds = async ({ deployer }: { deployer: SignerWithAddress }) => {
  const feeds: Partial<ChainLinkPriceFeeds> = {};

  for (const [key, { initialPrice, token }] of Object.entries(mockedChainLinkPriceFeeds)) {
    const feed = await new AggregatorV3InterfaceTest__factory(deployer).deploy();
    await feed.setPrice(parseUnits(initialPrice.toString()));
    feeds[key as keyof typeof chainLinkPriceFeeds] = {
      address: feed.address,
      token: token,
    };
  }

  for (const key of Object.keys(chainLinkPriceFeeds)) {
    if (!feeds[key as keyof typeof chainLinkPriceFeeds]) {
      feeds[key as keyof typeof chainLinkPriceFeeds] = chainLinkPriceFeeds[key as keyof typeof chainLinkPriceFeeds];
    }
  }

  return feeds as ChainLinkPriceFeeds;
};

// TODO: move to PC helpers
export const setSwapPathes = async ({ ec, deployer }: { ec: EarnConfiguration; deployer: SignerWithAddress }) => {
  for (const { path, tokenFrom, tokenTo } of Object.values(swapPathes)) {
    await ec.connect(deployer).setSwapPath(tokenFrom, tokenTo, path);
  }
};

// TODO: move to Aggregator helpers
export const setPriceFeeds = async (
  priceFeeds: ChainLinkPriceFeeds,
  twapFeeds: DeployedTwapFeed[],

  { deployer, aggregator }: { aggregator: PriceAggregator; deployer: SignerWithAddress }
) => {
  for (const { address, token } of [
    twapFeeds.map(v => ({ address: v.contract.address, token: v.token })),
    Object.values(priceFeeds),
  ].flat()) {
    await aggregator.connect(deployer).setDataFeedForToken(token, address);
  }
};

const defaultVaultConfigs: VaultConfig[] = [
  // TODO: add more strategies here
  {
    part: 50,
    vault: vaults.AuraWSTETH_RETH_SFRXETH,
  },
  {
    part: 50,
    vault: vaults.AuraERTH_RETH,
  },
];

export const deployLpHelper = async <THelper extends LpHelperBase>(
  helperConfig: LpHelperConfig,
  {
    ec,
    ac,
    deployer,
    uniswapV3,
  }: {
    ac: AccessControlNotUpgradeableMainInterface;
    uniswapV3: IUniswapRouterV3WithDeadline;
    deployer: SignerWithAddress;
    ec: EarnConfiguration;
  }
) => {
  // eslint-disable-next-line new-cap
  const contract = await new helperConfig.factory(deployer).deploy(ec.address, uniswapV3.address, ec.address);
  return contract as any as THelper;
};

export const deployLpHelpers = async ({
  ec,
  ac,
  deployer,
  uniswapV3,
}: {
  ac: AccessControlNotUpgradeableMain;
  uniswapV3: IUniswapRouterV3WithDeadline;
  deployer: SignerWithAddress;
  ec: EarnConfiguration;
}) => {
  // eslint-disable-next-line new-cap
  const helpers: Record<keyof typeof lpHelpers, Contract> = {} as any;

  for (const helperConfigKey in lpHelpers) {
    const key = helperConfigKey as keyof typeof lpHelpers;
    const helperConfig = lpHelpers[key];

    const contract = await new helperConfig.factory(deployer).deploy(ec.address, uniswapV3.address, ac.address);
    helpers[key] = contract;
  }

  return helpers;
};

export type DeployParams = {
  mockUniswap?: boolean;
  mockOneInch?: boolean;
  vaultConfigs?: VaultConfig[];
  setLpHelpers?: boolean;
  usdtAddress?: string;
  wethAddress?: string;
  gelatoAddress?: string;
  unirouter?: string;
};

export async function loadFixtureDeploy(config: DeployParams = {}) {
  const res = await loadFixture(infraDeployment.bind(config));
  await transferImpersonatedTokens(res);
  return res;
}

export const transferImpersonatedTokens = async ({
  uniswapV3,
  deployer,
  mockUniswap,
}: Pick<Awaited<ReturnType<typeof infraDeployment>>, "uniswapV3" | "deployer" | "mockUniswap">) => {
  const tokens = [
    { token: earnCommonAddresses.tokens.WETH, holder: earnImpersonateContracts.WETH },
    { token: earnCommonAddresses.tokens.USDC, holder: earnImpersonateContracts.USDC },
    { token: earnCommonAddresses.tokens.wstETH, holder: earnImpersonateContracts.wstETH },
    { token: earnCommonAddresses.tokens.USDT, holder: earnImpersonateContracts.USDT },
  ];

  await impersonate(tokens, deployer, uniswapV3, mockUniswap);
};

export const transferImpersonatedTokensPolygon = async ({
  uniswapV3,
  deployer,
  mockUniswap,
}: Pick<Awaited<ReturnType<typeof infraDeployment>>, "uniswapV3" | "deployer" | "mockUniswap">) => {
  const tokens = [
    { token: earnCommonAddresses.tokens.polygon.LIDO, holder: earnImpersonateContracts.LIDO_POLYGON },
    { token: earnCommonAddresses.tokens.polygon.USDT, holder: earnImpersonateContracts.USDT_POLYGON },
  ];

  await impersonate(tokens, deployer, uniswapV3, mockUniswap);
};

export const transferImpersonatedTokensArbitrum = async ({
  uniswapV3,
  deployer,
  mockUniswap,
}: Pick<Awaited<ReturnType<typeof infraDeployment>>, "uniswapV3" | "deployer" | "mockUniswap">) => {
  const tokens = [
    { token: arbitrumContracts.tokens.USDC.token, holder: arbitrumContracts.tokens.USDC.holder },
    { token: arbitrumContracts.tokens.WETH.token, holder: arbitrumContracts.tokens.WETH.holder },
  ];

  await impersonate(tokens, deployer, uniswapV3, mockUniswap);
};

export const transferImpersonatedTokensOptimism = async ({
  uniswapV3,
  deployer,
  mockUniswap,
}: Pick<Awaited<ReturnType<typeof infraDeployment>>, "uniswapV3" | "deployer" | "mockUniswap">) => {
  const tokens = [
    { token: optimismContracts.tokens.USDC.token, holder: optimismContracts.tokens.USDC.holder },
    { token: optimismContracts.tokens.WETH.token, holder: optimismContracts.tokens.WETH.holder },
  ];

  await impersonate(tokens, deployer, uniswapV3, mockUniswap);
};

export const transferImpersonatedTokensBase = async ({
  uniswapV3,
  deployer,
  mockUniswap,
}: Pick<Awaited<ReturnType<typeof infraDeployment>>, "uniswapV3" | "deployer" | "mockUniswap">) => {
  const tokens = [
    { token: baseContracts.tokens.USDCDefault.token, holder: baseContracts.tokens.USDCDefault.holder },
    { token: baseContracts.tokens.WETH.token, holder: baseContracts.tokens.WETH.holder },
  ];

  await impersonate(tokens, deployer, uniswapV3, mockUniswap);
};

const impersonate = async (
  tokens: {
    token: string;
    holder: string;
  }[],
  deployer: SignerWithAddress,
  uniswapV3: IUniswapRouterV3WithDeadline,
  mockUniswap: boolean
) => {
  for (const { holder, token } of tokens) {
    await impersonateAccount(holder);
    await setBalance(holder, ethers.utils.parseEther("1000"));

    const _holder = await ethers.getSigner(holder);
    const _token = ERC20__factory.connect(token, _holder);
    await _token.transfer(deployer.address, (await _token.balanceOf(_holder.address)).div(2));

    if (mockUniswap) {
      await _token.transfer(uniswapV3.address, (await _token.balanceOf(_holder.address)).div(2));
    }

    await stopImpersonatingAccount(_holder.address);
  }
};

export type DeploymentReturn = Awaited<ReturnType<typeof infraDeployment>>;

export async function infraDeployment({
  vaultConfigs = defaultVaultConfigs,
  mockUniswap = false,
  mockOneInch = false,
  setLpHelpers = true,
  usdtAddress = earnCommonAddresses.tokens.USDT,
  wethAddress = earnCommonAddresses.tokens.WETH,
  gelatoAddress = earnCommonAddresses.GELATO_AUTOMATE,
  unirouter = earnCommonAddresses.UNI_V3_ROUTER,
}: DeployParams = {}) {
  const [deployer] = await ethers.getSigners();

  // eslint-disable-next-line camelcase
  const usdt = ERC20__factory.connect(usdtAddress, deployer);
  // eslint-disable-next-line camelcase
  const weth = ERC20__factory.connect(wethAddress, deployer);

  const stable = usdt;

  const ac = await new AccessControlMain__factory(deployer).deploy();
  await ac.initialize();

  const aggregator = await new PriceAggregatorTester__factory(deployer).deploy();
  await aggregator.initialize(ac.address);

  let uniswapV3: IUniswapRouterV3WithDeadline;
  let oneInch: string;

  if (mockUniswap) {
    uniswapV3 = await new UniswapV3Tester__factory(deployer).deploy(aggregator.address, stable.address);
  } else {
    // eslint-disable-next-line camelcase
    uniswapV3 = IUniswapRouterV3WithDeadline__factory.connect(unirouter, deployer);
  }

  if (vaultConfigs.reduce((prev, curr) => curr.part + prev, 0) != 100) {
    throw new Error("Invalid vaultConfigs provided");
  }

  const feeRecipient = await new DummyTest__factory(deployer).deploy();

  const priceFeeds = await deployPriceFeeds({ deployer });
  const twapPriceFeeds = await deployUniV3TwapPriceFeeds(priceFeeds, { deployer });
  const vaultDeployedConfigs = await deployVaultsIfNeeded(vaultConfigs, { ac, deployer });

  const parsedVaultConfigs = vaultDeployedConfigs.map(v => ({
    vault: getAccount(v.vault),
    poolPart: parseUnits(v.part.toString()),
  }));

  const usdtDecimals = await usdt.decimals();
  const reservedForAutomation = 100;
  const ec = await new EarnConfigurationTester__factory(deployer).deploy();

  const gelatoSwapper = await new GelatoSwapperTester__factory(deployer).deploy();
  await gelatoSwapper.initialize(uniswapV3.address, swapPathes.USDT_TO_WETH.path);

  await ec.initialize(
    ac.address,
    usdt.address,
    aggregator.address,
    parseUnits(reservedForAutomation.toString(), usdtDecimals),
    feeRecipient.address,
    gelatoSwapper.address
  );

  if (mockOneInch) {
    oneInch = (await new OneInchTest__factory(deployer).deploy(uniswapV3.address, ec.address)).address;
  } else {
    // eslint-disable-next-line camelcase
    oneInch = earnCommonAddresses.ONE_INCH_ROUTER;
  }

  const lpHelpers = await deployLpHelpers({ ec, ac, deployer, uniswapV3 });

  await setSwapPathes({ ec, deployer });
  await setPriceFeeds(priceFeeds, twapPriceFeeds, { aggregator, deployer });

  const earn = await new EarnPoolTester__factory(deployer).deploy();

  const getLpHelper = <T extends Contract>(helper: keyof typeof lpHelpers) => {
    return lpHelpers[helper] as T;
  };

  if (setLpHelpers) {
    for (const { vault, helper } of vaultDeployedConfigs.filter(v => v.helper)) {
      if (!helper) throw new Error("");
      await ec.connect(deployer).setLpHelper(vault.address, getLpHelper(helper).address);
    }
  }

  const earnPoolChecker = await new EarnPoolCheckerTester__factory(deployer).deploy();
  await earnPoolChecker.initialize();

  await earn.initialize(
    ac.address,
    ec.address,
    oneInch,
    wethAddress,
    gelatoAddress,
    earnPoolChecker.address,
    parsedVaultConfigs,
    {
      depositFee: 0,
      withdrawalFee: 0,
    }
  );

  return {
    deployer,
    lpHelpers,
    stable,
    mockUniswap,
    uniswapV3,
    parsedVaultConfigs,
    vaultConfigs: vaultDeployedConfigs,
    reservedForAutomation,
    usdt,
    ac,
    priceFeeds,
    ec,
    earn,
    aggregator,
    twapPriceFeeds,
    feeRecipient,
    getLpHelper,
    gelatoSwapper,
    earnPoolChecker,
    weth,
  };
}
