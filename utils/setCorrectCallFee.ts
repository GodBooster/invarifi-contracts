import { Contract } from "@ethersproject/contracts";
import { CuberaChain } from "./cuberaChain";
import { chainCallFeeMap } from "./chainCallFeeMap";

export const setCorrectCallFee = async (strategy: Contract, chainName: CuberaChain) => {
  const expectedCallFee = chainCallFeeMap[chainName];
  const defaultCallFee = await strategy.callFee();
  if (expectedCallFee !== defaultCallFee) {
    console.log(`Setting call fee to '${expectedCallFee}'`)
    await strategy.setCallFee(expectedCallFee);
  }
}