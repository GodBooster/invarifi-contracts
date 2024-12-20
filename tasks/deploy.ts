import { BigNumber } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  uploadAmmMetadata,
  uploadBoostMetadata,
  uploadCuberaMetadata,
  uploadCuberaMetadataAll,
  uploadEarnMetadata,
  uploadEarnMetadataAll,
  uploadVaultsMetadata,
  uploadVaultsMetadataAll,
  uploadZapsMetadata,
} from "../scripts/deployment/configs/save-config";
import { deployersRegistry } from "../scripts/deployment/deployers";
import { getNetworkConfig } from "../scripts/deployment/helpers";
import { getNetworkDeploymentConfig } from "../scripts/deployment/types";
import { TestToken__factory, VaultFactory__factory, VaultV7__factory } from "../typechain-types";

const tokens: Record<string, Record<string, string>> = {
  ethereum: {
    ["0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32".toLowerCase()]: "0xc012E9eAebC44BA0236c50d97a94F633a14c15Ca",
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()]: "0x44Cc771fBE10DeA3836f37918cF89368589b6316",
    ["0x5870700f1272a1AdbB87C3140bD770880a95e55D".toLowerCase()]: "0xE7B4d4b35A0F2045c6e77bfdd94B99Fb0Be961B0",
    ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase()]: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
    ["0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase()]: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe",
    ["0xB8c77482e45F1F44dE1745F52C74426C631bDD52".toLowerCase()]: "0xA73d9021f67931563fDfe3E8f66261086319a1FC",
    ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599".toLowerCase()]: "0xD275E5cb559D6Dc236a5f8002A5f0b4c8e610701",
  },
  bsc: {
    ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82".toLowerCase()]: "0x79d75e1f760223857929a6565d851c663e5fbf56",
  },
  arbitrum: {
    ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase()]: "0xe68ee8a12c611fd043fb05d65e1548dc1383f2b9",
  },
  polygon: {
    ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174".toLowerCase()]: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
  },
  optimism: {
    ["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85".toLowerCase()]: "0xf491d040110384dbcf7f241ffe2a546513fd873d",
  },
};

function loopThroughObjRecurs<TObj extends Record<string, unknown>>(
  obj: TObj,
  propExec: (key: string, value: string) => void
) {
  for (var k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) {
      loopThroughObjRecurs(obj[k] as Record<string, unknown>, propExec);
    } else if (obj.hasOwnProperty(k) && typeof obj[k] === "string" && isAddress(obj[k] as string)) {
      propExec(k, obj[k] as string);
    }
  }
}

const impersonate = async (hre: HardhatRuntimeEnvironment, address: string) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x364d6D0333432C3Ac016Ca832fb8594A8cE43Ca6"],
  });

  return hre.ethers.getImpersonatedSigner(address);
};

const fundBalance = async (hre: HardhatRuntimeEnvironment, address: string, amount: BigNumber) => {
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [address, amount.toHexString().replace("0x0", "0x")],
  });
};

task("fund:eth")
  .addOptionalPositionalParam("address")
  .setAction(async ({ address }, hre: HardhatRuntimeEnvironment) => {
    const [defaultSigner] = await hre.ethers.getSigners();

    address ??= defaultSigner.address;

    const valueToFund = hre.ethers.utils.parseUnits("100000");

    await fundBalance(hre, address, valueToFund);

    console.log(`Successfully minted ${hre.ethers.utils.formatUnits(valueToFund)} of ETH to ${address}`);
  });

task("token")
  .addPositionalParam("token")
  .addOptionalPositionalParam("address")
  .setAction(async ({ token, address }, hre: HardhatRuntimeEnvironment) => {
    const [defaultSigner] = await hre.ethers.getSigners();

    address ??= defaultSigner.address;

    const holder = tokens[hre.forkingNetwork?.name ?? "ethereum"][token.toLowerCase()];

    if (!holder) throw new Error("Res is undefined");

    if (!holder) {
      throw new Error("Holder is not set");
    }

    const imperHolder = await impersonate(hre, holder);

    await fundBalance(hre, imperHolder.address, hre.ethers.utils.parseUnits("1"));
    const want = TestToken__factory.connect(token, imperHolder);

    const balanceOfHolder = await want.balanceOf(imperHolder.address);

    await want.transfer(address, balanceOfHolder.div(2));

    const symb = await want.symbol();

    const formatUnits = hre.ethers.utils.formatUnits;

    console.log(`Successfully transferred ${formatUnits(balanceOfHolder.div(2))} of ${symb} to ${address}`);
  });

task("upload:metadata:vaults:all", async (_, hre) => {
  await uploadVaultsMetadataAll(hre);
});

