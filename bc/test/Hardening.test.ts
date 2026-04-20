import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Security Hardening & Snapshot Logic", function () {
  let factory: any;
  let campaign: any;
  let supplierRegistry: any;
  let validatorPool: any;
  let owner: HardhatEthersSigner;
  let manager: HardhatEthersSigner;
  let donorOld: HardhatEthersSigner;
  let donorNew: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.1");

  let forwarder: any;

  beforeEach(async function () {
    [owner, manager, donorOld, donorNew, recipient, admin] = await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("Forwarder");
    forwarder = await Forwarder.deploy();
    const forwarderAddr = await forwarder.getAddress();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(admin.address, forwarderAddr);

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), admin.address, forwarderAddr);

    await supplierRegistry.connect(admin).setFactory(await factory.getAddress());
    await supplierRegistry.connect(admin).addSupplier(recipient.address, "Supplier 1", "ipfs://meta");

    // Submit and approve campaign request
    const antiSpamFee = ethers.parseEther("0.005");
    await factory.connect(manager).submitCampaignRequest(
      "Hardened Campaign",
      "Description",
      "QmImage",
      0,
      MIN_CONTRIBUTION,
      { value: antiSpamFee }
    );
    await factory.connect(admin).approveCampaignRequest(0);

    const campaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 1);
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(campaigns[0]);

    const vpAddr = await campaign.validatorPool();
    const ValidatorPool = await ethers.getContractFactory("ValidatorPool");
    validatorPool = await ValidatorPool.attach(vpAddr);

    // Add validators to the pool
    await validatorPool.connect(admin).addValidator(owner.address);
    await validatorPool.connect(admin).addValidator(donorOld.address);
    await validatorPool.connect(admin).addValidator(donorNew.address);

    // Pre-donate and create a request for all tests
    await campaign.connect(donorOld).donate({ value: ethers.parseEther("10") });
    
    await campaign.connect(manager).createRequest("Initial Req", 100, recipient.address, owner.address, "QmEvidence");
  });

  describe("Manager Restrictions (Issue B)", function () {
    it("should prevent manager from donating to their own campaign", async () => {
      await expect(campaign.connect(manager).donate({ value: MIN_CONTRIBUTION }))
        .to.be.revertedWithCustomError(campaign, "ManagerCannotDonate");
    });

    it("should prevent manager from voting as a donor", async () => {
      await expect(campaign.connect(manager).approveRequest(0))
        .to.be.revertedWithCustomError(campaign, "NotDonor");
    });

    it("should prevent manager from voting as a validator", async () => {
      await expect(campaign.connect(manager).approveAsValidator(0))
        .to.be.revertedWithCustomError(campaign, "ManagerCannotVote");
    });
  });

  describe("Validator Pool Management (Issue A)", function () {
    it("should prevent manager from adding validators to the pool", async () => {
      await expect(validatorPool.connect(manager).addValidator(donorNew.address))
        .to.be.revertedWithCustomError(validatorPool, "NotAdmin");
    });

    it("should allow platform admin to add validators", async () => {
      const newValidator = ethers.Wallet.createRandom().address;
      await expect(validatorPool.connect(admin).addValidator(newValidator))
        .to.not.be.reverted;
      expect(await validatorPool.isValidator(newValidator)).to.be.true;
    });
  });

  describe("Snapshot & Eligibility Logic (Issue C)", function () {
    it("should only allow donors who joined BEFORE request to vote", async () => {
      // donorNew joins after Initial Req
      await campaign.connect(donorNew).donate({ value: ethers.parseEther("1") });
      
      // donorOld should be able to vote
      await expect(campaign.connect(donorOld).approveRequest(0)).to.not.be.reverted;
      
      // donorNew should be blocked
      await expect(campaign.connect(donorNew).approveRequest(0))
        .to.be.revertedWithCustomError(campaign, "JoinedAfterRequest");
    });

    it("should allow donor to update vote weight after donating more", async () => {
      await campaign.connect(donorOld).approveRequest(0);
      let req = await campaign.requests(0);
      const weightBefore = req.totalApprovalWeight;
      
      // Donate more
      await campaign.connect(donorOld).donate({ value: ethers.parseEther("1") });
      
      // Update vote
      await expect(campaign.connect(donorOld).approveRequest(0)).to.not.be.reverted;
      req = await campaign.requests(0);
      expect(req.totalApprovalWeight).to.be.above(weightBefore);
    });

    it("should use snapshot funds for threshold", async () => {
      // Create request 1
      await campaign.connect(manager).createRequest("Req 1", ethers.parseEther("0.1"), recipient.address, owner.address, "QmEvidence");
      
      // Snapshot funds for Req 1 should be around 10.1 ETH.
      
      // New donor joins with 100 ETH. 
      await campaign.connect(donorNew).donate({ value: ethers.parseEther("100") });
      
      // donorOld has enough weight for snapshot threshold (10.1 ETH > 5.05 ETH)
      // but not for dynamic threshold (10.1 ETH < 55 ETH)
      await campaign.connect(donorOld).approveRequest(1); 
      
      const messageHash = ethers.solidityPackedKeccak256(
          ["address", "uint256", "string"],
          [await campaign.getAddress(), 1, "FINAL"]
      );
      const signature = await owner.signMessage(ethers.toBeArray(messageHash));
      
      await expect(campaign.connect(manager).finalizeRequest(1, signature, "QmProof"))
        .to.not.be.reverted;
    });
  });

  describe("Transparency (Issue D)", function () {
    it("should require evidence for multi-stage requests", async () => {
      await expect(campaign.connect(manager).createMultiStageRequest(
        "Multi", recipient.address, owner.address, [ethers.parseEther("0.01")], ["Step 1"], ""
      )).to.be.revertedWithCustomError(campaign, "EmptyEvidenceHash");
    });
  });
});
