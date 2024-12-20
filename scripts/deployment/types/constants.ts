import { ethers } from "ethers";
import { Network } from "./network-config";

export type SwapPath = {
  path: string;
  type?: "v2" | "v3";
  tokenFrom: string;
  tokenTo: string;
};

export type Constructor<T> = new (...args: any) => T;

export type ChainLinkPriceFeed = {
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

type UniV2Pool = {
  firstToken: string;
  secondToken: string;
  address: string;
};

type UniV2AerodromePool = {
  from: string;
  to: string;
  stable: boolean;
  factory: string;
};

export type TwapPriceFeed<T extends keyof typeof chainLinkPriceFeeds = Network.ETH_MAINNET> = {
  token: string;
  uniV3Pool: UniV3Pool;
  // eslint-disable-next-line no-use-before-define
  usdFeed: keyof (typeof chainLinkPriceFeeds)[T];
};

const encodePathUniV2 = (path: string[]) => {
  return ethers.utils.defaultAbiCoder.encode(["address[]"], [path]);
};

const encodePathUniV2Aerodrome = (pathes: UniV2AerodromePool[]) => {
  return ethers.utils.defaultAbiCoder.encode(
    [
      {
        type: "tuple[]",
        components: [
          // @ts-ignore
          { name: "from", type: "address" },
          // @ts-ignore
          { name: "to", type: "address" },
          // @ts-ignore
          { name: "stable", type: "bool" },
          // @ts-ignore
          { name: "factory", type: "address" },
        ],
      },
    ],
    [pathes]
  );
};

export const earnCommonAddresses = {
  [Network.ETH_MAINNET]: {
    tokens: {
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      wstETH: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393",
      LDO: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    },
  },
  [Network.BSC_MAINNET]: {
    tokens: {
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      WETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    },
  },
  [Network.POLYGON_MAINNET]: {
    tokens: {
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    },
  },
  [Network.ARB_MAINNET]: {
    tokens: {
      USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      USDCe: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
      wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
    },
  },
  [Network.OPTIMISM_MAINNET]: {
    tokens: {
      USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      USDCe: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      VELOV2: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
      WETH: "0x4200000000000000000000000000000000000006",
      OP: "0x4200000000000000000000000000000000000042",
      wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      sUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
      LDO: "0xFdb794692724153d1488CcdBE0C56c252596735F",
    },
  },
  [Network.AVAX_MAINNET]: {
    tokens: {
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDCe: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    },
  },
  [Network.BASE_MAINNET]: {
    tokens: {
      USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      WETH: "0x4200000000000000000000000000000000000006",
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      axlUSDC: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      AERO: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
      DOLA: "0x4621b7A9c75199271F773Ebd9A499dbd165c3191",
      wUSDR: "0x9483ab65847A447e36d21af1CaB8C87e9712ff93",
    },
  },
} as const;

export const uniV2Pools = {
  [Network.AVAX_MAINNET]: {
    USDT_WAVAX: {
      firstToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.WAVAX,
      address: "0xe3bA3d5e3F98eefF5e9EDdD5Bd20E476202770da",
    },
    USDC_WAVAX: {
      firstToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.WAVAX,
      address: "0x0e0100Ab771E9288e0Aa97e11557E6654C3a9665",
    },
    USDCe_WAVAX: {
      firstToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDCe,
      secondToken: earnCommonAddresses[Network.AVAX_MAINNET].tokens.WAVAX,
      address: "0xbd918Ed441767fe7924e99F6a0E0B568ac1970D9",
    },
  },
  [Network.BASE_MAINNET]: {
    WETH_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0xB4885Bc63399BF5518b994c1d0C153334Ee579D0",
    },
    USDC_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD",
    },
    cbETH_WETH: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.cbETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      address: "0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91",
    },
    WETH_axlUSDC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.axlUSDC,
      address: "0xD266fB3E928b2A5f631B072a79Fd5b82704Ba983",
    },
    DAI_WETH: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.DAI,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      address: "0x9287C921f5d920cEeE0d07d7c58d476E46aCC640",
    },
    AERO_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.AERO,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0x2223F9FE624F69Da4D8256A7bCc9104FBA7F8f75",
    },
    DOLA_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.DOLA,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0x0B25c51637c43decd6CC1C1e3da4518D54ddb528",
    },
    wUSDR_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.wUSDR,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0x3Fc28BFac25fC8e93B5b2fc15EfBBD5a8aA44eFe",
    },
  },
} as const satisfies Partial<Record<Network, Record<string, UniV2Pool>>>;

