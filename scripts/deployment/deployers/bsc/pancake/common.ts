import {
  DystopiaStaker__factory,
  StrategyCakeBoostedLP__factory,
  StrategyCommonSolidlyStakerLP__factory,
  VeCakeStaker__factory,
  VeloStaker__factory,
} from "../../../../../typechain-types";
import { VaultDeployer } from "../../../types/vault-deployer";

export const whitelistStrategy = async <TDeployer extends VaultDeployer>(deployer: TDeployer) => {
  console.log("whitelist strat start");
  const stakerAddress = deployer.networkConfig.networkConfig.contractsConfig.strategiesShared?.bscVeCakeStaker?.staker;
  if (!stakerAddress) throw new Error("VeCakeStaker is not deployed");

  const [signer] = await deployer.hre.ethers.getSigners();

  const staker = VeCakeStaker__factory.connect(stakerAddress, signer);
  const strategyAddress = deployer.strategyConfig.vaultConstructorParams?.strategy;

  if (!strategyAddress) throw new Error("Strategy is not deployed");

  const strat = StrategyCakeBoostedLP__factory.connect(strategyAddress, signer);

  if ((await staker.whitelistedStrategy(await strat.chef(), await strat.poolId())) !== strategyAddress) {
    await (await staker.whitelistStrategy(strategyAddress)).wait();
    console.log("Strategy is successfully whitelisted in VeCakeStaker");
  } else {
    console.log("Strategy is already whitelisted in VeCakeStaker");
  }

  return deployer;
};
