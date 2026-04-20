import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Campaign Withdrawal Optimization + Supplier Registry", function () {
  let factory: any;
  let campaign: any;
  let validatorPool: any;
  let supplierRegistry: any;
  let platformAdmin: HardhatEthersSigner;
  let campaignManager: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let validator1: HardhatEthersSigner;
  let validator2: HardhatEthersSigner;
  let validator3: HardhatEthersSigner;
  let validator4: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let supplier: HardhatEthersSigner;
  let nonSupplier: HardhatEthersSigner;
  let getFinalSignature: (signer: HardhatEthersSigner, campaignAddr: string, index: number) => Promise<string>;

  const MIN_CONTRIBUTION = ethers.parseEther("0.1");

  beforeEach(async function () {
    [platformAdmin, campaignManager, donor1, donor2, validator1, validator2, validator3, validator4, verifier, supplier, nonSupplier] = await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("Forwarder");
    const forwarder = await Forwarder.connect(platformAdmin).deploy();
    const forwarderAddress = await forwarder.getAddress();

    // 1. Platform Admin deploys SupplierRegistry
    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.connect(platformAdmin).deploy(platformAdmin.address, forwarderAddress);

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.connect(platformAdmin).deploy(await supplierRegistry.getAddress(), platformAdmin.address, forwarderAddress);

    await supplierRegistry.setFactory(await factory.getAddress());
    await supplierRegistry.connect(platformAdmin).addSupplier(supplier.address, "Supplier 1", "ipfs://s1");

    // 4. Campaign Manager submits a Campaign Request and Platform Admin approves it
    const requestId = await factory.requestCount();
    await factory.connect(campaignManager).submitCampaignRequest("Test Campaign", "Desc", "Hash", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });
    await factory.connect(platformAdmin).approveCampaignRequest(requestId);
    
    const campaignAddress = await factory.deployedCampaigns(0);

    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(campaignAddress);

    const validatorPoolAddress = await campaign.validatorPool();
    const ValidatorPool = await ethers.getContractFactory("ValidatorPool");
    validatorPool = await ValidatorPool.attach(validatorPoolAddress);

    // 5. Setup Validators (managed by platform admin)
    await (validatorPool.connect(platformAdmin) as any).addValidator(validator1.address);
    await (validatorPool.connect(platformAdmin) as any).addValidator(validator2.address);
    await (validatorPool.connect(platformAdmin) as any).addValidator(validator3.address);
    await (validatorPool.connect(platformAdmin) as any).addValidator(validator4.address);

    // 6. Add funds to the campaign
    await campaign.connect(donor1).donate({ value: ethers.parseEther("10") });
    await campaign.connect(donor2).donate({ value: ethers.parseEther("10") });

    // Helper for FINAL signatures
    getFinalSignature = async (signer: HardhatEthersSigner, campaignAddr: string, index: number) => {
        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "uint256", "string"],
            [campaignAddr, index, "FINAL"]
        );
        return await signer.signMessage(ethers.toBeArray(messageHash));
    };
  });

  // =========================================================
  // SUPPLIER REGISTRY
  // =========================================================
  describe("SupplierRegistry", function () {
    it("Platform Admin can add a Supplier", async () => {
      const newSupplier = ethers.Wallet.createRandom().address;
      await supplierRegistry.connect(platformAdmin).addSupplier(newSupplier, "Supplier 2", "ipfs://s2");
      expect(await supplierRegistry.isSupplier(newSupplier)).to.equal(true);
    });

    it("Platform Admin can remove a Supplier", async () => {
      await supplierRegistry.connect(platformAdmin).removeSupplier(supplier.address);
      expect(await supplierRegistry.isSupplier(supplier.address)).to.equal(false);
    });

    it("should emit SupplierAdded event", async () => {
      const addr = ethers.Wallet.createRandom().address;
      await expect(supplierRegistry.connect(platformAdmin).addSupplier(addr, "S", "M"))
        .to.emit(supplierRegistry, "SupplierAdded")
        .withArgs(addr, "S");
    });

    it("should emit SupplierRemoved event", async () => {
      await expect(supplierRegistry.connect(platformAdmin).removeSupplier(supplier.address))
        .to.emit(supplierRegistry, "SupplierRemoved")
        .withArgs(supplier.address);
    });

    it("Campaign Manager CANNOT add a Supplier", async () => {
      await expect(
        supplierRegistry.connect(campaignManager).addSupplier(ethers.Wallet.createRandom().address, "S", "M")
      ).to.be.revertedWithCustomError(supplierRegistry, "NotAdmin");
    });

    it("Campaign Manager CANNOT remove a Supplier", async () => {
      await expect(
        supplierRegistry.connect(campaignManager).removeSupplier(supplier.address)
      ).to.be.revertedWithCustomError(supplierRegistry, "NotAdmin");
    });

    it("Donor CANNOT add a Supplier", async () => {
      await expect(
        supplierRegistry.connect(donor1).addSupplier(ethers.Wallet.createRandom().address, "S", "M")
      ).to.be.revertedWithCustomError(supplierRegistry, "NotAdmin");
    });

    it("should revert if adding duplicate Supplier", async () => {
      await expect(
        supplierRegistry.connect(platformAdmin).addSupplier(supplier.address, "S", "M")
      ).to.be.revertedWithCustomError(supplierRegistry, "AlreadyWhitelisted");
    });

    it("should revert if removing non-existent Supplier", async () => {
      await expect(
        supplierRegistry.connect(platformAdmin).removeSupplier(nonSupplier.address)
      ).to.be.revertedWithCustomError(supplierRegistry, "NotWhitelisted");
    });

    it("should return correct supplier count", async () => {
      expect(await supplierRegistry.getSupplierCount()).to.equal(1);
      await supplierRegistry.connect(platformAdmin).addSupplier(nonSupplier.address, "S", "M");
      expect(await supplierRegistry.getSupplierCount()).to.equal(2);
    });
  });

  // =========================================================
  // SUPPLIER WHITELIST ENFORCEMENT IN CAMPAIGN
  // =========================================================
  describe("Supplier Whitelist Enforcement", function () {
    it("Manager CAN create request for whitelisted Supplier", async () => {
      await campaign.connect(campaignManager).createRequest(
        "Buy rice from Supplier",
        ethers.parseEther("0.05"),
        supplier.address,
        verifier.address,
        "QmTestHash"
      );
      const request = await campaign.requests(0);
      expect(request.recipient).to.equal(supplier.address);
      expect(request.evidenceHash).to.equal("QmTestHash");
    });

    it("Manager CANNOT create request for non-whitelisted address", async () => {
      await expect(
        campaign.connect(campaignManager).createRequest(
          "Buy from unknown",
          ethers.parseEther("0.05"),
          nonSupplier.address,
          verifier.address,
        "QmTestHash"
      )
      ).to.be.revertedWithCustomError(campaign, "RecipientNotWhitelisted");
    });

    it("Manager CANNOT create multi-stage request for non-whitelisted address", async () => {
      await expect(
        campaign.connect(campaignManager).createMultiStageRequest(
          "Project",
          nonSupplier.address,
          verifier.address,
          [ethers.parseEther("1")],
          ["Phase 1"],
          "ipfs://initial"
        )
      ).to.be.revertedWithCustomError(campaign, "RecipientNotWhitelisted");
    });

    it("Manager CANNOT set self as recipient", async () => {
      await expect(
        campaign.connect(campaignManager).createRequest(
          "Self pay",
          100,
          campaignManager.address,
          verifier.address,
        "QmTestHash"
      )
      ).to.be.revertedWithCustomError(campaign, "ManagerNotAllowedAsRecipient");
    });
  });

  // =========================================================
  // PATH A: SMALL REQUESTS (VALIDATOR-ONLY)
  // =========================================================
  describe("Path A: Small Requests (Validator-only)", function () {
    it("should allow 2/3 validators to approve and finalize a small request", async () => {
      const amount = ethers.parseEther("0.05");
      await campaign.connect(campaignManager).createRequest("Small fix", amount, supplier.address, verifier.address, "QmTestHash");

      // Find selected validators and approve
      const selected: string[] = [];
      for (const v of [validator1, validator2, validator3, validator4]) {
        try {
          await campaign.connect(v).approveAsValidator(0);
          selected.push(v.address);
        } catch (e) {
          // Not selected
        }
      }
      expect(selected.length).to.equal(3);

      // 2 approved (first 2 in selected) + manager finalizes
      const beforeBalance = await ethers.provider.getBalance(supplier.address);
      const signature = await getFinalSignature(verifier, await campaign.getAddress(), 0);
      await campaign.connect(campaignManager).finalizeRequest(0, signature, "QmProof");
      const afterBalance = await ethers.provider.getBalance(supplier.address);

      expect(afterBalance - beforeBalance).to.equal(amount);
    });

    it("should revert if amount > 0.5% and try to use validator path", async () => {
      const largeAmount = ethers.parseEther("0.2"); // 1% of 20 ETH
      await campaign.connect(campaignManager).createRequest("Large one", largeAmount, supplier.address, verifier.address, "QmTestHash");

      await expect(campaign.connect(validator1).approveAsValidator(0))
        .to.be.revertedWithCustomError(campaign, "MilestoneNotApproved");
    });
  });

  // =========================================================
  // PATH B: MULTI-STAGE REQUESTS (DONOR + ORACLE)
  // =========================================================
  describe("Path B: Multi-Stage Requests (Donor + Oracle / Proof of Delivery)", function () {
    const milestoneValues = [ethers.parseEther("1"), ethers.parseEther("2")];
    const milestoneDescs = ["Delivery 1: 500 bags of rice", "Delivery 2: 1000 bags of rice"];

    it("should complete full Proof of Delivery flow", async () => {
      // 1. Manager creates multi-stage request for whitelisted Supplier
      await campaign.connect(campaignManager).createMultiStageRequest(
        "Rice distribution program",
        supplier.address,
        verifier.address,
        milestoneValues,
        milestoneDescs,
        "ipfs://initial"
      );

      // 2. Donors approve once
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // 3. Execute Delivery 1 — Verifier signs proof of delivery
      const domain = await campaign.getAddress();
      const messageHash1 = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [domain, 0, 0]
      );
      const signature1 = await verifier.signMessage(ethers.toBeArray(messageHash1));

      const before1 = await ethers.provider.getBalance(supplier.address);
      await campaign.connect(campaignManager).executeMilestone(0, signature1, "QmTestHash");
      const after1 = await ethers.provider.getBalance(supplier.address);
      expect(after1 - before1).to.equal(milestoneValues[0]);

      // 4. Execute Delivery 2
      const messageHash2 = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [domain, 0, 1]
      );
      const signature2 = await verifier.signMessage(ethers.toBeArray(messageHash2));
      await campaign.connect(campaignManager).executeMilestone(0, signature2, "QmTestHash");

      // 5. Verify request is complete
      const request = await campaign.requests(0);
      expect(request.complete).to.equal(true);
    });

    it("should revert if signature is from wrong verifier", async () => {
      await campaign.connect(campaignManager).createMultiStageRequest(
        "Project",
        supplier.address,
        verifier.address,
        milestoneValues,
        milestoneDescs,
        "ipfs://initial"
      );
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      const domain = await campaign.getAddress();
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [domain, 0, 0]
      );
      // Wrong signer
      const badSignature = await campaignManager.signMessage(ethers.toBeArray(messageHash));

      await expect(campaign.connect(campaignManager).executeMilestone(0, badSignature, "QmTestHash"))
        .to.be.revertedWithCustomError(campaign, "InvalidSignature");
    });
  });

  // =========================================================
  // END-TO-END: FULL WFP-STYLE FLOW
  // =========================================================
  describe("End-to-End: WFP-Style Aid Distribution", function () {
    it("full lifecycle: Admin whitelist → Manager request → Donor vote → Oracle verify → Supplier paid", async () => {
      // 1. Platform Admin has already whitelisted Supplier in beforeEach
      expect(await supplierRegistry.isSupplier(supplier.address)).to.equal(true);

      // 2. Campaign Manager creates request for Supplier
      await campaign.connect(campaignManager).createMultiStageRequest(
        "Emergency food aid - Batch 1",
        supplier.address,
        verifier.address,
        [ethers.parseEther("2"), ethers.parseEther("3")],
        ["500 food kits", "750 food kits"],
        "ipfs://initial"
      );

      // 3. Donors vote ONCE for total budget
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // 4. First delivery complete → Verifier signs proof
      const domain = await campaign.getAddress();
      const hash1 = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [domain, 0, 0]
      );
      const sig1 = await verifier.signMessage(ethers.toBeArray(hash1));

      const supplierBefore = await ethers.provider.getBalance(supplier.address);
      await campaign.connect(campaignManager).executeMilestone(0, sig1, "QmTestHash");
      const supplierAfter = await ethers.provider.getBalance(supplier.address);

      expect(supplierAfter - supplierBefore).to.equal(ethers.parseEther("2"));

      // 5. Second delivery complete
      const hash2 = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [domain, 0, 1]
      );
      const sig2 = await verifier.signMessage(ethers.toBeArray(hash2));
      await campaign.connect(campaignManager).executeMilestone(0, sig2, "QmTestHash");

      // 6. Verify: Request complete, Supplier received all funds
      const request = await campaign.requests(0);
      expect(request.complete).to.equal(true);

      const finalSupplierBalance = await ethers.provider.getBalance(supplier.address);
      expect(finalSupplierBalance - supplierBefore).to.equal(ethers.parseEther("5"));

      // 7. Campaign still has remaining funds
      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("15")); // 20 - 5
    });
  });
});
