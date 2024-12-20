import { BigNumberish } from "ethers";
// eslint-disable-next-line node/no-missing-import,camelcase
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VaultFactory, VaultFactory__factory } from "../../../typechain-types";
// eslint-disable-next-line node/no-missing-import
// eslint-disable-next-line node/no-missing-import
import { StratFeeManagerAccessableInitializable } from "../../../typechain-types/contracts/strategies/Curve/StrategyConvex";
import { NetworkConfig } from "./network-config";
export type CommonAddressesAccessableStruct = StratFeeManagerAccessableInitializable.CommonAddressesAccessableStruct;

export const getNetworkDeploymentConfig = async (
  hre: HardhatRuntimeEnvironment,
  { contractsConfig, environment }: NetworkConfig
) => {
  const [deployer] = await hre.ethers.getSigners();

  if (!contractsConfig.vaultFactory) {
    throw new Error("Vault Factory is not set in config");
  }

  const commonParams = {
    feeConfig: contractsConfig.feeConfig.feeConfigurator,
    feeRecipient: contractsConfig.treasury,
    ac: contractsConfig.ac,
    unirouter: environment.unirouter,
  };

  Object.entries(commonParams).forEach(([, value]) => {
    if (!value) throw new Error("Invalid common params configuration");
  });

  return {
    deployCommonParams: commonParams,
    networkConfig: { contractsConfig, environment },
    // eslint-disable-next-line camelcase
    vaultFactory: VaultFactory__factory.connect(contractsConfig.vaultFactory, deployer),
    // eslint-disable-next-line no-use-before-define
  } as NetworkDeploymentConfig;
};

export type NetworkDeploymentConfig = {
  deployCommonParams: {
    vault?: string;
    unirouter: string;
    ac: string;
    feeRecipient: string;
    feeConfig: string;
  };
  networkConfig: NetworkConfig;
  vaultFactory: VaultFactory;
};

export type NetworkDeploymentJsonConfig = {
  deployCommonParams: {
    vault?: string;
    unirouter: string;
    ac: string;
    feeRecipient: string;
    feeConfig: string;
  };
  vaultFactory: string;
};

export class StrategyDeploymentConfig<TConstructorParams> {
  public getConstructorParams?: (commonParams: CommonAddressesAccessableStruct) => TConstructorParams;
  public vaultConfig?: {
    vaultName?: string;
    vaultSymbol?: string;
    strategyChangeApprovalDelay?: BigNumberish;
  };

  public strategyConfig?: {
    feeCategoryId?: BigNumberish;
    // fee config here
  };

  public readonly vaultConstructorParams?: {
    strategy: string;
    _name: string;
    _symbol: string;
    _approvalDelay: BigNumberish;
    // _feeRecipient: string;
    // _ac: string;
  };

  /**
   * @deprecated This variable should not be used anymore
   */
  public readonly masterAddress?: string;
  public readonly beaconAddress?: string;

  public createdAt?: Date;

  constructor(config: StrategyDeploymentConfig<TConstructorParams>) {
    Object.assign(this, config);
  }
}
