import { getNetworkConfig } from "../helpers";
import { deployChain } from "../infra/deploy-chain";
import hre from "hardhat";

const main = async () => {
  const networkConfig = await getNetworkConfig(hre);

  const updatedConfig = await deployChain(hre, networkConfig);

  console.log({ updatedConfig });
};

main()
  .then(() => console.log("Successfully finished!"))
  .catch(console.error);
