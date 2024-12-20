import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import { DeployChainConfig } from "../infra/deploy-chain";
// eslint-disable-next-line node/no-missing-import
import * as fs from "fs";
import { VaultConfigs, VaultDeployer, VaultMetadata } from "../types/vault-deployer";
// eslint-disable-next-line node/no-missing-import
import { getKeyByValueEnum } from "../../../utils/getKeyByValueEnum";
// eslint-disable-next-line node/no-missing-import
import path from "path";
import { Network, ZapCategory } from "../types/network-config";
// eslint-disable-next-line node/no-missing-import
import { NetworkDeploymentConfig, StrategyDeploymentConfig } from "../types";
// eslint-disable-next-line camelcase,node/no-missing-import
import { ethers } from "ethers";
import { VaultFactory__factory } from "../../../typechain-types";
import { getNetworkConfig } from "../helpers";
import { ConfigUploader } from "../types/config-uploader";
import { EarnPoolMetadata } from "../types/earn-deployer";

type Nullable<T> = { [K in keyof T]?: T[K] };

export type JsonConfig = {
  config?: DeployChainConfig;
  deployers?: Record<string, VaultConfigs>;
};

export type CuberaMetadata = {
  devMultisig: string;
  treasuryMultisig: string;
  strategyOwner: string;
  vaultOwner: string;
  keeper: string;
  treasurer: string;
  launchpoolOwner: string;
  voter: string;
  feeRecipient: string;

  rewardPool: string;
  treasury: string;
  multicall: string;
  feeConfig: string;
  vaultFactory: string;
  cuberaMaxiStrategy: string;

  earnPriceAggregator: string;
  earnConfiguration: string;
  earnGelatoChecker: string;
  earnFactory: string;
  earnBeacon: string;
  earnHelper: string;

  ac: string;
  wNative: string;
  gelatoAutomate: string;
  oneInchRouter: string;
};

export type OneInchZapMetadata = {
  id?: string;
  priceOracleAddress: string;
  chainId?: string;
  strategies?: {
    address: string;
    category: ZapCategory;
  }[];
  fee: {
    value: number;
    recipient?: string;
  };
  depositFromTokens: string[];
  withdrawToTokens: string[];
  blockedTokens: string[];
  blockedVaults: string[];
  autoswapTokens?: string[];
};

export const getConfigFilePath = (hre: HardhatRuntimeEnvironment) => {
  const chain = hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1;
  const chainName = getKeyByValueEnum(chain, Network);
  if (!chainName) {
    throw new Error(`There is no such chainId in Network config: ${chain}`);
  }
  const isFork = !!hre?.forkingNetwork?.chainId;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./scripts/deployment/configs/jsons/${fileFolder}${chainName}.json`);
};

export const getCuberaMetadataFilePath = (hre: GetFilePathParams) => {
  const chainName = hre?.forkingNetwork?.name ?? hre?.network.name;
  const isFork = !!hre?.forkingNetwork?.chainId;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/cubera/${fileFolder}${chainName}.json`);
};

export const getOneInchMetadataFilePath = (hre: GetFilePathParams) => {
  const isFork = !!hre?.forkingNetwork?.chainId;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/zap/${fileFolder}one-inch.json`);
};

export const getAmmMetadataFilePath = (hre: GetFilePathParams) => {
  const isFork = !!hre?.forkingNetwork?.chainId;
  const chainName = hre?.forkingNetwork?.name ?? hre?.network.name;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/amm/${fileFolder}${chainName}.json`);
};

export const getBoostMetadataFilePath = (hre: GetFilePathParams) => {
  const isFork = !!hre?.forkingNetwork?.chainId;
  const chainName = hre?.forkingNetwork?.name ?? hre?.network.name;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/boost/${fileFolder}${chainName}.json`);
};

export const removeOzFilePath = (hre: HardhatRuntimeEnvironment) => {
  if (!hre.forkingNetwork) throw new Error("Cannot remove OZ network config for non-forked network");

  const chain = hre.network.config.chainId;

  if (!chain) throw new Error("Unknown chainId");

  const filePath = path.resolve(`./.openzeppelin/unknown-${chain}.json`);

  removeFileIfExists(hre, filePath);
};

export const getMetadataFilePath = (hre: GetFilePathParams) => {
  const chainName = hre?.forkingNetwork?.name ?? hre?.network.name;
  const isFork = !!hre?.forkingNetwork?.chainId;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/vault/${fileFolder}${chainName}.json`);
};

