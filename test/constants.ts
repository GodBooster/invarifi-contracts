import { ethers } from "hardhat";

export const arbitrumContracts = {
  tokens: {
    USDC: {
      holder: "0xe68ee8a12c611fd043fb05d65e1548dc1383f2b9",
      token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
    WETH: {
      token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      holder: "0x1eed63efba5f81d95bfe37d82c8e736b974f477b",
    },
    wstETH: {
      token: "0x5979D7b546E38E414F7E9822514be443A4800529",
      holder: "0x916792f7734089470de27297903bed8a4630b26d",
    },
  },

  oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
} as const;

export const optimismContracts = {
  tokens: {
    USDC: {
      holder: "0xf491d040110384dbcf7f241ffe2a546513fd873d",
      token: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    },
    USDCe: {
      token: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      holder: "0x85149247691df622eaf1a8bd0cafd40bc45154a9",
    },
    VELOV2: {
      token: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
      holder: "0xebe80f029b1c02862b9e8a70a7e5317c06f62cae",
    },
    WETH: {
      token: "0x4200000000000000000000000000000000000006",
      holder: "0x6da98bde0068d10ddd11b468b197ea97d96f96bc",
    },
    wstETH: {
      token: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
      holder: "0xba12222222228d8ba445958a75a0704d566bf2c8",
    },
    sETH: {
      token: "0xe405de8f52ba7559f9df3c368500b6e6ae6cee49",
    },
    DAI: {
      token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      holder: "0x1eed63efba5f81d95bfe37d82c8e736b974f477b",
    },
  },

  oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  gelato: "0x340759c8346A1E6Ed92035FB8B6ec57cE1D82c2c",
} as const;

export const avalancheContracts = {
  tokens: {
    USDC: {
      token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      holder: "0x7E4aA755550152a522d9578621EA22eDAb204308",
    },
    WETH: {
      token: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
      holder: "0x7B7B957c284C2C227C980d6E2F804311947b84d0",
    },
    wstETH: {
      token: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
      holder: "0xba12222222228d8ba445958a75a0704d566bf2c8",
    },
    DAI: {
      token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      holder: "0x1eed63efba5f81d95bfe37d82c8e736b974f477b",
    },
    USDT: {
      token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      holder: "0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8",
    },
    WAVAX: {
      token: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      holder: "0xbf0018390Dca012FabF38Ef8188184d0B18960Ac",
    },
  },

  oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  gelato: "0x8aB6aDbC1fec4F18617C9B889F5cE7F28401B8dB",
} as const;

export const baseContracts = {
  tokens: {
    USDC: {
      token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      holder: "0x20fe51a9229eef2cf8ad9e89d91cab9312cf3b7a",
    },
    USDbC: {
      token: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      holder: "0x4c80e24119cfb836cdf0a6b53dc23f04f7e652ca",
    },
    WETH: {
      token: "0x4200000000000000000000000000000000000006",
      holder: "0x428ab2ba90eba0a4be7af34c9ac451ab061ac010",
    },
    wstETH: {
      token: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
      holder: "0xba12222222228d8ba445958a75a0704d566bf2c8",
    },
    DAI: {
      token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      holder: "0x1eed63efba5f81d95bfe37d82c8e736b974f477b",
    },
    USDT: {
      token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      holder: "0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8",
    },
    USDCDefault: {
      token: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      holder: "0x13a13869b814be8f13b86e9875ab51bda882e391",
    },
    axlUSDC: {
      token: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
      holder: "0xaca85874d52e3e6d991f9e0b273a96228edfee7b",
    },
    cbETH: {
      token: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      holder: "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
    },
  },
  oneInchRouter: "0x1111111254eeb25477b68fb85ed929f73a960582",
  pancakeRouter: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
  uniswapV3Router: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
  gelato: "",
} as const;

export const arbitrumUniV3Pools = {
  USDC_ETH: {
    firstToken: arbitrumContracts.tokens.USDC.token,
    secondToken: arbitrumContracts.tokens.WETH.token,
    fee: 3000,
    address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  },

  wstETH_ETH: {
    firstToken: arbitrumContracts.tokens.wstETH.token,
    secondToken: arbitrumContracts.tokens.WETH.token,
    fee: 100,
    address: "0x35218a1cbac5bbc3e57fd9bd38219d37571b3537",
  },
};

export const baseUniV3Pools = {
  USDC_ETH: {
    firstToken: baseContracts.tokens.USDCDefault.token,
    secondToken: baseContracts.tokens.WETH.token,
    fee: 500,
    address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  },
  USDCDefault_USDC: {
    firstToken: baseContracts.tokens.USDCDefault.token,
    secondToken: baseContracts.tokens.USDC.token,
    fee: 100,
    address: "0x06959273E9A65433De71F5A452D529544E07dDD0",
  },
  axlUSDC_USDC: {
    firstToken: baseContracts.tokens.axlUSDC.token,
    secondToken: baseContracts.tokens.USDC.token,
    fee: 100,
    address: "0x06959273E9A65433De71F5A452D529544E07dDD0",
  },
  ETH_USDC: {
    firstToken: baseContracts.tokens.WETH.token,
    secondToken: baseContracts.tokens.USDCDefault.token,
    fee: 500,
    address: "0x35218a1cbac5bbc3e57fd9bd38219d37571b3537",
  },
  cbETH_USDC: {
    firstToken: baseContracts.tokens.cbETH.token,
    secondToken: baseContracts.tokens.USDCDefault.token,
    fee: 500,
    address: "0x35218a1cbac5bbc3e57fd9bd38219d37571b3537",
  },
};

export const optimismUniV3Pools = {
  USDC_ETH: {
    firstToken: optimismContracts.tokens.USDC.token,
    secondToken: optimismContracts.tokens.WETH.token,
    fee: 3000,
    address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  },
  wstETH_ETH: {
    firstToken: optimismContracts.tokens.wstETH.token,
    secondToken: optimismContracts.tokens.WETH.token,
    fee: 100,
    address: "0x04F6C85A1B00F6D9B75f91FD23835974Cc07E65c",
  },
  WETH_USDCe: {
    firstToken: optimismContracts.tokens.WETH.token,
    secondToken: optimismContracts.tokens.USDCe.token,
    fee: 500,
    address: "0x85149247691df622eaf1a8bd0cafd40bc45154a9",
  },
  WETH_VELOV2: {
    firstToken: optimismContracts.tokens.WETH.token,
    secondToken: optimismContracts.tokens.VELOV2.token,
    fee: 10000,
    address: "0x0Fb07E6d6E1F52c839608E1436d2EA810cf07257",
  },
};

export const arbitrumSwapPathes = {
  USDC_TO_WETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [arbitrumUniV3Pools.USDC_ETH.firstToken, arbitrumUniV3Pools.USDC_ETH.fee, arbitrumUniV3Pools.USDC_ETH.secondToken]
    ),
    tokenFrom: arbitrumContracts.tokens.USDC.token,
    tokenTo: arbitrumContracts.tokens.WETH.token,
  },
  WETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [arbitrumUniV3Pools.USDC_ETH.secondToken, arbitrumUniV3Pools.USDC_ETH.fee, arbitrumUniV3Pools.USDC_ETH.firstToken]
    ),
    tokenFrom: arbitrumContracts.tokens.WETH.token,
    tokenTo: arbitrumContracts.tokens.USDC.token,
  },
  wstETH_TO_USDC: {
    tokenFrom: arbitrumContracts.tokens.wstETH.token,
    tokenTo: arbitrumContracts.tokens.USDC.token,
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        arbitrumUniV3Pools.wstETH_ETH.firstToken,
        arbitrumUniV3Pools.wstETH_ETH.fee,
        arbitrumUniV3Pools.wstETH_ETH.secondToken,
        arbitrumUniV3Pools.USDC_ETH.fee,
        arbitrumUniV3Pools.USDC_ETH.firstToken,
      ]
    ),
  },
};

