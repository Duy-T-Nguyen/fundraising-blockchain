import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Refund & Fee Optimization", function () {
  let factory: any;
  let campaign: any;
  let supplierRegistry: any;
  let owner: HardhatEthersSigner;
  let manager: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.1");
  const ANTI_SPAM_FEE = ethers.parseEther("0.005");

  let forwarder: any;

  beforeEach(async function () {
    [owner, manager, donor1, donor2, recipient, admin] = await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("Forwarder");
    forwarder = await Forwarder.deploy();
    const forwarderAddr = await forwarder.getAddress();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(admin.address, forwarderAddr);

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), admin.address, forwarderAddr);

    await supplierRegistry.connect(admin).setFactory(await factory.getAddress());
    await supplierRegistry.connect(admin).addSupplier(recipient.address, "Supplier 1", "ipfs://meta");

    // Create and approve a campaign
    await factory.connect(manager).submitCampaignRequest(
      "Refund Campaign", "Description", "QmImage", 0, MIN_CONTRIBUTION,
      { value: ANTI_SPAM_FEE }
    );
    await factory.connect(admin).approveCampaignRequest(0);

    const campaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 1);
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(campaigns[0]);
  });

  // =====================
  // REFUND TESTS
  // =====================
  describe("Donor Refund (claimRefund)", function () {
    it("should revert refund if campaign is still active", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await expect(campaign.connect(donor1).claimRefund())
        .to.be.revertedWithCustomError(campaign, "CampaignStillActive");
    });

    it("should revert refund if caller has no contribution", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.connect(manager).deactivateCampaign();
      await expect(campaign.connect(donor2).claimRefund())
        .to.be.revertedWithCustomError(campaign, "NoContributionFound");
    });

    it("should refund full amount when no funds have been spent", async () => {
      const donateAmount = ethers.parseEther("2");
      await campaign.connect(donor1).donate({ value: donateAmount });
      await campaign.connect(manager).deactivateCampaign();

      const balanceBefore = await ethers.provider.getBalance(donor1.address);
      const tx = await campaign.connect(donor1).claimRefund();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(donor1.address);

      // Full refund (minus gas)
      expect(BigInt(balanceAfter) + BigInt(gasUsed) - BigInt(balanceBefore)).to.equal(donateAmount);
    });

    it("should refund pro-rata when some funds were spent", async () => {
      // Two donors deposit equally
      await campaign.connect(donor1).donate({ value: ethers.parseEther("2") });
      await campaign.connect(donor2).donate({ value: ethers.parseEther("2") });
      // Total = 4 ETH

      // Manager spends 1 ETH via a request
      await campaign.connect(manager).createRequest(
        "Spend", ethers.parseEther("1"), recipient.address, owner.address, "QmEvidence"
      );
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "string"],
        [await campaign.getAddress(), 0, "FINAL"]
      );
      const signature = await owner.signMessage(ethers.toBeArray(messageHash));
      await campaign.connect(manager).finalizeRequest(0, signature, "QmProof");

      // Balance now: 3 ETH. Total raised: 4 ETH.
      // Each donor contributed 2 ETH / 4 ETH total = 50%.
      // Pro-rata refund: 50% * 3 ETH = 1.5 ETH each.

      await campaign.connect(manager).deactivateCampaign();

      const balanceBefore = await ethers.provider.getBalance(donor1.address);
      const tx = await campaign.connect(donor1).claimRefund();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(donor1.address);

      const refundReceived = BigInt(balanceAfter) + BigInt(gasUsed) - BigInt(balanceBefore);
      expect(refundReceived).to.equal(ethers.parseEther("1.5"));
    });

    it("should prevent double refund", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.connect(manager).deactivateCampaign();

      await campaign.connect(donor1).claimRefund();

      await expect(campaign.connect(donor1).claimRefund())
        .to.be.revertedWithCustomError(campaign, "NoContributionFound");
    });

    it("should emit RefundClaimed event", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.connect(manager).deactivateCampaign();

      await expect(campaign.connect(donor1).claimRefund())
        .to.emit(campaign, "RefundClaimed")
        .withArgs(donor1.address, ethers.parseEther("1"));
    });
  });

  // =====================
  // FEE REJECTION REFUND TESTS
  // =====================
  describe("Fee Refund on Rejection", function () {
    it("should refund 80% of anti-spam fee when request is rejected", async () => {
      const balanceBefore = await ethers.provider.getBalance(donor1.address);

      // donor1 submits a campaign request
      const tx1 = await factory.connect(donor1).submitCampaignRequest(
        "Test", "Desc", "QmHash", 0, MIN_CONTRIBUTION,
        { value: ANTI_SPAM_FEE }
      );
      const receipt1 = await tx1.wait();
      const gas1 = receipt1!.gasUsed * receipt1!.gasPrice;

      const balanceAfterSubmit = await ethers.provider.getBalance(donor1.address);

      // Admin rejects the request
      await factory.connect(admin).rejectCampaignRequest(1); // requestId = 1

      const balanceAfterReject = await ethers.provider.getBalance(donor1.address);

      // donor1 should have received back 80% of 0.005 ETH = 0.004 ETH
      const refundExpected = (ANTI_SPAM_FEE * 8000n) / 10000n;
      expect(balanceAfterReject - balanceAfterSubmit).to.equal(refundExpected);
    });

    it("should NOT refund fee when request is approved", async () => {
      const balanceBefore = await ethers.provider.getBalance(donor1.address);

      const tx1 = await factory.connect(donor1).submitCampaignRequest(
        "Good Campaign", "Good Desc", "QmGood", 0, MIN_CONTRIBUTION,
        { value: ANTI_SPAM_FEE }
      );
      const receipt1 = await tx1.wait();
      const gas1 = receipt1!.gasUsed * receipt1!.gasPrice;

      const balanceAfterSubmit = await ethers.provider.getBalance(donor1.address);

      // Admin approves
      await factory.connect(admin).approveCampaignRequest(1);

      const balanceAfterApprove = await ethers.provider.getBalance(donor1.address);

      // No refund should have happened
      expect(balanceAfterApprove).to.equal(balanceAfterSubmit);
    });
  });
});
