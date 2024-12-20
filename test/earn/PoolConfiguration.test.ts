import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// eslint-disable-next-line node/no-missing-import
import { infraDeployment } from "./common/Infra.deployment";
// eslint-disable-next-line camelcase,node/no-missing-import
import { PoolConfigurationTester, PoolConfigurationTester__factory } from "../../typechain-types";
// eslint-disable-next-line node/no-missing-import
import { VaultConfigStruct } from "../../typechain-types/contracts/earn/testers/PoolConfigurationTester";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
// eslint-disable-next-line node/no-extraneous-import
import { parseUnits } from "@ethersproject/units";
import { ethers } from "hardhat";

const poolConfigTestDeployment = async (
  ac: string,
  stableToken: string,
  aggregator: string,
  deployer: SignerWithAddress,
  vaultConfigs: VaultConfigStruct[]
): Promise<PoolConfigurationTester> => {
  const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();
  await poolConfig.initialize(ac, stableToken, aggregator, vaultConfigs);

  return poolConfig;
};

describe("PoolConfiguration tests", () => {
  describe("deployment", async () => {
    it("should fail: not 100% total percentage", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);
      const poolConfig = await new PoolConfigurationTester__factory(deployer).deploy();

      await expect(
        poolConfig.initialize(ac.address, usdt.address, aggregator.address, [
          { vault: parsedVaultConfigs[0].vault, poolPart: parseUnits("50") },
        ])
      ).to.revertedWith("!totalPercentage");
    });
    it("should not fail", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      expect(await poolConfig.stableToken()).eq(usdt.address);
      expect(await poolConfig.priceAggregator()).eq(aggregator.address);
      const vaultConfigs = await poolConfig.getConfigs();
      for (let i = 0; i < parsedVaultConfigs.length; i++) {
        expect(vaultConfigs[i].vault).eq(parsedVaultConfigs[i].vault);
        expect(vaultConfigs[i].poolPart).eq(parsedVaultConfigs[i].poolPart);
      }
    });
  });

  describe("setLpHelper()", async () => {
    it("should fail: not owner", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await ac.revokeRole(await ac.OWNER_ROLE(), deployer.address);

      await expect(
        poolConfig.connect(deployer).setLpHelper(parsedVaultConfigs[0].vault, ethers.constants.AddressZero)
      ).revertedWith("!role");
    });
    it("should fail: not owner", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await expect(
        poolConfig.connect(deployer).setLpHelper(parsedVaultConfigs[0].vault, ethers.constants.AddressZero)
      ).revertedWith("zero address");
    });

    it("should not fail", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      // usdt address here is just for convenience not to deploy helper
      await poolConfig.connect(deployer).setLpHelper(parsedVaultConfigs[0].vault, usdt.address);

      expect(await poolConfig.lpHelpers(parsedVaultConfigs[0].vault)).eq(usdt.address);
    });
  });

  describe("setSlippage()", async () => {
    it("should fail: not earn manager", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await ac.revokeRole(await ac.EARN_MANAGER_ROLE(), deployer.address);

      await expect(poolConfig.connect(deployer).setSlippage(0)).revertedWith("!role");
    });

    it("should fail: not owner", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await expect(poolConfig.connect(deployer).setSlippage(parseUnits("101"))).revertedWith("!newSlippage");
    });

    it("should not fail", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      const newSlippage = parseUnits("100");

      await poolConfig.connect(deployer).setSlippage(newSlippage);

      expect(await poolConfig.slippagePercents()).eq(newSlippage);
    });
  });

  describe("setToReserveForAutomation()", async () => {
    it("should fail: not owner", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await ac.revokeRole(await ac.OWNER_ROLE(), deployer.address);
      await expect(poolConfig.connect(deployer).setToReserveForAutomation(0)).revertedWith("!role");
    });

    it("should not fail", async () => {
      const { deployer, ac, usdt, aggregator, parsedVaultConfigs } = await loadFixture(infraDeployment);

      const poolConfig = await poolConfigTestDeployment(
        ac.address,
        usdt.address,
        aggregator.address,
        deployer,
        parsedVaultConfigs
      );

      await poolConfig.connect(deployer).setToReserveForAutomation(10);
      expect(parseInt((await poolConfig.toReserveForAutomation()).toString())).eq(10);
    });
  });
});
