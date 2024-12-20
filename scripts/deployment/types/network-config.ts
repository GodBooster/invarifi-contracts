import { BigNumberish } from "ethers";
import { OneInchZapMetadata } from "../configs/save-config";
import { VaultMetadata } from "./vault-deployer";

type RewardPoolMetadata = Omit<
  VaultMetadata,
  "tokenAddress" | "tokenDecimals" | "earnContractAddress" | "network" | "createdAt"
>;

export enum ZapCategory {
  COMMON = "common",
  CURVE_CONVEX_ETH = "curve-convex-eth",
  CURVE_OP = "curve-op",
  BALANCER_AURA_ETH = "balancer-aura-eth",
  HOP = "hop",
  RETRO_GAMMA = "retro-gamma",
  BALANCER_AURA_ARBITRUM = "balancer-aura-arbitrum",
  VELODROME = "velodrome",
  BASESWAP = "baseswap",
}

export enum LpHelperType {
  UNI_V2 = "uni-v2",
  SOLIDLY = "solidly",
  STARGATE = "stargate",
  CURVE = "curve",
  CURVE_OP = "curve-op",
  CURVE_CONVEX = "curve-convex",
  BALANCER_AURA = "balancer-aura",
  BALANCER_AURA_GAUGE = "balancer-aura-gauge",
  BALANCER_AURA_GYRO = "balancer-aura-gyro",
  HOP = "hop",
  RETRO_GAMMA = "retro-gamma",
  BALANCER_AURA_ARBITRUM = "balancer-aura-arbitrum",
  VELODROME = "velodrome",
}

export enum LpHelperTypeUniV2 {
  V2_UNI_V2 = "v2-uni-v2",
  V2_UNI_V2_BASE = "v2-uni-v2-base",
  V2_STARGATE = "v2-stargate",
  V2_STARGATE_BASE = "v2-stargate-base",
  V2_BALANCER = "v2-balancer",
  V2_VELODROME = "v2-velodrome",
}

export type NetworkConfig = {
  contractsConfig: {
    devMultisig: string;
    treasuryMultisig: string;
    voter: string;
    vaultOwner: string;
    strategyOwner: string;
    treasurer: string;
    keeper: string;
    wNative: string;

    ac?: string;
    vaultBeacon?: string;
    vaultFactory?: string;
    gasprice?: string;
    treasury?: string;
    multicall?: string;
    multicallManager?: string;
    multiStratHarvester?: string;
    boostFactory?: string;
    boostImplementation?: string;
    // rewardPool?: string;
    // rewardPoolMetadata: RewardPoolMetadata;
    zaps: {
      oneInch: {
        router?: string;
        metadata: OneInchZapMetadata;
        categories: ZapCategory[];
        zaps?: {
          category: ZapCategory;
          address: string;
        }[];
      };
    };

    feeConfig: {
      // feeBatcher?: string;
      feeConfigurator?: string;
      default: {
        id: BigNumberish;
        total: BigNumberish;
        call: BigNumberish;
        strategist: BigNumberish;
        label: string;
        active: boolean;
        adjust: boolean;
      };
    };
    strategiesShared?: {
      dystopiaStaker?: {
        staker?: string;
        distVoter: string;
        veDist: string;
      };
      bscVeCakeStaker?: {
        staker?: string;
        want: string;
        veCake: string;
        reserveRate: string;
        cakeBatch: string;
        beCakeShare: string;
        name: string;
        symbol: string;
      };
    };
    earn?: {
      stable: string;
      reservedForAutomation: number;
      priceAggregator?: string;
      earnConfiguration?: string;
      gelatoChecker?: string;
      earnHelper?: string;
      earnFactory?: string;
      earnBeacon?: string;
      gelatoSwapper?: string;
      twapOracles?: Record<string, string>;
      lpHelpers?: Partial<
        Record<
          LpHelperType | LpHelperTypeUniV2,
          {
            address: string;
          }
        >
      >;
      pools?: Record<
        string,
        {
          earn?: string;
          vaults?: {
            vaultId: string;
            lpHelper: string;
            part: number;
          }[];
        }
      >;
    };
  };
  environment: {
    gelatoAutomate: string;
    unirouter: string;
    unirouterV3: string;
    oneInchRouter: string;
    uniswapV3Quoter: string;
  };
};

export enum Network {
  // eslint-disable-next-line no-unused-vars
  ETH_MAINNET = 1,
  BSC_MAINNET = 56,
  POLYGON_MAINNET = 137,
  ARB_MAINNET = 42161,
  AVAX_MAINNET = 43114,
  OPTIMISM_MAINNET = 10,
  BASE_MAINNET = 8453,
}