export const uniV2PoolsAerodrome = {
  [Network.BASE_MAINNET]: {
    AERO_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.AERO,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      stable: false,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0x2223F9FE624F69Da4D8256A7bCc9104FBA7F8f75",
    },
    DAI_WETH: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.DAI,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      stable: false,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0x9287C921f5d920cEeE0d07d7c58d476E46aCC640",
    },
    WETH_axlUSDC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.axlUSDC,
      stable: false,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0xD266fB3E928b2A5f631B072a79Fd5b82704Ba983",
    },
    cbETH_WETH: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.cbETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      stable: false,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91",
    },
    USDC_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      stable: true,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD",
    },
    WETH_USDbC: {
      firstToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      stable: false,
      factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
      address: "0xB4885Bc63399BF5518b994c1d0C153334Ee579D0",
    },
  },
} as const satisfies Partial<Record<Network, Record<string, UniV2Pool & { stable: boolean; factory: string }>>>;

export const uniV3Pools = {
  [Network.ETH_MAINNET]: {
    USDT_ETH: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      fee: 3000,
      address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
    },
    wstETH_ETH: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.wstETH,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      fee: 100,
      address: "0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa",
    },
    rETH_ETH: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.rETH,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      fee: 3000,
      address: "0xf0E02Cf61b31260fd5AE527d58Be16312BDA59b1",
    },
    USDC_USDT: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      fee: 500,
      address: "0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf",
    },
    LDO_USDT: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.LDO,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      fee: 3000,
      address: "0xd296B77f1CAD3F0eC64Ae00cdbFa749E24b1f9cb",
    },
    LDO_WETH: {
      firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.LDO,
      secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      fee: 3000,
      address: "0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74",
    },
    // USDT_DVF: {
    //   firstToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    //   secondToken: earnCommonAddresses[Network.ETH_MAINNET].tokens.DVF,
    //   fee: 3000,
    //   address: "0x7736B5006d90D5D5c0Ee8148F1Ea07ef82aB1677",
    // },
  },
  [Network.BSC_MAINNET]: {
    USDT_ETH: {
      firstToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.WETH,
      fee: 500,
      address: "0xBe141893E4c6AD9272e8C04BAB7E6a10604501a5",
    },
    USDT_BNB: {
      firstToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.WBNB,
      fee: 500,
      address: "0x36696169C63e42cd08ce11f5deeBbCeBae652050",
    },
    USDT_CAKE: {
      firstToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.CAKE,
      fee: 2500,
      address: "0x7f51c8AaA6B0599aBd16674e2b17FEc7a9f674A1",
    },
    USDT_BUSD: {
      firstToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.BUSD,
      fee: 100,
      address: "0x4f3126d5DE26413AbDCF6948943FB9D0847d9818",
    },
    USDT_USDC: {
      firstToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDC,
      fee: 100,
      address: "0x92b7807bF19b7DDdf89b706143896d05228f3121",
    },
  },
  [Network.POLYGON_MAINNET]: {
    USDT_USDC: {
      firstToken: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDC,
      fee: 100,
      address: "0xdac8a8e6dbf8c690ec6815e0ff03491b2770255d",
    },
    USDT_WMATIC: {
      firstToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      secondToken: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      fee: 500,
      address: "0x9B08288C3Be4F62bbf8d1C20Ac9C5e6f9467d8B7",
    },
  },
  [Network.ARB_MAINNET]: {
    USDT_WETH: {
      firstToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.WETH,
      fee: 500,
      address: "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
    },
    USDT_ARB: {
      firstToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.ARB,
      fee: 500,
      address: "0xb791ad21ba45c76629003b4a2f04c0d544406e37",
    },
    USDT_USDC: {
      firstToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDC,
      fee: 100,
      address: "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6",
    },
    USDT_USDCe: {
      firstToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDCe,
      fee: 100,
      address: "0x8c9d230d45d6cfee39a6680fb7cb7e8de7ea8e71",
    },
    wstETH_WETH: {
      firstToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.wstETH,
      secondToken: earnCommonAddresses[Network.ARB_MAINNET].tokens.WETH,
      fee: 100,
      address: "0x35218a1cbac5bbc3e57fd9bd38219d37571b3537",
    },
  },
  [Network.OPTIMISM_MAINNET]: {
    USDC_ETH: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      fee: 500,
      address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
    },
    wstETH_ETH: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.wstETH,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      fee: 100,
      address: "0x04F6C85A1B00F6D9B75f91FD23835974Cc07E65c",
    },
    WETH_USDCe: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDCe,
      fee: 500,
      address: "0x85149247691df622eaf1a8bd0cafd40bc45154a9",
    },
    WETH_VELOV2: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.VELOV2,
      fee: 10000,
      address: "0x0Fb07E6d6E1F52c839608E1436d2EA810cf07257",
    },
    USDC_USDT: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDC,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      fee: 100,
      address: "0xF1F199342687A7d78bCC16fce79fa2665EF870E1",
    },
    USDT_WETH: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      fee: 500,
      address: "0xc858A329Bf053BE78D6239C4A4343B8FbD21472b",
    },
    USDT_DAI: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.DAI,
      fee: 100,
      address: "0x8323d063b1d12acce4742f1e3ed9bc46d71f4222",
    },
    sUSD_USDCe: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDCe,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.sUSD,
      fee: 100,
      address: "0x252cBDff917169775Be2b552eC9f6781aF95e7F6",
    },
    WETH_OP: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.OP,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      fee: 3000,
      address: "0x68F5C0A2DE713a54991E01858Fd27a3832401849",
    },
    LDO_WETH: {
      firstToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.LDO,
      secondToken: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      fee: 3000,
      address: "0x8cd60b906ec0fa4e59f5489e5168df1f4f933547",
    },
  },
} as const satisfies Partial<Record<Network, Record<string, UniV3Pool>>>;

