import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Campaign & Factory", function () {
  let factory: any;
  let campaign: any;
  let supplierRegistry: any;
  let owner: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let donor3: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let nonDonor: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.01");

  beforeEach(async () => {
    [owner, donor1, donor2, donor3, recipient, nonDonor] =
      await ethers.getSigners();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(owner.address);
    await supplierRegistry.addSupplier(recipient.address);

    const CampaignFactory =
      await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), owner.address);

    const createAndApprove = async (mgr: any, name: string, description: string, imageHash: string, cat: number, min: any) => {
      const count = await factory.requestCount();
      await factory.connect(mgr).submitCampaignRequest(name, description, imageHash, cat, min);
      await factory.connect(owner).approveCampaignRequest(count);
    };

    await createAndApprove(owner, "Test Campaign", "Test Description", "QmTest", 0, MIN_CONTRIBUTION);
    const addresses = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10); // ALL

    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(addresses[0]);

    // Expose helper to tests
    (factory as any).createAndApprove = createAndApprove;
  });

  // =========================================================
  // FACTORY TESTS
  // =========================================================
  describe("CampaignFactory", function () {
    it("should deploy factory and create a campaign", async () => {
      const campaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
      expect(campaigns.length).to.equal(1);
    });

    it("should track campaigns by manager", async () => {
      const managerCampaigns = await factory.getCampaigns(1, owner.address, 0, 0, 10);
      expect(managerCampaigns.length).to.equal(1);
    });

    it("should allow multiple campaigns from same manager", async () => {
      await factory.createAndApprove(owner, "Test 1", "Desc 1", "Qm1", 1, ethers.parseEther("0.05"));
      await factory.createAndApprove(owner, "Test 2", "Desc 2", "Qm2", 2, ethers.parseEther("0.1"));

      const all = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
      expect(all.length).to.equal(3);

      const byManager = await factory.getCampaigns(1, owner.address, 0, 0, 10);
      expect(byManager.length).to.equal(3);
    });

    it("should allow different managers to create campaigns", async () => {
      await factory
        .connect(donor1)
        .submitCampaignRequest("Test Donor1", "Desc Donor1", "QmDonor1", 0, ethers.parseEther("0.02"));
      await factory.approveCampaignRequest(await factory.requestCount() - 1n);

      const allCampaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
      expect(allCampaigns.length).to.equal(2);

      const ownerCampaigns = await factory.getCampaigns(1, owner.address, 0, 0, 10);
      expect(ownerCampaigns.length).to.equal(1);

      const donor1Campaigns = await factory.getCampaigns(1, donor1.address, 0, 0, 10);
      expect(donor1Campaigns.length).to.equal(1);
    });

    it("should return correct campaigns count", async () => {
      expect(await factory.getCampaignsCount()).to.equal(1);

      await factory.createAndApprove(owner, "Test Add", "Desc Add", "QmAdd", 4, ethers.parseEther("0.05"));
      expect(await factory.getCampaignsCount()).to.equal(2);
    });

    it("should emit CampaignStarted event", async () => {
      await expect(factory.submitCampaignRequest("Test Emit", "Desc Emit", "QmEmit", 3, ethers.parseEther("0.05")))
        .to.emit(factory, "CampaignRequestSubmitted");
      
      await expect(factory.approveCampaignRequest(await factory.requestCount() - 1n))
        .to.emit(factory, "CampaignStarted")
        .withArgs(
          // We can't predict the exact address, so check other args
          (addr: string) => ethers.isAddress(addr),
          owner.address,
          "Test Emit",
          "Desc Emit",
          "QmEmit",
          3,
          ethers.parseEther("0.05")
        );
    });

    describe("Filtering & Pagination", function () {
      beforeEach(async () => {
        // Clear factory state for these tests by using a fresh setup if needed, 
        // but here we just add more to existing
        await factory.createAndApprove(owner, "Edu 1", "D1", "Q1", 0, MIN_CONTRIBUTION); // Education
        await factory.createAndApprove(owner, "Edu 2", "D2", "Q2", 0, MIN_CONTRIBUTION); // Education
        await factory.createAndApprove(owner, "Med 1", "D3", "Q3", 1, MIN_CONTRIBUTION); // Medical
        await factory.createAndApprove(owner, "Med 2", "D4", "Q4", 1, MIN_CONTRIBUTION); // Medical
        await factory.createAndApprove(owner, "Dis 1", "D5", "Q5", 2, MIN_CONTRIBUTION); // Disaster
      });

      it("should return correct count for each category", async () => {
        // category 0 (Edu) has 1 (from setup) + 2 (from beforeEach) = 3
        expect(await factory.getCategoryCount(0)).to.equal(3);
        // category 1 (Med) has 2
        expect(await factory.getCategoryCount(1)).to.equal(2);
        // category 2 (Dis) has 1
        expect(await factory.getCategoryCount(2)).to.equal(1);
      });

      it("should filter campaigns by category correctly", async () => {
        const eduCampaigns = await factory.getCampaigns(2, ethers.ZeroAddress, 0, 0, 10);
        expect(eduCampaigns.length).to.be.at.least(2);
        
        for (const addr of eduCampaigns) {
          const Campaign = await ethers.getContractFactory("Campaign");
          const c = await Campaign.attach(addr);
          expect(await (c as any).category()).to.equal(0);
        }
      });

      it("should support pagination", async () => {
        // Get first 2 Education campaigns
        const page1 = await factory.getCampaigns(2, ethers.ZeroAddress, 0, 0, 2);
        expect(page1.length).to.equal(2);

        // Get next Education campaigns
        const page2 = await factory.getCampaigns(2, ethers.ZeroAddress, 0, 2, 2);
        expect(page2.length).to.be.at.least(1);
        
        // Ensure no overlap
        expect(page1[0]).to.not.equal(page2[0]);
        expect(page1[1]).to.not.equal(page2[0]);
      });

      it("should return empty array for out of bounds offset", async () => {
        const empty = await factory.getCampaigns(2, ethers.ZeroAddress, 0, 100, 10);
        expect(empty.length).to.equal(0);
      });
    });
  });

  // =========================================================
  // DEPLOYMENT & INITIALIZATION
  // =========================================================
  describe("Deployment", function () {
    it("should deploy with correct manager", async () => {
      const summary = await campaign.getSummary();
      expect(summary.managerAddr).to.equal(owner.address);
    });

    it("should deploy with correct minimum contribution", async () => {
      const summary = await campaign.getSummary();
      expect(summary.minContribution).to.equal(MIN_CONTRIBUTION);
    });

    it("should be active after deployment", async () => {
      const summary = await campaign.getSummary();
      expect(summary.isActive).to.equal(true);
    });

    it("should start with zero balance and donors", async () => {
      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(0);
      expect(summary.donors).to.equal(0);
      expect(summary.numRequests).to.equal(0);
    });
  });

  // =========================================================
  // DONATIONS
  // =========================================================
  describe("Donations", function () {
    it("should accept a donation at minimum", async () => {
      await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });

      const contribution = await campaign.contributions(donor1.address);
      expect(contribution).to.equal(MIN_CONTRIBUTION);
    });

    it("should accept donations and track donors count", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("0.05") });

      const summary = await campaign.getSummary();
      expect(summary.donors).to.equal(1n);
    });

    it("should accumulate contributions from same donor", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("0.05") });
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("0.1") });

      const contribution = await campaign.contributions(donor1.address);
      expect(contribution).to.equal(ethers.parseEther("0.15"));

      // Should NOT increase donor count for same donor
      const summary = await campaign.getSummary();
      expect(summary.donors).to.equal(1n);
    });

    it("should track multiple donors correctly", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("0.05") });
      await campaign
        .connect(donor2)
        .donate({ value: ethers.parseEther("0.1") });
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("0.02") });

      const summary = await campaign.getSummary();
      expect(summary.donors).to.equal(3n);
      expect(summary.balance).to.equal(ethers.parseEther("0.17"));
    });

    it("should revert if donation is below minimum", async () => {
      await expect(
        campaign
          .connect(donor1)
          .donate({ value: ethers.parseEther("0.005") })
      ).to.be.revertedWithCustomError(campaign, "InsufficientFunds");
    });

    it("should revert if donation is zero", async () => {
      await expect(
        campaign.connect(donor1).donate({ value: 0 })
      ).to.be.revertedWithCustomError(campaign, "InsufficientFunds");
    });

    it("should emit Donation event", async () => {
      await expect(
        campaign
          .connect(donor1)
          .donate({ value: ethers.parseEther("0.05") })
      )
        .to.emit(campaign, "Donation")
        .withArgs(donor1.address, ethers.parseEther("0.05"));
    });

    it("should update contract balance", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });

      const balance = await ethers.provider.getBalance(
        await campaign.getAddress()
      );
      expect(balance).to.equal(ethers.parseEther("1"));
    });
  });

  // =========================================================
  // CREATE REQUEST
  // =========================================================
  describe("Create Request", function () {
    it("manager can create a request", async () => {
      await campaign.createRequest(
        "Buy supplies",
        ethers.parseEther("0.05"),
        recipient.address,
        "QmTestHash"
      );

      const request = await campaign.requests(0);
      expect(request.description).to.equal("Buy supplies");
      expect(request.value).to.equal(ethers.parseEther("0.05"));
      expect(request.recipient).to.equal(recipient.address);
      expect(request.complete).to.equal(false);
      expect(request.approvalCount).to.equal(0n);
      expect(request.evidenceHash).to.equal("QmTestHash");
    });

    it("should emit RequestCreated event", async () => {
      await expect(
        campaign.createRequest(
          "Buy supplies",
          ethers.parseEther("0.05"),
          recipient.address,
        "QmTestHash"
      )
      )
        .to.emit(campaign, "RequestCreated")
        .withArgs(
          0,
          "Buy supplies",
          ethers.parseEther("0.05"),
          recipient.address,
        "QmTestHash"
      );
    });

    it("should track multiple requests", async () => {
      await campaign.createRequest("Request 1", 100, recipient.address, "QmTestHash");
      await campaign.createRequest("Request 2", 200, recipient.address, "QmTestHash");
      await campaign.createRequest("Request 3", 300, recipient.address, "QmTestHash");

      expect(await campaign.getRequestsCount()).to.equal(3);
    });

    it("only manager can create request", async () => {
      await expect(
        campaign
          .connect(donor1)
          .createRequest("Buy supplies", 100, recipient.address, "QmTestHash")
      ).to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("should revert with zero value", async () => {
      await expect(
        campaign.createRequest("Buy supplies", 0, recipient.address, "QmTestHash")
      ).to.be.revertedWithCustomError(campaign, "InsufficientFunds");
    });

    it("should revert with zero-address recipient", async () => {
      await expect(
        campaign.createRequest("Buy supplies", 100, ethers.ZeroAddress, "QmTestHash")
      ).to.be.revertedWithCustomError(campaign, "InvalidAddress");
    });

    it("should revert with empty description", async () => {
      await expect(
        campaign.createRequest("", 100, recipient.address, "QmTestHash")
      ).to.be.revertedWithCustomError(campaign, "EmptyDescription");
    });

    it("should revert with empty evidence hash", async () => {
      await expect(
        campaign.createRequest("Buy supplies", 100, recipient.address, "")
      ).to.be.revertedWithCustomError(campaign, "EmptyEvidenceHash");
    });
  });

  // =========================================================
  // VOTING (approveRequest)
  // =========================================================
  describe("Voting", function () {
    beforeEach(async () => {
      // Setup: donors donate and manager creates a request
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });
      await campaign
        .connect(donor2)
        .donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        "Spend money",
        ethers.parseEther("0.5"),
        recipient.address,
        "QmTestHash"
      );
    });

    it("should allow a donor to vote", async () => {
      await campaign.connect(donor1).approveRequest(0);

      const request = await campaign.requests(0);
      expect(request.approvalCount).to.equal(1n);
    });

    it("should emit Voted event", async () => {
      await expect(campaign.connect(donor1).approveRequest(0))
        .to.emit(campaign, "Voted")
        .withArgs(donor1.address, 0);
    });

    it("should revert if non-donor tries to vote", async () => {
      await expect(
        campaign.connect(nonDonor).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "NotDonor");
    });

    it("should revert if donor double-votes", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await expect(
        campaign.connect(donor1).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "AlreadyVoted");
    });

    it("should revert if manager tries to vote", async () => {
      // Manager donates first to become a donor
      await campaign
        .connect(owner)
        .donate({ value: ethers.parseEther("1") });

      await expect(
        campaign.connect(owner).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "ManagerCannotVote");
    });

    it("should revert for invalid request index", async () => {
      await expect(
        campaign.connect(donor1).approveRequest(99)
      ).to.be.revertedWithCustomError(campaign, "InvalidRequestIndex");
    });

    it("should revert if voting on completed request", async () => {
      // Get 100% vote and finalize
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      await campaign.finalizeRequest(0);

      // donor3 joins and tries to vote on completed request
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("1") });

      await expect(
        campaign.connect(donor3).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "RequestCompleted");
    });
  });

  // =========================================================
  // FINALIZE REQUEST
  // =========================================================
  describe("Finalize Request", function () {
    beforeEach(async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("2") });
      await campaign
        .connect(donor2)
        .donate({ value: ethers.parseEther("2") });
      await campaign.createRequest(
        "Spend money",
        ethers.parseEther("1"),
        recipient.address,
        "QmTestHash"
      );
    });

    it("should finalize when > 50% approval (2/2 donors)", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      const before = await ethers.provider.getBalance(recipient.address);
      await campaign.finalizeRequest(0);
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("1"));
    });

    it("should revert with exactly 50% votes (1 out of 2)", async () => {
      await campaign.connect(donor1).approveRequest(0);

      // 1/2 = 50% which is NOT > 50%
      await expect(
        campaign.finalizeRequest(0)
      ).to.be.revertedWithCustomError(campaign, "NotEnoughApprovals");
    });

    it("should finalize with > 50% (2 out of 3 donors)", async () => {
      // Add a third donor
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("1") });

      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      // 2/3 > 50%, should pass

      const before = await ethers.provider.getBalance(recipient.address);
      await campaign.finalizeRequest(0);
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("1"));
    });

    it("should revert if not enough votes (1 out of 3 donors)", async () => {
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("1") });
      await campaign.connect(donor1).approveRequest(0);
      // 1/3 <= 50%

      await expect(
        campaign.finalizeRequest(0)
      ).to.be.revertedWithCustomError(campaign, "NotEnoughApprovals");
    });

    it("should emit FundsReleased event", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      await expect(campaign.finalizeRequest(0))
        .to.emit(campaign, "FundsReleased")
        .withArgs(0);
    });

    it("should not allow non-manager to finalize", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      await expect(
        campaign.connect(donor1).finalizeRequest(0)
      ).to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("should not allow double finalization", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      await campaign.finalizeRequest(0);

      await expect(
        campaign.finalizeRequest(0)
      ).to.be.revertedWithCustomError(campaign, "RequestCompleted");
    });

    it("should revert if contract balance is insufficient", async () => {
      // Create a request for more than the balance
      await campaign.createRequest(
        "Expensive",
        ethers.parseEther("100"),
        recipient.address,
        "QmTestHash"
      );

      await campaign.connect(donor1).approveRequest(1);
      await campaign.connect(donor2).approveRequest(1);

      await expect(
        campaign.finalizeRequest(1)
      ).to.be.revertedWithCustomError(campaign, "InsufficientFunds");
    });

    it("should revert for invalid request index", async () => {
      await expect(
        campaign.finalizeRequest(99)
      ).to.be.revertedWithCustomError(campaign, "InvalidRequestIndex");
    });

    it("should handle multiple requests independently", async () => {
      // Create second request
      await campaign.createRequest(
        "Second request",
        ethers.parseEther("0.5"),
        recipient.address,
        "QmTestHash"
      );

      // Vote and finalize first request
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      await campaign.finalizeRequest(0);

      // Second request should still be pending
      const req = await campaign.requests(1);
      expect(req.complete).to.equal(false);

      // Vote and finalize second request
      await campaign.connect(donor1).approveRequest(1);
      await campaign.connect(donor2).approveRequest(1);

      const before = await ethers.provider.getBalance(recipient.address);
      await campaign.finalizeRequest(1);
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("0.5"));
    });
  });

  // =========================================================
  // CAMPAIGN STATE MANAGEMENT
  // =========================================================
  describe("Campaign State", function () {
    it("manager can deactivate campaign", async () => {
      await campaign.deactivateCampaign();
      const summary = await campaign.getSummary();
      expect(summary.isActive).to.equal(false);
    });

    it("should emit CampaignDeactivated event", async () => {
      await expect(campaign.deactivateCampaign()).to.emit(
        campaign,
        "CampaignDeactivated"
      );
    });

    it("only manager can deactivate", async () => {
      await expect(
        campaign.connect(donor1).deactivateCampaign()
      ).to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("cannot deactivate twice", async () => {
      await campaign.deactivateCampaign();
      await expect(
        campaign.deactivateCampaign()
      ).to.be.revertedWithCustomError(campaign, "CampaignNotActive");
    });

    it("cannot donate to deactivated campaign", async () => {
      await campaign.deactivateCampaign();
      await expect(
        campaign.connect(donor1).donate({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(campaign, "CampaignNotActive");
    });

    it("cannot create request on deactivated campaign", async () => {
      await campaign.deactivateCampaign();
      await expect(
        campaign.createRequest("Test", 100, recipient.address, "QmTestHash")
      ).to.be.revertedWithCustomError(campaign, "CampaignNotActive");
    });

    it("cannot vote on deactivated campaign", async () => {
      // Donate and create request first
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        "Test",
        ethers.parseEther("0.1"),
        recipient.address,
        "QmTestHash"
      );

      // Deactivate
      await campaign.deactivateCampaign();

      await expect(
        campaign.connect(donor1).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "CampaignNotActive");
    });

    it("manager can still finalize approved requests after deactivation", async () => {
      // Setup: donate, create request, and approve
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        "Final spend",
        ethers.parseEther("0.5"),
        recipient.address,
        "QmTestHash"
      );
      await campaign.connect(donor1).approveRequest(0);

      // Deactivate campaign
      await campaign.deactivateCampaign();

      // Manager can still finalize (no onlyActive modifier on finalize)
      const before = await ethers.provider.getBalance(recipient.address);
      await campaign.finalizeRequest(0);
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("0.5"));
    });
  });

  // =========================================================
  // VIEW FUNCTIONS
  // =========================================================
  describe("View Functions", function () {
    it("getSummary returns correct data", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        "Test",
        ethers.parseEther("0.5"),
        recipient.address,
        "QmTestHash"
      );

      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("1"));
      expect(summary.minContribution).to.equal(MIN_CONTRIBUTION);
      expect(summary.numRequests).to.equal(1n);
      expect(summary.donors).to.equal(1n);
      expect(summary.managerAddr).to.equal(owner.address);
      expect(summary.imgHash).to.equal("QmTest");
      expect(summary.isActive).to.equal(true);
    });

    it("getRequestsCount returns correct count", async () => {
      expect(await campaign.getRequestsCount()).to.equal(0);

      await campaign.createRequest("Req 1", 100, recipient.address, "QmTestHash");
      expect(await campaign.getRequestsCount()).to.equal(1);

      await campaign.createRequest("Req 2", 200, recipient.address, "QmTestHash");
      expect(await campaign.getRequestsCount()).to.equal(2);
    });
  });

  // =========================================================
  // END-TO-END / INTEGRATION
  // =========================================================
  describe("End-to-End Flow", function () {
    it("full lifecycle: create campaign → donate → request → vote → finalize", async () => {
      // 1. Multiple donors donate
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("5") });
      await campaign
        .connect(donor2)
        .donate({ value: ethers.parseEther("3") });
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("2") });

      // 2. Manager creates request
      await campaign.createRequest(
        "Development costs",
        ethers.parseEther("4"),
        recipient.address,
        "QmTestHash"
      );

      // 3. Donors vote (need > 50% = need at least 2 out of 3)
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // 4. Manager finalizes
      const recipientBefore = await ethers.provider.getBalance(
        recipient.address
      );
      await campaign.finalizeRequest(0);
      const recipientAfter = await ethers.provider.getBalance(
        recipient.address
      );

      expect(recipientAfter - recipientBefore).to.equal(
        ethers.parseEther("4")
      );

      // 5. Verify final state
      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("6")); // 10 - 4
      expect(summary.donors).to.equal(3n);

      const request = await campaign.requests(0);
      expect(request.complete).to.equal(true);
    });

    it("multiple requests lifecycle", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("10") });

      // Create 3 requests
      await campaign.createRequest(
        "Phase 1",
        ethers.parseEther("2"),
        recipient.address,
        "QmTestHash"
      );
      await campaign.createRequest(
        "Phase 2",
        ethers.parseEther("3"),
        recipient.address,
        "QmTestHash"
      );
      await campaign.createRequest(
        "Phase 3",
        ethers.parseEther("4"),
        recipient.address,
        "QmTestHash"
      );

      // Approve and finalize all
      for (let i = 0; i < 3; i++) {
        await campaign.connect(donor1).approveRequest(i);
        await campaign.finalizeRequest(i);
      }

      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("1")); // 10 - 2 - 3 - 4
    });
  });
});