import { CuberaChain } from "./cuberaChain"

const defaultFee = 111;
const reducedFee = 11;

export const chainCallFeeMap: Record<CuberaChain, number> = {
  bsc: defaultFee,
  avax: defaultFee,
  polygon: reducedFee,
  heco: reducedFee,
  fantom: reducedFee,
  one: defaultFee,
  arbitrum: defaultFee,
  moonriver: reducedFee,
  cronos: defaultFee,
  localhost: reducedFee,
  celo: reducedFee,
  aurora: reducedFee,
  fuse: reducedFee,
  metis: defaultFee,
  moonbeam: reducedFee,
  sys: reducedFee,
  emerald: reducedFee,
  optimism: defaultFee
};