type GetFilePathParams = {
  forkingNetwork?: { name?: string; chainId?: number };
  network: { name: string };
};

export const getEarnMetadataFilePath = (hre: GetFilePathParams) => {
  const chainName = hre?.forkingNetwork?.name ?? hre?.network.name;
  const isFork = !!hre?.forkingNetwork?.chainId;
  const fileFolder = isFork ? `local/` : "";
  return path.resolve(`./configs/earn/${fileFolder}${chainName}.json`);
};

export type Constructor<T> = new (...args: any[]) => T;

export const saveVaultMetadata = async (hre: HardhatRuntimeEnvironment, metadata: VaultMetadata) => {
  const chainName = getKeyByValueEnum(hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1, Network);

  if (!chainName) {
    throw new Error(`There is no such chainId in Network config: ${hre.network.config.chainId}`);
  }

  const filePath = path.resolve(getMetadataFilePath(hre));

  let fileMetadata: VaultMetadata[] = [];

  if (fs.existsSync(filePath)) {
    fileMetadata = await readJsonVaultMetadata(hre);
  }

  if (fileMetadata.find(v => v.id === metadata.id)) {
    const index = fileMetadata.findIndex(v => v.id === metadata.id);

    fileMetadata[index] = metadata;
  } else {
    fileMetadata = [...fileMetadata, metadata];
  }

  saveVaultMetadataAll(hre, fileMetadata);
};

export const saveEarnMetadata = async (hre: HardhatRuntimeEnvironment, metadata: EarnPoolMetadata) => {
  const chainName = getKeyByValueEnum(hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1, Network);

  if (!chainName) {
    throw new Error(`There is no such chainId in Network config: ${hre.network.config.chainId}`);
  }

  const filePath = path.resolve(getEarnMetadataFilePath(hre));

  let fileMetadata: EarnPoolMetadata[] = [];

  if (fs.existsSync(filePath)) {
    fileMetadata = await readEarnMetadata(hre);
  }

  if (fileMetadata.find(v => v.id === metadata.id)) {
    const index = fileMetadata.findIndex(v => v.id === metadata.id);

    fileMetadata[index] = metadata;
  } else {
    fileMetadata = [...fileMetadata, metadata];
  }

  saveEarnMetadataAll(hre, fileMetadata);
};

export const saveOneInchZapMetadata = async (hre: HardhatRuntimeEnvironment, metadata: OneInchZapMetadata) => {
  const filePath = path.resolve(getOneInchMetadataFilePath(hre));

  let existingZapMetadata: OneInchZapMetadata[] = [];

  if (fs.existsSync(filePath)) {
    existingZapMetadata = await readJsonOneInchZapMetadata(hre);
  }

  if (existingZapMetadata.find(v => v.chainId === metadata.chainId)) {
    const index = existingZapMetadata.findIndex(v => v.chainId === metadata.chainId);

    existingZapMetadata[index] = metadata;
  } else {
    existingZapMetadata = [...existingZapMetadata, metadata];
  }

  saveJsonConfig(filePath, existingZapMetadata);
};

export const saveCuberaMetadata = (hre: HardhatRuntimeEnvironment, metadata: Nullable<CuberaMetadata>) => {
  const filePath = path.resolve(getCuberaMetadataFilePath(hre));
  saveJsonConfig(filePath, metadata);
};

export const saveVaultMetadataAll = (hre: HardhatRuntimeEnvironment, metadata: VaultMetadata[]) => {
  const filePath = path.resolve(getMetadataFilePath(hre));

  saveJsonConfig(filePath, metadata);
};

export const saveEarnMetadataAll = (hre: HardhatRuntimeEnvironment, metadata: EarnPoolMetadata[]) => {
  const filePath = path.resolve(getEarnMetadataFilePath(hre));
  saveJsonConfig(filePath, metadata);
};