export const swapPathes = {
  [Network.ETH_MAINNET]: {
    USDT_TO_WETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
    },
    WETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.secondToken,
          3000,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    },
    wstETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.secondToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.wstETH,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    },
    USDT_TO_wstETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.secondToken,
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].wstETH_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.wstETH,
    },
    RETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].rETH_ETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].rETH_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].rETH_ETH.secondToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.rETH,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    },
    USDC_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.firstToken,
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.fee,
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    },
    USDT_TO_USDC: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.secondToken,
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.fee,
          uniV3Pools[Network.ETH_MAINNET].USDC_USDT.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDC,
    },
    LDO_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].LDO_WETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].LDO_WETH.fee,
          uniV3Pools[Network.ETH_MAINNET].LDO_WETH.secondToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.LDO,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
    },
    USDT_TO_LDO: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.firstToken,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.ETH_MAINNET].USDT_ETH.secondToken,
          uniV3Pools[Network.ETH_MAINNET].LDO_WETH.fee,
          uniV3Pools[Network.ETH_MAINNET].LDO_WETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ETH_MAINNET].tokens.LDO,
    },
  },
  [Network.BSC_MAINNET]: {
    USDT_TO_WETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.firstToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.WETH,
    },
    WETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.secondToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.WETH,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
    },
    USDT_TO_WBNB: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.firstToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.WBNB,
    },
    WBNB_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.secondToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_BNB.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.WBNB,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
    },
    USDT_TO_CAKE: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.firstToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.CAKE,
    },
    CAKE_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.secondToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_CAKE.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.CAKE,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
    },
    USDT_TO_BUSD: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.firstToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.BUSD,
    },
    BUSD_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.secondToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_BUSD.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.BUSD,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
    },
    USDT_TO_USDC: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.firstToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDC,
    },
    USDC_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.secondToken,
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.BSC_MAINNET].USDT_USDC.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
    },
  },
  [Network.POLYGON_MAINNET]: {
    USDT_TO_USDC: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.firstToken,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDC,
    },
    USDC_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.secondToken,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_USDC.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
    },
    MATIC_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.WMATIC,
      tokenTo: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.firstToken,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.fee,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.secondToken,
        ]
      ),
    },
    USDT_TO_MATIC: {
      tokenFrom: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.WMATIC,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.secondToken,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.fee,
          uniV3Pools[Network.POLYGON_MAINNET].USDT_WMATIC.firstToken,
        ]
      ),
    },
  },
  [Network.ARB_MAINNET]: {
    USDT_TO_USDCe: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.firstToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDCe,
    },
    USDCe_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.secondToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDCe.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDCe,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
    },
    USDT_TO_USDC: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.firstToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDC,
    },
    USDC_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.secondToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_USDC.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
    },
    USDT_TO_ARB: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.firstToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.ARB,
    },
    ARB_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.secondToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_ARB.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.ARB,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
    },
    USDT_TO_WETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.WETH,
    },
    WETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.WETH,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
    },
    wstETH_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.ARB_MAINNET].tokens.wstETH,
      tokenTo: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.ARB_MAINNET].wstETH_WETH.firstToken,
          uniV3Pools[Network.ARB_MAINNET].wstETH_WETH.fee,
          uniV3Pools[Network.ARB_MAINNET].wstETH_WETH.secondToken,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.ARB_MAINNET].USDT_WETH.firstToken,
        ]
      ),
    },
  },
  [Network.OPTIMISM_MAINNET]: {
    // USDC_TO_WETH: {
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address"],
    //     [
    //       optimismUniV3Pools.USDC_ETH.firstToken,
    //       optimismUniV3Pools.USDC_ETH.fee,
    //       optimismUniV3Pools.USDC_ETH.secondToken,
    //     ]
    //   ),
    //   tokenFrom: optimismContracts.tokens.USDC.token,
    //   tokenTo: optimismContracts.tokens.WETH.token,
    // },
    // WETH_TO_USDC: {
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address"],
    //     [
    //       optimismUniV3Pools.USDC_ETH.secondToken,
    //       optimismUniV3Pools.USDC_ETH.fee,
    //       optimismUniV3Pools.USDC_ETH.firstToken,
    //     ]
    //   ),
    //   tokenFrom: optimismContracts.tokens.WETH.token,
    //   tokenTo: optimismContracts.tokens.USDC.token,
    // },
    // USDCe_TO_USDC: {
    //   tokenFrom: optimismContracts.tokens.USDCe.token,
    //   tokenTo: optimismContracts.tokens.USDC.token,
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address", "uint24", "address"],
    //     [
    //       optimismUniV3Pools.WETH_USDCe.secondToken,
    //       optimismUniV3Pools.WETH_USDCe.fee,
    //       optimismUniV3Pools.WETH_USDCe.firstToken,
    //       optimismUniV3Pools.WETH_USDCe.fee,
    //       optimismUniV3Pools.WETH_USDCe.secondToken,
    //     ]
    //   ),
    // },
    // // WETH_TO_VELOV2: {
    // //   tokenFrom: optimismContracts.tokens.WETH.token,
    // //   tokenTo: optimismContracts.tokens.VELOV2.token,
    // //   path: ethers.utils.solidityPack(
    // //     ["address", "uint24", "address"],
    // //     [
    // //       optimismUniV3Pools.WETH_VELOV2.firstToken,
    // //       optimismUniV3Pools.WETH_VELOV2.fee,
    // //       optimismUniV3Pools.WETH_VELOV2.secondToken,
    // //     ]
    // //   ),
    // // },
    // USDC_TO_VELO2: {
    //   tokenFrom: optimismContracts.tokens.USDC.token,
    //   tokenTo: optimismContracts.tokens.VELOV2.token,
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address", "uint24", "address"],
    //     [
    //       optimismUniV3Pools.USDC_ETH.firstToken,
    //       optimismUniV3Pools.USDC_ETH.fee,
    //       optimismUniV3Pools.USDC_ETH.secondToken,
    //       optimismUniV3Pools.WETH_VELOV2.fee,
    //       optimismUniV3Pools.WETH_VELOV2.secondToken,
    //     ]
    //   ),
    // },
    // VELO_TO_USDC: {
    //   tokenFrom: optimismContracts.tokens.VELOV2.token,
    //   tokenTo: optimismContracts.tokens.USDC.token,
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address", "uint24", "address"],
    //     [
    //       optimismUniV3Pools.WETH_VELOV2.secondToken,
    //       optimismUniV3Pools.WETH_VELOV2.fee,
    //       optimismUniV3Pools.WETH_VELOV2.firstToken,
    //       optimismUniV3Pools.USDC_ETH.fee,
    //       optimismUniV3Pools.USDC_ETH.firstToken,
    //     ]
    //   ),
    // },
    // wstETH_TO_USDC: {
    //   path: ethers.utils.solidityPack(
    //     ["address", "uint24", "address", "uint24", "address"],
    //     [
    //       uniV3Pools.wstETH_ETH.firstToken,
    //       optimismUniV3Pools.wstETH_ETH.fee,
    //       optimismUniV3Pools.wstETH_ETH.secondToken,
    //       optimismUniV3Pools.USDC_ETH.fee,
    //       optimismUniV3Pools.USDC_ETH.firstToken,
    //     ]
    //   ),
    //   tokenFrom: optimismContracts.tokens.wstETH.token,
    //   tokenTo: optimismContracts.tokens.USDC.token,
    // },
    wstETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].wstETH_ETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].wstETH_ETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].wstETH_ETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.wstETH,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
    },
    USDT_TO_USDC: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDC_ETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDC_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDC,
    },
    USDC_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDC_ETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDC_ETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDC_ETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
    },
    USDT_TO_wstETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].wstETH_ETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].wstETH_ETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.wstETH,
    },
    WETH_TO_USDT: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
    },
    USDT_TO_WETH: {
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
        ]
      ),
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.WETH,
    },
    USDT_TO_VELOV2: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.VELOV2,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_VELOV2.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_VELOV2.secondToken,
        ]
      ),
    },
    VELOV2_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.VELOV2,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_VELOV2.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_VELOV2.secondToken,
        ]
      ),
    },
    USDCe_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDCe,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
    },
    USDT_TO_USDCe: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDCe,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.secondToken,
        ]
      ),
    },
    USDT_TO_DAI: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.DAI,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.secondToken,
        ]
      ),
    },
    DAI_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.DAI,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_DAI.firstToken,
        ]
      ),
    },
    OP_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.OP,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_OP.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_OP.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_OP.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
    },
    USDT_TO_OP: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.OP,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_OP.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_OP.firstToken,
        ]
      ),
    },
    sUSD_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.sUSD,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].sUSD_USDCe.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].sUSD_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].sUSD_USDCe.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
    },
    USDT_TO_sUSD: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.sUSD,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].WETH_USDCe.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].sUSD_USDCe.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].sUSD_USDCe.secondToken,
        ]
      ),
    },
    LDO_TO_USDT: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.LDO,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].LDO_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].LDO_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].LDO_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
        ]
      ),
    },
    USDT_TO_LDO: {
      tokenFrom: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.LDO,
      path: ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.firstToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].USDT_WETH.secondToken,
          uniV3Pools[Network.OPTIMISM_MAINNET].LDO_WETH.fee,
          uniV3Pools[Network.OPTIMISM_MAINNET].LDO_WETH.firstToken,
        ]
      ),
    },
  },
  [Network.AVAX_MAINNET]: {
    USDT_TO_USDC: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
        uniV2Pools[Network.AVAX_MAINNET].USDC_WAVAX.firstToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDC,
    },
    USDC_TO_USDT: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDC_WAVAX.firstToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
    },
    USDT_TO_USDCe: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
        uniV2Pools[Network.AVAX_MAINNET].USDCe_WAVAX.firstToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDCe,
    },
    USDCe_TO_USDT: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDCe_WAVAX.firstToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDCe,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
    },
    USDT_TO_WAVAX: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.WAVAX,
    },
    WAVAX_TO_USDT: {
      path: encodePathUniV2([
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.secondToken,
        uniV2Pools[Network.AVAX_MAINNET].USDT_WAVAX.firstToken,
      ]),
      tokenFrom: earnCommonAddresses[Network.AVAX_MAINNET].tokens.WAVAX,
      tokenTo: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
    },
  },
  [Network.BASE_MAINNET]: {
    WETH_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_WETH: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.WETH,
    },
    USDC_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_USDC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].USDC_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDC,
    },
    cbETH_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.cbETH,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_cbETH: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].cbETH_WETH.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.cbETH,
    },
    axlUSDC_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.axlUSDC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_axlUSDC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_axlUSDC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.axlUSDC,
    },
    DAI_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.DAI,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_DAI: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].WETH_USDbC.factory,
        },
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].DAI_WETH.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.DAI,
    },
    AERO_TO_USDbC: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.firstToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.secondToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.AERO,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    },
    USDbC_TO_AERO: {
      path: encodePathUniV2Aerodrome([
        {
          from: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.secondToken,
          to: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.firstToken,
          stable: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.stable,
          factory: uniV2PoolsAerodrome[Network.BASE_MAINNET].AERO_USDbC.factory,
        },
      ]),
      tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.AERO,
    },
    // DOLA_TO_USDbC: {
    //   path: encodePathUniV2([
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].DOLA_USDbC.firstToken,
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].DOLA_USDbC.secondToken,
    //   ]),
    //   tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.DOLA,
    //   tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    // },
    // USDbC_TO_DOLA: {
    //   path: encodePathUniV2([
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].DOLA_USDbC.secondToken,
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].DOLA_USDbC.firstToken,
    //   ]),
    //   tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    //   tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.DOLA,
    // },
    // wUSDR_TO_USDbC: {
    //   path: encodePathUniV2([
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].wUSDR_USDbC.firstToken,
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].wUSDR_USDbC.secondToken,
    //   ]),
    //   tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.wUSDR,
    //   tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    // },
    // USDbC_TO_wUSDR: {
    //   path: encodePathUniV2([
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].wUSDR_USDbC.secondToken,
    //     uniV2PoolsAerodrome[Network.BASE_MAINNET].wUSDR_USDbC.firstToken,
    //   ]),
    //   tokenFrom: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
    //   tokenTo: earnCommonAddresses[Network.BASE_MAINNET].tokens.wUSDR,
    // },
  },
} as const satisfies Partial<Record<Network, Record<string, SwapPath>>>;

