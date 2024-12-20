import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, Signer } from "ethers";
import {
  VaultV7,
  VaultV7Test__factory,
  // eslint-disable-next-line camelcase
  VaultV7__factory
} from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import {
  DeployVaultCommonParams,
  DeployVaultConfig,
  VaultDeployedConfig,
  isTestVaultConfig,
  vaults
} from "./Infra.deployment";
// eslint-disable-next-line node/no-extraneous-import
import { Provider } from "@ethersproject/providers";

export const deployVault = async (stratConfig: DeployVaultConfig, { ac, deployer }: DeployVaultCommonParams) => {
  if (isTestVaultConfig(stratConfig)) {
    const vault = await new VaultV7Test__factory(deployer).deploy();
    await vault.initialize(stratConfig.token);
    return vault;
  }

  // eslint-disable-next-line new-cap
  const strategy = await new stratConfig.factory(deployer).deploy();

  const vault = await new VaultV7__factory(deployer).deploy();
  await vault.initialize(strategy.address, "name", "symb", 21600);

  const params = stratConfig.getParams({
    unirouter: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    feeRecipient: "0x8237f3992526036787E8178Def36291Ab94638CD",
    feeConfig: "0x3d38BA27974410679afF73abD096D7Ba58870EAd",
    vault: vault.address,
    ac: ac.address,
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...stratConfig.commonParams,
  });

  await strategy.initialize(...params);

  return vault;
};

export const getVaultAndStrategyFromConfig = async <
  T1 extends Contract,
  T2 extends { connect(address: string, signerOrProvider: Signer | Provider): T1 }
>(
  vaultConfigs: VaultDeployedConfig[],
  deployer: SignerWithAddress,
  strategyKey: keyof typeof vaults,
  strategyFactoryType: T2
): Promise<{
  vault: VaultV7;
  strategy: T1;
}> => {
  const vault = vaultConfigs
    // eslint-disable-next-line camelcase
    .find(v => v.strategyKey === strategyKey)
    ?.vault.connect(deployer) as VaultV7;

  const strategy = (await strategyFactoryType.connect(await vault.strategy(), deployer)) as any as T1;

  return { vault, strategy };
};