export const removeDeploymentConfig = (hre: HardhatRuntimeEnvironment) => {
  const filePath = path.resolve(getConfigFilePath(hre));
  removeFileIfExists(hre, filePath);
};

export const removeOneInchZapMetadata = (hre: HardhatRuntimeEnvironment) => {
  const filePath = path.resolve(getOneInchMetadataFilePath(hre));
  removeFileIfExists(hre, filePath);
};

const clearLocalMetadata = (folderPath: string, defaultValue: unknown = []) => {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile()) continue;
    if (!file.name.includes(".json")) continue;

    const filePath = path.resolve(folderPath, file.name);

    fs.writeFileSync(filePath, JSON.stringify(defaultValue));
  }
};

const uploadMetadataFolder = async (hre: HardhatRuntimeEnvironment, folderName: string, folderPath: string) => {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile()) continue;
    if (!file.name.includes(".json")) continue;

    const filePath = path.resolve(folderPath, file.name);

    await uploadMetadata(hre, folderName, filePath, file.name.replace(".json", ""));
  }
};

export const clearLocalEarnMetadatas = () => {
  return clearLocalMetadata(path.resolve(`./configs/earn/local`));
};

export const clearLocalVaultMetadatas = () => {
  return clearLocalMetadata(path.resolve(`./configs/vault/local`));
};

export const clearLocalBoostsMetadatas = () => {
  return clearLocalMetadata(path.resolve(`./configs/boost/local`));
};

export const clearLocalZapMetadatas = () => {
  return clearLocalMetadata(path.resolve(`./configs/zap/local`));
};

export const removeFileIfExists = (hre: HardhatRuntimeEnvironment, filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const removeOzNetworkFile = async (hre: HardhatRuntimeEnvironment) => {
  const filePath = path.resolve(getConfigFilePath(hre));

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  } else {
    console.log("No config to remove");
  }
};

const getOneInchZapMetadataFromDeploymentConfig = (
  hre: HardhatRuntimeEnvironment,
  { contractsConfig }: DeployChainConfig
): OneInchZapMetadata => {
  const { metadata, zaps } = contractsConfig.zaps.oneInch;

  const chainName = hre.forkingNetwork?.name ?? hre.network.name;

  return {
    ...metadata,
    id: chainName,
    chainId: chainName,
    strategies: zaps ?? [],
    autoswapTokens: metadata.autoswapTokens ?? metadata.depositFromTokens,
    fee: {
      ...metadata.fee,
      recipient: contractsConfig.treasury,
    },
  };
};

const getCuberaMetadataFromDeploymentConfig = ({
  contractsConfig,
  environment,
}: DeployChainConfig): Nullable<CuberaMetadata> => {
  const value = {
    devMultisig: contractsConfig.devMultisig,
    treasuryMultisig: contractsConfig.treasuryMultisig,
    strategyOwner: contractsConfig.strategyOwner,
    vaultOwner: contractsConfig.vaultOwner,
    keeper: contractsConfig.keeper,
    treasurer: contractsConfig.treasurer,
    launchpoolOwner: contractsConfig.devMultisig,
    voter: contractsConfig.devMultisig,
    feeRecipient: contractsConfig.treasury, // contractsConfig.feeConfig.feeBatcher,
    rewardPool: ethers.constants.AddressZero, // TODO: check if works  // contractsConfig.rewardPool,
    treasury: contractsConfig.treasury,
    multicall: contractsConfig.multicall,
    multicallManager: contractsConfig.multicallManager,
    feeConfig: contractsConfig.feeConfig.feeConfigurator,
    vaultFactory: contractsConfig.vaultFactory,

    earnPriceAggregator: contractsConfig?.earn?.priceAggregator,
    earnConfiguration: contractsConfig?.earn?.earnConfiguration,
    earnGelatoChecker: contractsConfig?.earn?.gelatoChecker,
    earnFactory: contractsConfig?.earn?.earnFactory,
    earnBeacon: contractsConfig?.earn?.earnBeacon,
    earnHelper: contractsConfig?.earn?.earnHelper,

    ac: contractsConfig.ac,
    wNative: contractsConfig.wNative,
    gelatoAutomate: environment.gelatoAutomate,
    oneInchRouter: environment.oneInchRouter,
    uniswapV3Quoter: environment.uniswapV3Quoter,

    cuberaMaxiStrategy: "0x697aFD2D17e7e274529ABd2db49A2953bb081091",
  };

  return Object.fromEntries(Object.entries(value).filter(([_, value]) => value !== undefined));
};

