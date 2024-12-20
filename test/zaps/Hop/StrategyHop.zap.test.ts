import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { StrategyHopDeployment } from "./deployment/StrategyHopCamelot.deployment";
import { expect } from "chai";
import { beefIn, beefOut, beefOutAndSwap } from "./utils";
import { runNetworkDescribe } from "../../utils/optional-tests";
import { NetworkName } from "../../../hardhat.config";
import { arbitrumContracts } from "../../constants";

runNetworkDescribe("Strategy ArbHopCamelot zap tests", NetworkName.ARBITRUM, false, async () => {
  it("deployment", async () => {
    const { zap, weth, stableCoin, strategyHop } = await loadFixture(StrategyHopDeployment);

    console.log(await strategyHop.depositToken());

    expect(stableCoin.address).eq(arbitrumContracts.tokens.USDC.token);
    expect(await zap.oneInchRouter()).eq(arbitrumContracts.oneInchRouter);
    expect(weth.address).eq(arbitrumContracts.tokens.WETH.token);
  });

  it("zap in test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyHopDeployment);

    const data =
      "0xe449022e000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000006291f1b35a92c6200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001800000000000000000000000c6962004f452be9203591991d15f6b388e09e8d08b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
  });

  it("zap out test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyHopDeployment);

    const data =
      "0xe449022e000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000006291f1b35a92c6200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001800000000000000000000000c6962004f452be9203591991d15f6b388e09e8d08b1ccac8";

    await beefIn(data, stableCoin, deployer, zap, vault, weth);
    await beefOut(weth, deployer, zap, vault, weth);
  });

  it("zap out and swap test", async () => {
    const { zap, weth, stableCoin, vault, deployer } = await loadFixture(StrategyHopDeployment);

    const zapInData =
      "0xe449022e000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000006291f1b35a92c6200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001800000000000000000000000c6962004f452be9203591991d15f6b388e09e8d08b1ccac8";

    await beefIn(zapInData, stableCoin, deployer, zap, vault, weth);

    const zapOutData =
      "0xe449022e00000000000000000000000000000000000000000000000006900faf1952a06c000000000000000000000000000000000000000000000000000000001ca205ce00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c6962004f452be9203591991d15f6b388e09e8d08b1ccac8";

    await beefOutAndSwap(vault, deployer, zap, stableCoin, weth, zapOutData);
  });
});
