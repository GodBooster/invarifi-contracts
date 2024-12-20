import { task } from "hardhat/config";
import { HttpNetworkConfig } from "hardhat/types";
import { addressBook } from "blockchain-addressbook";

task("test-data:network-config", "Exports the current HardHat config to inject in forge tests").setAction(
  async (taskArgs: { data: "networks" | "addressbook" }, hre, runSuper) => {
    const cleanedNets: any = [];
    for (const netName in hre.config.networks) {
      let netConf = hre.config.networks[netName];
      if (netName === "hardhat") {
        // we can't use a net without url
        continue;
      } else if (netName === "localhost") {
        // we can't use a net without chain id
        continue;
      } else {
        netConf = netConf as HttpNetworkConfig;
        cleanedNets.push({
          name: netName,
          chaidId: netConf.chainId,
          url: netConf.url,
        });
      }
    }
    console.log(JSON.stringify(cleanedNets, null, 2));
  }
);
