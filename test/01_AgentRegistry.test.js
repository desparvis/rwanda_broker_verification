const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AgentRegistry Contract Tests", function () {
  // We use a fixture to deploy the contract once and reset the state for every test
  async function deployRegistryFixture() {
    // Get test accounts from Hardhat
    const [admin, broker1, broker2, nonAdmin] = await ethers.getSigners();

    // Deploy the contract
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy();

    // Standard test data
    const nidaHash = "NIDA-HASH-123456";
    const licenseNum = "RWB/2026/001";
    const fullName = "Kigali Real Estate Agent";
    const agency = "Premier Brokers";
    const validityDays = 365;

    return { registry, admin, broker1, broker2, nonAdmin, nidaHash, licenseNum, fullName, agency, validityDays };
  }

  describe("1. Deployment & Admin Setup", function () {
    it("Should set the correct admin address during deployment", async function () {
      const { registry, admin } = await loadFixture(deployRegistryFixture);
      expect(await registry.admin()).to.equal(admin.address);
    });

    it("Should start with zero total brokers", async function () {
      const { registry } = await loadFixture(deployRegistryFixture);
      expect(await registry.getTotalBrokers()).to.equal(0);
    });
  });

  describe("2. Broker Registration", function () {
    it("Should allow the admin to register a new broker successfully", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      // Register the broker
      await expect(registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays))
        .to.emit(registry, "BrokerRegistered")
        .withArgs(broker1.address, licenseNum, await time.latest() + (validityDays * 86400)); // 86400 seconds in a day

      // Check broker details in the mapping
      const brokerData = await registry.brokers(broker1.address);
      expect(brokerData.isRegistered).to.equal(true);
      expect(brokerData.fullName).to.equal(fullName);
      
      // Check total brokers count
      expect(await registry.getTotalBrokers()).to.equal(1);
    });

    it("Should block non-admins from registering brokers", async function () {
      const { registry, nonAdmin, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      // Connect as nonAdmin and try to register
      await expect(
        registry.connect(nonAdmin).registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays)
      ).to.be.revertedWithCustomError(registry, "OnlyAdmin");
    });

    it("Should prevent registering the same broker twice", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);

      // Attempt second registration
      await expect(
        registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays)
      ).to.be.revertedWithCustomError(registry, "BrokerAlreadyRegistered");
    });
  });

  describe("3. Broker Renewal", function () {
    it("Should add days to an active broker's license", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);
      
      const initialData = await registry.brokers(broker1.address);
      const additionalDays = 30;

      await expect(registry.renewBroker(broker1.address, additionalDays))
        .to.emit(registry, "BrokerRenewed");

      const newData = await registry.brokers(broker1.address);
      // Validate the expiration time increased by exactly 30 days (2592000 seconds)
      expect(newData.expirationTime).to.equal(initialData.expirationTime + BigInt(additionalDays * 86400));
    });

    it("Should revert renewal if the broker is not registered", async function () {
      const { registry, broker2 } = await loadFixture(deployRegistryFixture);

      await expect(
        registry.renewBroker(broker2.address, 30)
      ).to.be.revertedWithCustomError(registry, "BrokerNotRegistered");
    });
  });

  describe("4. Broker Revocation", function () {
    it("Should allow admin to revoke an active license and emit event", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);

      await expect(registry.revokeBroker(broker1.address))
        .to.emit(registry, "BrokerRevoked")
        .withArgs(broker1.address);

      const revokedData = await registry.brokers(broker1.address);
      expect(revokedData.isRegistered).to.equal(false);
      expect(revokedData.expirationTime).to.equal(0);
    });
  });

  describe("5. Public Verification (isAgentValid)", function () {
    it("Should return true for a newly registered, active broker", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);
      expect(await registry.isAgentValid(broker1.address)).to.equal(true);
    });

    it("Should return false if a broker is revoked", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);
      await registry.revokeBroker(broker1.address);
      
      expect(await registry.isAgentValid(broker1.address)).to.equal(false);
    });

    it("Should return false if a broker's license has expired over time", async function () {
      const { registry, broker1, nidaHash, licenseNum, fullName, agency, validityDays } = await loadFixture(deployRegistryFixture);

      await registry.registerBroker(broker1.address, nidaHash, licenseNum, fullName, agency, validityDays);

      // Fast forward time in the local blockchain past the validity days
      await time.increase((validityDays * 86400) + 100); 

      // Even though they were registered, time passed, so it should be false
      expect(await registry.isAgentValid(broker1.address)).to.equal(false);
    });
  });
});