export const chainLinkPriceFeeds = {
  [Network.ETH_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDT,
      address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
    },
    ETH_USD: {
      token: earnCommonAddresses[Network.ETH_MAINNET].tokens.WETH,
      address: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    },
    USDC_USD: {
      // initialPrice: 1,
      token: earnCommonAddresses[Network.ETH_MAINNET].tokens.USDC,
      // isTest: true,
      address: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
    },
  },
  [Network.BSC_MAINNET]: {
    CAKE_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.CAKE,
      address: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
    },
    USDT_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDT,
      address: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
    },
    USDC_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.USDC,
      address: "0x51597f405303c4377e36123cbc172b13269ea163",
    },
    BNB_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.WBNB,
      address: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
    },
    ETH_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.WETH,
      address: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
    },
    BUSD_USD: {
      token: earnCommonAddresses[Network.BSC_MAINNET].tokens.BUSD,
      address: "0xcbb98864ef56e9042e7d2efef76141f15731b82f",
    },
  },
  [Network.POLYGON_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDT,
      address: "0x0a6513e40db6eb1b165753ad52e80663aea50545",
    },
    USDC_USD: {
      token: earnCommonAddresses[Network.POLYGON_MAINNET].tokens.USDC,
      address: "0xfe4a8cc5b5b2366c1b58bea3858e81843581b2f7",
    },
  },
  [Network.ARB_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      address: "0x3f3f5df88dc9f13eac63df89ec16ef6e7e25dde7",
    },
    ARB_USD: {
      token: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDT,
      address: "0x3f3f5df88dc9f13eac63df89ec16ef6e7e25dde7",
    },
    USDCe_USD: {
      token: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDCe,
      address: "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3",
    },
    USDC_USD: {
      token: earnCommonAddresses[Network.ARB_MAINNET].tokens.USDC,
      address: "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3",
    },
    WETH_USD: {
      token: earnCommonAddresses[Network.ARB_MAINNET].tokens.WETH,
      address: "0x2e2147bCd571CE816382485E59Cd145A2b7CA451",
    },
  },
  [Network.OPTIMISM_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.OPTIMISM_MAINNET].tokens.USDT,
      address: "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E",
    },
  },
  [Network.AVAX_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.AVAX_MAINNET].tokens.USDT,
      address: "0xebe676ee90fe1112671f19b6b7459bc678b67e8a",
    },
  },
  [Network.BASE_MAINNET]: {
    USDT_USD: {
      token: earnCommonAddresses[Network.BASE_MAINNET].tokens.USDbC,
      address: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    },
  },
} as const satisfies Partial<Record<Network, Record<string, ChainLinkPriceFeed>>>;

export const twapPriceFeeds = {
  [Network.ETH_MAINNET]: {
    wstETH_USD: {
      token: earnCommonAddresses[Network.ETH_MAINNET].tokens.wstETH,
      uniV3Pool: uniV3Pools[Network.ETH_MAINNET].wstETH_ETH,
      usdFeed: "ETH_USD",
    },
    LDO_USD: {
      token: earnCommonAddresses[Network.ETH_MAINNET].tokens.LDO,
      uniV3Pool: uniV3Pools[Network.ETH_MAINNET].LDO_WETH,
      usdFeed: "ETH_USD",
    },
  } as Record<string, TwapPriceFeed<Network.ETH_MAINNET>>,
} as const;
