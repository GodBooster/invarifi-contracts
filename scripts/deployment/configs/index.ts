// eslint-disable-next-line node/no-missing-import
import { ethers } from "ethers";
import { Network, NetworkConfig, ZapCategory } from "../types/network-config";

import dotenv from "dotenv";
dotenv.config();

const defaultAddress = new ethers.Wallet(process.env.PK ?? "").address;

console.log({ defaultAddress });

export const configs: Record<Network, NetworkConfig> = {
  [Network.ETH_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON, ZapCategory.BALANCER_AURA_ETH, ZapCategory.CURVE_CONVEX_ETH],
          metadata: {
            priceOracleAddress: "0x07D91f5fb9Bf7798734C3f606dB065549F6893bb",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["ETH", "WETH", "USDC", "USDT", "DAI", "WBTC"],
            withdrawToTokens: ["ETH", "WETH", "USDC", "USDT", "DAI", "WBTC"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",

      earn: {
        reservedForAutomation: 100,
        // USDT
        stable: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
    },
    environment: {
      unirouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      unirouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
  },
  [Network.BSC_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON],
          metadata: {
            priceOracleAddress: "0xfbD61B037C325b959c0F6A7e69D8f37770C2c550",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["BNB", "WBNB", "USDC", "USDT", "DAI", "BTCB"],
            withdrawToTokens: ["BNB", "WBNB", "USDC", "USDT", "DAI", "BTCB"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

      earn: {
        reservedForAutomation: 10,
        stable: "0x55d398326f99059ff775485246999027b3197955",
      },
      strategiesShared: {
        bscVeCakeStaker: {
          want: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
          veCake: "0x45c54210128a065de780C4B0Df3d16664f7f859e",
          reserveRate: "1",
          cakeBatch: "0x948BCda327D598CC094F74d25DE1807b736D514B",
          beCakeShare: "0",
          name: "Cubera CAKE",
          symbol: "cbrCAKE",
        },
      },
    },
    environment: {
      unirouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      unirouterV3: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
    },
  },
  [Network.POLYGON_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON, ZapCategory.RETRO_GAMMA],
          metadata: {
            priceOracleAddress: "0x7F069df72b7A39bCE9806e3AfaF579E54D8CF2b9",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["MATIC", "WMATIC", "USDC", "USDT", "DAI", "ETH", "WBTC"],
            withdrawToTokens: ["MATIC", "WMATIC", "USDC", "USDT", "DAI", "ETH", "WBTC"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",

      earn: {
        reservedForAutomation: 10,
        // USDT
        stable: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      },
    },
    environment: {
      unirouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      unirouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
  },
  [Network.ARB_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON, ZapCategory.HOP, ZapCategory.BALANCER_AURA_ARBITRUM],
          metadata: {
            priceOracleAddress: "0x735247fb0a604c0adC6cab38ACE16D0DbA31295F",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["ETH", "ARB", "WETH", "USDC", "USDT", "DAI", "WBTC", "wstETH"],
            withdrawToTokens: ["ETH", "ARB", "WETH", "USDC", "USDT", "DAI", "WBTC", "wstETH"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      earn: {
        reservedForAutomation: 10,
        // USDT
        stable: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      },
      strategiesShared: {
        dystopiaStaker: {
          distVoter: "0x98A1De08715800801E9764349F5A71cBe63F99cc",
          veDist: "0x29d3622c78615A1E7459e4bE434d816b7de293e4",
        },
      },
    },
    environment: {
      unirouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      unirouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
  },
  [Network.OPTIMISM_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON, ZapCategory.VELODROME, ZapCategory.HOP, ZapCategory.CURVE_OP],
          metadata: {
            priceOracleAddress: "0x11DEE30E710B8d4a8630392781Cc3c0046365d4c",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["ETH", "OP", "USDC", "USDT", "DAI"],
            withdrawToTokens: ["ETH", "OP", "USDC", "USDT", "DAI"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0x4200000000000000000000000000000000000006",
      earn: {
        reservedForAutomation: 30,
        // USDT
        stable: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      },
    },
    environment: {
      unirouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      unirouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
  },
  [Network.AVAX_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [ZapCategory.COMMON, ZapCategory.VELODROME, ZapCategory.BALANCER_AURA_ARBITRUM],
          metadata: {
            priceOracleAddress: "0xBd0c7AaF0bF082712EbE919a9dD94b2d978f79A9",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["AVAX", "WAVAX", "USDC", "USDT", "DAI"],
            withdrawToTokens: ["AVAX", "WAVAX", "USDC", "USDT", "DAI"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      earn: {
        reservedForAutomation: 10,
        // USDT
        stable: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      },
    },
    environment: {
      unirouter: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
      unirouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", // TODO: change to real one
    },
  },
  [Network.BASE_MAINNET]: {
    contractsConfig: {
      devMultisig: defaultAddress,
      treasuryMultisig: defaultAddress,
      voter: defaultAddress,
      vaultOwner: defaultAddress,
      strategyOwner: defaultAddress,
      treasurer: defaultAddress,
      keeper: defaultAddress,
      feeConfig: {
        default: {
          id: "0",
          total: "0.095",
          call: "0.942",
          strategist: "0.0052",
          label: "default",
          active: true,
          adjust: false,
        },
      },
      zaps: {
        oneInch: {
          router: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          categories: [
            ZapCategory.COMMON,
            ZapCategory.BALANCER_AURA_ARBITRUM,
            ZapCategory.VELODROME,
            ZapCategory.BASESWAP,
          ],
          metadata: {
            priceOracleAddress: "0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8",
            fee: {
              value: 0.0005,
            },
            depositFromTokens: ["ETH", "WETH", "USDbC", "USDC", "DAI"],
            withdrawToTokens: ["ETH", "WETH", "USDbC", "USDC", "DAI"],
            blockedTokens: [],
            blockedVaults: [],
          },
        },
      },
      wNative: "0x4200000000000000000000000000000000000006",
      earn: {
        reservedForAutomation: 0,
        // USDT
        stable: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      },
    },
    environment: {
      unirouter: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
      unirouterV3: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
      gelatoAutomate: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
      oneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
      uniswapV3Quoter: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
    },
  },
};
