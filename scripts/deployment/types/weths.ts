// eslint-disable-next-line node/no-missing-import
import { Network } from "./network-config";

export const weths: Record<Network, string | undefined> = {
  [Network.ETH_MAINNET]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [Network.BSC_MAINNET]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};
