import { DystopiaStaker__factory, StrategyCommonSolidlyStakerLP__factory } from "../../../../../typechain-types";
import { VaultDeployer } from "../../../types/vault-deployer";

export const whitelistStrategy = async <TDeployer extends VaultDeployer>(deployer: TDeployer) => {
  console.log("whitelist strat");
  const stakerAddress = deployer.networkConfig.networkConfig.contractsConfig.strategiesShared?.dystopiaStaker?.staker;
  if (!stakerAddress) throw new Error("DistopiaStaker is not deployed");

  const [signer] = await deployer.hre.ethers.getSigners();

  const staker = DystopiaStaker__factory.connect(stakerAddress, signer);
  const strategyAddress = deployer.strategyConfig.vaultConstructorParams?.strategy;

  if (!strategyAddress) throw new Error("Strategy is not deployed");

  const strat = StrategyCommonSolidlyStakerLP__factory.connect(strategyAddress ?? "", signer);

  if ((await staker.whitelistedStrategy(await strat.gauge())) !== strategyAddress) {
    await (await staker.whitelistStrategy(strategyAddress)).wait();
    console.log("Strategy is successfully whitelisted in DystopiaStaker");
  } else {
    console.log("Strategy is already whitelisted in DystopiaStaker");
  }

  return deployer;
};
