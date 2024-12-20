import { NetworkName } from "../../hardhat.config";

export const runNetworkDescribe = (
  testName: string,
  targetNetwork: NetworkName,
  only: boolean,
  testFn: () => Promise<any> | any
) => {
  if (process.env.FORK_NETWORK === targetNetwork) {
    if (only) {
      describe.only(testName, testFn);
    } else {
      describe(testName, testFn);
    }
  } else {
    describe.skip(testName + `(skipped as FORK_NETWORK != ${targetNetwork})`, testFn);
  }
};