task("verify:single")
  .addPositionalParam("address")
  .setAction(async ({ address }: { address: string }, hre) => {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
      noCompile: true,
    });
  });

task("verify:all", async (_, hre) => {
  const config = await getNetworkConfig(hre);

  const uniqueAddresses = new Set<string>();

  loopThroughObjRecurs(config.contractsConfig, async (_, value) => {
    uniqueAddresses.add(value);
  });

  const nonContractAddresses: string[] = [];
  const failedVerifications: string[] = [];
  const successfulVerifications: string[] = [];

  for (const address of uniqueAddresses) {
    if ((await hre.ethers.provider.getCode(address)) === "0x") {
      nonContractAddresses.push(address);
      uniqueAddresses.delete(address);
    }
  }

  console.log({ uniqueAddresses: uniqueAddresses.values() });

  for (const address of uniqueAddresses) {
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [],
        noCompile: true,
      });
      successfulVerifications.push(address);
    } catch (err) {
      failedVerifications.push(address);
    }
  }

  console.log({ nonContractAddresses, successfulVerifications, failedVerifications });
});

task("upload:metadata:vaults", async (_, hre) => {
  await uploadVaultsMetadata(hre);
});

task("upload:metadata:cubera:all", async (_, hre) => {
  await uploadCuberaMetadataAll(hre);
});

task("upload:metadata:cubera", async (_, hre) => {
  await uploadCuberaMetadata(hre);
});

task("upload:metadata:zaps", async (_, hre) => {
  await uploadZapsMetadata(hre);
});

task("upload:metadata:amm", async (_, hre) => {
  await uploadAmmMetadata(hre);
});

task("upload:metadata:boosts", async (_, hre) => {
  await uploadBoostMetadata(hre);
});

task("upload:metadata:earn:all", async (_, hre) => {
  await uploadEarnMetadataAll(hre);
});

task("upload:metadata:earn", async (_, hre) => {
  await uploadEarnMetadata(hre);
});

task("upload:metadata:all", async (_, hre) => {
  await Promise.all([
    uploadVaultsMetadata(hre),
    uploadCuberaMetadata(hre),
    uploadZapsMetadata(hre),
    uploadEarnMetadata(hre),
    uploadAmmMetadata(hre),
    uploadBoostMetadata(hre),
  ]);
});

task("upgrade:factory", async (_, hre) => {
  const networkConfig = await getNetworkConfig(hre);
  const [defaultSigner] = await hre.ethers.getSigners();

  const factory = networkConfig.contractsConfig.vaultFactory ?? "";

  await hre.upgrades.upgradeProxy(factory, new VaultFactory__factory(defaultSigner), {
    unsafeAllow: ["constructor"],
  });
});

task("upgrade:vault", async (_, hre) => {
  const networkConfig = await getNetworkConfig(hre);
  const [defaultSigner] = await hre.ethers.getSigners();

  const vault = networkConfig.contractsConfig.vaultBeacon ?? "";

  await hre.upgrades.upgradeBeacon(vault, new VaultV7__factory(defaultSigner), {
    unsafeAllow: ["constructor"],
  });
});

task("want")
  .addPositionalParam("deployerName")
  .addOptionalPositionalParam("address")
  .setAction(async ({ deployerName, address }, hre: HardhatRuntimeEnvironment) => {
    const [defaultSigner] = await hre.ethers.getSigners();

    address ??= defaultSigner.address;

    const networkConfig = await getNetworkConfig(hre);
    const config = await getNetworkDeploymentConfig(hre, networkConfig);

    const deployers = deployersRegistry(hre, config);

    const { deployer, wantHolder } = deployers[deployerName];

    const wantToken = deployer.wantToken();

    if (!wantToken) throw new Error("Res is undefined");

    if (!wantHolder) {
      throw new Error("Want holder is not set");
    }

    const imperHolder = await impersonate(hre, wantHolder);
    await fundBalance(hre, imperHolder.address, hre.ethers.utils.parseUnits("1"));

    const want = TestToken__factory.connect(wantToken, imperHolder);

    const balanceOfHolder = await want.balanceOf(imperHolder.address);

    await want.transfer(address, balanceOfHolder.div(2));

    const symb = await want.symbol();

    const formatUnits = hre.ethers.utils.formatUnits;

    console.log(`Successfully transferred ${formatUnits(balanceOfHolder.div(2))} of ${symb} to ${address}`);
  });

task("deployers:names").setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const networkConfig = await getNetworkConfig(hre);
  const config = await getNetworkDeploymentConfig(hre, networkConfig);

  const strategies = deployersRegistry(hre, config);

  console.log(Object.keys(strategies));
});