export const optimismSwapPathes = {
  USDC_TO_WETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [optimismUniV3Pools.USDC_ETH.firstToken, optimismUniV3Pools.USDC_ETH.fee, optimismUniV3Pools.USDC_ETH.secondToken]
    ),
    tokenFrom: optimismContracts.tokens.USDC.token,
    tokenTo: optimismContracts.tokens.WETH.token,
  },
  WETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [optimismUniV3Pools.USDC_ETH.secondToken, optimismUniV3Pools.USDC_ETH.fee, optimismUniV3Pools.USDC_ETH.firstToken]
    ),
    tokenFrom: optimismContracts.tokens.WETH.token,
    tokenTo: optimismContracts.tokens.USDC.token,
  },
  USDCe_TO_USDC: {
    tokenFrom: optimismContracts.tokens.USDCe.token,
    tokenTo: optimismContracts.tokens.USDC.token,
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        optimismUniV3Pools.WETH_USDCe.secondToken,
        optimismUniV3Pools.WETH_USDCe.fee,
        optimismUniV3Pools.WETH_USDCe.firstToken,
        optimismUniV3Pools.WETH_USDCe.fee,
        optimismUniV3Pools.WETH_USDCe.secondToken,
      ]
    ),
  },
  // WETH_TO_VELOV2: {
  //   tokenFrom: optimismContracts.tokens.WETH.token,
  //   tokenTo: optimismContracts.tokens.VELOV2.token,
  //   path: ethers.utils.solidityPack(
  //     ["address", "uint24", "address"],
  //     [
  //       optimismUniV3Pools.WETH_VELOV2.firstToken,
  //       optimismUniV3Pools.WETH_VELOV2.fee,
  //       optimismUniV3Pools.WETH_VELOV2.secondToken,
  //     ]
  //   ),
  // },
  USDC_TO_VELO2: {
    tokenFrom: optimismContracts.tokens.USDC.token,
    tokenTo: optimismContracts.tokens.VELOV2.token,
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        optimismUniV3Pools.USDC_ETH.firstToken,
        optimismUniV3Pools.USDC_ETH.fee,
        optimismUniV3Pools.USDC_ETH.secondToken,
        optimismUniV3Pools.WETH_VELOV2.fee,
        optimismUniV3Pools.WETH_VELOV2.secondToken,
      ]
    ),
  },
  VELO_TO_USDC: {
    tokenFrom: optimismContracts.tokens.VELOV2.token,
    tokenTo: optimismContracts.tokens.USDC.token,
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        optimismUniV3Pools.WETH_VELOV2.secondToken,
        optimismUniV3Pools.WETH_VELOV2.fee,
        optimismUniV3Pools.WETH_VELOV2.firstToken,
        optimismUniV3Pools.USDC_ETH.fee,
        optimismUniV3Pools.USDC_ETH.firstToken,
      ]
    ),
  },
  wstETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        optimismUniV3Pools.wstETH_ETH.firstToken,
        optimismUniV3Pools.wstETH_ETH.fee,
        optimismUniV3Pools.wstETH_ETH.secondToken,
        optimismUniV3Pools.USDC_ETH.fee,
        optimismUniV3Pools.USDC_ETH.firstToken,
      ]
    ),
    tokenFrom: optimismContracts.tokens.wstETH.token,
    tokenTo: optimismContracts.tokens.USDC.token,
  },
};