export const saveDeploymentConfig = async (hre: HardhatRuntimeEnvironment, config: DeployChainConfig) => {
  const chainName = getKeyByValueEnum(hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1, Network);

  if (!chainName) {
    throw new Error(`There is no such chainId in Network config: ${hre.network.config.chainId}`);
  }

  const filePath = path.resolve(getConfigFilePath(hre));

  let jsonConfig: JsonConfig;

  if (fs.existsSync(filePath)) {
    jsonConfig = await readJsonConfig(hre);

    jsonConfig.config = config;
  } else {
    jsonConfig = {
      deployers: {},
      config,
    };
  }

  const cuberaMetadata = getCuberaMetadataFromDeploymentConfig(config);
  const zapMetadata = getOneInchZapMetadataFromDeploymentConfig(hre, config);

  saveJsonConfig(filePath, jsonConfig);
  saveCuberaMetadata(hre, cuberaMetadata);
  await saveOneInchZapMetadata(hre, zapMetadata);
};

export const saveDeployerConfig = async (hre: HardhatRuntimeEnvironment, deployer: VaultDeployer<any, any, any>) => {
  const hreChainId = hre?.forkingNetwork?.chainId ?? hre?.network.config.chainId ?? 1;

  if (hreChainId && hreChainId !== deployer.targetNetwork()) {
    throw new Error(`Cannot deploy ${deployer.rawVaultName()} to ${hreChainId} because they have different networks`);
  }
  const chainName = getKeyByValueEnum(hreChainId ?? 1, Network);

  if (!chainName) {
    throw new Error(`There is no such chainId in Network config: ${hreChainId}`);
  }

  const filePath = path.resolve(getConfigFilePath(hre));
  let jsonConfig: JsonConfig;

  if (!fs.existsSync(filePath)) {
    jsonConfig = {};
  } else {
    jsonConfig = await readJsonConfig(hre);
  }

  jsonConfig.deployers = {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...(jsonConfig.deployers ?? {}),
    [deployer.rawVaultName()]: {
      networkConfig: {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        deployCommonParams: await deployer.getCommonParams(),
        vaultFactory: deployer.networkConfig.vaultFactory.address,
      },
      strategyConfig: deployer.strategyConfig,
    },
  };

  saveJsonConfig(filePath, jsonConfig);
};

const readJsonFile = async <TRes>(filePath: string): Promise<TRes> => {
  try {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const data = await fs.promises.readFile(filePath, "utf-8");

    return JSON.parse(data) as TRes;
  } catch (error: any) {
    console.error(`Error reading config file ${filePath}`);
    throw new Error(error.message);
  }
};

export const readJsonOneInchZapMetadata = (hre: HardhatRuntimeEnvironment): Promise<OneInchZapMetadata[]> => {
  return readJsonFile(getOneInchMetadataFilePath(hre));
};

export const readJsonVaultMetadata = async (hre: HardhatRuntimeEnvironment): Promise<VaultMetadata[]> => {
  return readJsonFile(getMetadataFilePath(hre));
};

export const readEarnMetadata = async (hre: HardhatRuntimeEnvironment): Promise<EarnPoolMetadata[]> => {
  return readJsonFile(getEarnMetadataFilePath(hre));
};

export const readJsonConfig = async (hre: HardhatRuntimeEnvironment): Promise<JsonConfig> => {
  return readJsonFile(getConfigFilePath(hre));
};

export const uploadVaultsMetadataAll = async (hre: HardhatRuntimeEnvironment) => {
  return uploadMetadataFolder(hre, "vault", path.resolve(`./configs/vault`));
};

