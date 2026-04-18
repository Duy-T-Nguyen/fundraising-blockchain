import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Security Validations", function () {
  let factory: any;
  let campaign: any;
  let supplierRegistry: any;
  let owner: HardhatEthersSigner;
  let manager: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let supplier: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.01");

  beforeEach(async () => {
    [owner, manager, donor1, supplier, verifier] = await ethers.getSigners();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(owner.address);
    await supplierRegistry.addSupplier(supplier.address);
    // Manager tries to whitelist themselves (should fail if not admin, but here we test the check in Campaign)
    // For testing purposes, we assume admin is honest and doesn't whitelist manager as supplier

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), owner.address);

    await factory.connect(manager).submitCampaignRequest("Security Test", "Test Desc", "QmTest", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });
    await factory.connect(owner).approveCampaignRequest(0);

    const addresses = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(addresses[0]);
  });

  describe("Recipient & Verifier Constraints", function () {
    it("should NOT allow manager to be the recipient in createRequest", async () => {
        // Manager cannot be recipient even if they are whitelisted as supplier (extra safety)
        await supplierRegistry.connect(owner).addSupplier(manager.address);
        
        await expect(
            campaign.connect(manager).createRequest("Self Deal", ethers.parseEther("1"), manager.address, "QmEvidence")
        ).to.be.revertedWithCustomError(campaign, "ManagerNotAllowedAsRecipient");
    });

    it("should NOT allow manager to be the recipient in createMultiStageRequest", async () => {
        await expect(
            campaign.connect(manager).createMultiStageRequest(
                "Multi Self Deal", 
                manager.address, 
                verifier.address, 
                [ethers.parseEther("1")], 
                ["Stage 1"]
            )
        ).to.be.revertedWithCustomError(campaign, "ManagerNotAllowedAsRecipient");
    });

    it("should NOT allow manager to be the verifier", async () => {
        await expect(
            campaign.connect(manager).createMultiStageRequest(
                "Self Verify", 
                supplier.address, 
                manager.address, 
                [ethers.parseEther("1")], 
                ["Stage 1"]
            )
        ).to.be.revertedWithCustomError(campaign, "ManagerNotAllowedAsVerifier");
    });

    it("should NOT allow supplier to be their own verifier", async () => {
        await expect(
            campaign.connect(manager).createMultiStageRequest(
                "Supplier Verify", 
                supplier.address, 
                supplier.address, 
                [ethers.parseEther("1")], 
                ["Stage 1"]
            )
        ).to.be.revertedWithCustomError(campaign, "RecipientNotAllowedAsVerifier");
    });
  });

  describe("Constructor Input Validations", function () {
    it("should NOT allow creating a campaign with empty name", async () => {
        await expect(
            factory.connect(manager).submitCampaignRequest("", "Desc", "Img", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") })
        ).to.be.revertedWithCustomError(factory, "EmptyDescription");
    });

    it("should NOT allow creating a campaign with empty description", async () => {
        // Factory uses the same error for empty fields often
        await expect(
            factory.connect(manager).submitCampaignRequest("Name", "", "Img", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") })
        ).to.be.revertedWithCustomError(factory, "EmptyDescription");
    });

    it("should NOT allow creating a campaign with empty imageHash", async () => {
        await expect(
            factory.connect(manager).submitCampaignRequest("Name", "Desc", "", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") })
        ).to.be.revertedWithCustomError(factory, "EmptyEvidenceHash");
    });
  });
});