export const baseSwapPathes = {
  USDC_TO_WETH: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [baseUniV3Pools.USDC_ETH.firstToken, baseUniV3Pools.USDC_ETH.fee, baseUniV3Pools.USDC_ETH.secondToken]
    ),
    tokenFrom: baseContracts.tokens.USDCDefault.token,
    tokenTo: baseContracts.tokens.WETH.token,
  },
  WETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [baseUniV3Pools.USDC_ETH.secondToken, baseUniV3Pools.USDC_ETH.fee, baseUniV3Pools.USDC_ETH.firstToken]
    ),
    tokenFrom: baseContracts.tokens.WETH.token,
    tokenTo: baseContracts.tokens.USDCDefault.token,
  },
  cbETH_TO_USDC: {
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address"],
      [baseUniV3Pools.cbETH_USDC.firstToken, baseUniV3Pools.cbETH_USDC.fee, baseUniV3Pools.cbETH_USDC.secondToken]
    ),
    tokenFrom: baseContracts.tokens.cbETH.token,
    tokenTo: baseContracts.tokens.USDCDefault.token,
  },
  wstETH_TO_USDC: {
    tokenFrom: arbitrumContracts.tokens.wstETH.token,
    tokenTo: arbitrumContracts.tokens.USDC.token,
    path: ethers.utils.solidityPack(
      ["address", "uint24", "address", "uint24", "address"],
      [
        arbitrumUniV3Pools.wstETH_ETH.firstToken,
        arbitrumUniV3Pools.wstETH_ETH.fee,
        arbitrumUniV3Pools.wstETH_ETH.secondToken,
        arbitrumUniV3Pools.USDC_ETH.fee,
        arbitrumUniV3Pools.USDC_ETH.firstToken,
      ]
    ),
  },
};