export const uploadEarnMetadataAll = async (hre: HardhatRuntimeEnvironment) => {
  return uploadMetadataFolder(hre, "earn", path.resolve(`./configs/earn`));
};

export const uploadCuberaMetadataAll = async (hre: HardhatRuntimeEnvironment) => {
  return uploadMetadataFolder(hre, "cubera", path.resolve(`./configs/cubera`));
};

export const uploadZapsMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return Promise.all([
    uploadMetadata<T>(hre, "zap", getOneInchMetadataFilePath(hre), "one-inch"),
    uploadMetadata<T>(hre, "zap", getOneInchMetadataFilePath(hre), "cubera"),
  ]);
};

export const uploadAmmMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return uploadMetadata<T>(hre, "amm", getAmmMetadataFilePath(hre));
};

export const uploadBoostMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return uploadMetadata<T>(hre, "boost", getBoostMetadataFilePath(hre));
};

export const uploadVaultsMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return uploadMetadata<T>(hre, "vault", getMetadataFilePath(hre));
};

export const uploadEarnMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return uploadMetadata<T>(hre, "earn", getEarnMetadataFilePath(hre));
};

export const uploadCuberaMetadata = async <T extends Object>(hre: HardhatRuntimeEnvironment) => {
  return uploadMetadata<T>(hre, "cubera", getCuberaMetadataFilePath(hre));
};

export const uploadMetadata = async <T extends Object>(
  hre: HardhatRuntimeEnvironment,
  folderName: string,
  filePath: string,
  chainName?: string
) => {
  const uploader = new ConfigUploader(process.env.AZURE_BLOB_CONN ?? "", process.env.AZURE_BLOB_CONTAINER ?? "configs");
  console.log(filePath);
  const content = await readJsonFile<T[]>(filePath);
  chainName ??= hre?.forkingNetwork?.name ?? hre?.network.name;
  await uploader.upload(content, chainName, folderName);
};

const saveJsonConfig = <TConfig>(filePath: string, config: TConfig) => {
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), {
    flag: "w",
  });
};

export const loadAndDeploy = async <TEntity extends VaultDeployer>(
  EntityConstructor: Constructor<TEntity>,
  hre: HardhatRuntimeEnvironment,
  networkConfig: NetworkDeploymentConfig,
  strategyConfig?: StrategyDeploymentConfig<unknown>
) => {
  const loaded = await loadOrCreateDeployer(EntityConstructor, hre, networkConfig, strategyConfig);
  return await VaultDeployer.deploy(loaded);
};

export const loadAndMigrate = async <TEntity extends VaultDeployer>(
  EntityConstructor: Constructor<TEntity>,
  hre: HardhatRuntimeEnvironment,
  networkConfig: NetworkDeploymentConfig,
  strategyConfig?: StrategyDeploymentConfig<unknown>
) => {
  const loaded = await loadOrCreateDeployer(EntityConstructor, hre, networkConfig, strategyConfig);
  return await VaultDeployer.migrateStrategy(loaded);
};

export const loadOrCreateDeployer = async <TEntity extends VaultDeployer>(
  EntityConstructor: Constructor<TEntity>,
  hre: HardhatRuntimeEnvironment,
  networkConfig: NetworkDeploymentConfig,
  strategyConfig?: StrategyDeploymentConfig<unknown>
) => {
  const deploymentConfig = await getNetworkConfig(hre);
  const config: JsonConfig = await readJsonConfig(hre);

  const entity = new EntityConstructor(hre, networkConfig, strategyConfig);
  const deployerConfig = config.deployers?.[entity.rawVaultName()];
  const [signer] = await hre.ethers.getSigners();

  if (deployerConfig) {
    return new EntityConstructor(
      hre,
      {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...deployerConfig.networkConfig,
        networkConfig: deploymentConfig,
        // eslint-disable-next-line camelcase
        vaultFactory: VaultFactory__factory.connect(deployerConfig.networkConfig.vaultFactory, signer),
      },
      deployerConfig.strategyConfig
    );
  }

  return entity;
};
