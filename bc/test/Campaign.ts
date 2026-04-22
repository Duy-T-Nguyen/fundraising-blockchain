import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("Campaign & Factory", function () {
  let factory: any;
  let campaign: any;
  let supplierRegistry: any;
  let forwarder: any;
  let forwarderAddress: string;
  let owner: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let donor3: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let nonDonor: HardhatEthersSigner;
  let getFinalSignature: (signer: HardhatEthersSigner, campaignAddr: string, index: number) => Promise<string>;

  const MIN_CONTRIBUTION = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, donor1, donor2, donor3, recipient, nonDonor] =
      await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("Forwarder");
    forwarder = await Forwarder.deploy();
    forwarderAddress = await forwarder.getAddress();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(owner.address, forwarderAddress);
    const CampaignFactory =
      await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), owner.address, forwarderAddress);

    await supplierRegistry.setFactory(await factory.getAddress());
    await supplierRegistry.addSupplier(recipient.address, ethers.encodeBytes32String("Tech Global"), ethers.encodeBytes32String("ipfs://techglobal"));

    const createAndApprove = async (mgr: any, name: string, description: string, imageHash: string, cat: number, min: any) => {
      const count = await factory.requestCount();
      await factory.connect(mgr).submitCampaignRequest(
        ethers.encodeBytes32String(name.slice(0, 31)), 
        ethers.encodeBytes32String(description.slice(0, 31)), 
        ethers.encodeBytes32String(imageHash.slice(0, 31)), 
        cat, 
        min, 
        { value: ethers.parseEther("0.005") }
      );
      await factory.connect(owner).approveCampaignRequest(count);
    };

    await createAndApprove(owner, "Test Campaign", "Test Description", "QmTest", 0, MIN_CONTRIBUTION);
    const addresses = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10); // ALL

    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(addresses[0]);

    // Expose helper to tests
    (factory as any).createAndApprove = createAndApprove;

    // Helper for FINAL signatures
    getFinalSignature = async (signer: HardhatEthersSigner, campaignAddr: string, index: number) => {
        const network = await ethers.provider.getNetwork();
        const messageHash = ethers.solidityPackedKeccak256(
            ["uint256", "address", "uint256", "string"],
            [network.chainId, campaignAddr, index, "FINAL"]
        );
        return await signer.signMessage(ethers.toBeArray(messageHash));
    };
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
        .submitCampaignRequest(
          ethers.encodeBytes32String("Test Donor1"), 
          ethers.encodeBytes32String("Desc Donor1"), 
          ethers.encodeBytes32String("QmDonor1"), 
          0, 
          ethers.parseEther("0.02"), 
          { value: ethers.parseEther("0.005") }
        );
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
      await expect(factory.submitCampaignRequest(
        ethers.encodeBytes32String("Test Emit"), 
        ethers.encodeBytes32String("Desc Emit"), 
        ethers.encodeBytes32String("QmEmit"), 
        3, 
        ethers.parseEther("0.05"), 
        { value: ethers.parseEther("0.005") }
      )).to.emit(factory, "CampaignRequestSubmitted");

      await expect(factory.approveCampaignRequest(await factory.requestCount() - 1n))
        .to.emit(factory, "CampaignStarted")
        .withArgs(
          // We can't predict the exact address, so check other args
          (addr: string) => ethers.isAddress(addr),
          owner.address,
          ethers.encodeBytes32String("Test Emit"),
          ethers.encodeBytes32String("Desc Emit"),
          ethers.encodeBytes32String("QmEmit"),
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

    describe("System Governance & Admin API", function () {
      it("should allow admin to update anti-spam fee", async () => {
        const newFee = ethers.parseEther("0.01");
        await expect(factory.updateAntiSpamFee(newFee))
          .to.emit(factory, "AntiSpamFeeUpdated")
          .withArgs(ethers.parseEther("0.005"), newFee);
        
        expect(await factory.antiSpamFee()).to.equal(newFee);
      });

      it("should prevent non-admin from updating anti-spam fee", async () => {
        const newFee = ethers.parseEther("0.01");
        await expect(factory.connect(donor1).updateAntiSpamFee(newFee))
          .to.be.revertedWithCustomError(factory, "NotAdmin");
      });

      it("should allow admin to transfer admin rights", async () => {
        await expect(factory.transferAdmin(donor1.address))
          .to.emit(factory, "AdminTransferred")
          .withArgs(owner.address, donor1.address);
        
        expect(await factory.admin()).to.equal(donor1.address);

        // Old admin can no longer update fee
        await expect(factory.updateAntiSpamFee(ethers.parseEther("0.02")))
          .to.be.revertedWithCustomError(factory, "NotAdmin");
        
        // Restore for other tests
        await factory.connect(donor1).transferAdmin(owner.address);
      });

      it("should support paginated queries for campaign requests (Admin)", async () => {
        // We already have 1 request from setup, let's add 2 more
        await factory.connect(donor1).submitCampaignRequest(
          ethers.encodeBytes32String("R1"), 
          ethers.encodeBytes32String("D1"), 
          ethers.encodeBytes32String("Q1"), 
          0, 
          MIN_CONTRIBUTION, 
          { value: ethers.parseEther("0.005") }
        );
        await factory.connect(donor2).submitCampaignRequest(
          ethers.encodeBytes32String("R2"), 
          ethers.encodeBytes32String("D2"), 
          ethers.encodeBytes32String("Q2"), 
          0, 
          MIN_CONTRIBUTION, 
          { value: ethers.parseEther("0.005") }
        );

        const [requests, total] = await factory.getCampaignRequests(0, 2);
        expect(requests.length).to.equal(2);
        expect(total).to.be.at.least(3n);
        expect(requests[0].manager).to.equal(owner.address); // First one is from setup
      });

      it("should support paginated queries for a specific manager", async () => {
        const [ownerRequests, ownerIds, ownerTotal] = await factory.getManagerRequests(owner.address, 0, 10);
        expect(ownerRequests.length).to.equal(1);
        expect(ownerTotal).to.equal(1n);
        expect(ownerRequests[0].manager).to.equal(owner.address);
        expect(ownerIds[0]).to.equal(0n);

        // Submit one request for donor1
        await factory.connect(donor1).submitCampaignRequest(
          ethers.encodeBytes32String("R3"), 
          ethers.encodeBytes32String("D3"), 
          ethers.encodeBytes32String("Q3"), 
          0, 
          MIN_CONTRIBUTION, 
          { value: ethers.parseEther("0.005") }
        );

        const [donor1Requests, donor1Ids, donor1Total] = await factory.getManagerRequests(donor1.address, 0, 10);
        expect(donor1Requests.length).to.equal(1); // Should be 1, not 2
        expect(donor1Total).to.equal(1n);
        expect(donor1Requests[0].manager).to.equal(donor1.address);
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

    describe("Donation History (On-chain tracking)", function () {
      it("should track donated campaigns in Factory", async () => {
        await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });
        
        const details = await factory.getUserDonationDetails(donor1.address, 0, 10);
        expect(details.campaigns.length).to.equal(1);
        expect(details.campaigns[0]).to.equal(await campaign.getAddress());
        expect(details.amounts[0]).to.equal(MIN_CONTRIBUTION);
        expect(details.total).to.equal(1);
      });

      it("should NOT duplicate campaigns in donor history", async () => {
        await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });
        await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });
        
        const details = await factory.getUserDonationDetails(donor1.address, 0, 10);
        expect(details.campaigns.length).to.equal(1);
        expect(details.amounts[0]).to.equal(MIN_CONTRIBUTION * 2n);
        expect(details.total).to.equal(1);
      });

      it("should track multiple different campaigns for one user", async () => {
        // Create another campaign
        await (factory as any).createAndApprove(owner, "Second Cam", "Desc", "QmHash", 0, MIN_CONTRIBUTION);
        const addresses = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
        const secondCampaign = await ethers.getContractAt("Campaign", addresses[1]);

        await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });
        await secondCampaign.connect(donor1).donate({ value: MIN_CONTRIBUTION * 2n });

        const details = await factory.getUserDonationDetails(donor1.address, 0, 10);
        expect(details.campaigns.length).to.equal(2);
        expect(details.total).to.equal(2);
        
        // Order: first campaign then second campaign
        expect(details.campaigns[0]).to.equal(await campaign.getAddress());
        expect(details.amounts[0]).to.equal(MIN_CONTRIBUTION);
        
        expect(details.campaigns[1]).to.equal(await secondCampaign.getAddress());
        expect(details.amounts[1]).to.equal(MIN_CONTRIBUTION * 2n);
      });

      it("should support pagination for donation history", async () => {
        // Create 3 campaigns and donate to all
        await (factory as any).createAndApprove(owner, "Cam 2", "D", "Q", 0, MIN_CONTRIBUTION);
        await (factory as any).createAndApprove(owner, "Cam 3", "D", "Q", 0, MIN_CONTRIBUTION);
        
        const allAddrs = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
        
        for (let i = 0; i < 3; i++) {
          const c = await ethers.getContractAt("Campaign", allAddrs[i]);
          await c.connect(donor1).donate({ value: MIN_CONTRIBUTION });
        }

        // Get page 1 (size 2)
        const page1 = await factory.getUserDonationDetails(donor1.address, 0, 2);
        expect(page1.campaigns.length).to.equal(2);
        expect(page1.total).to.equal(3);

        // Get page 2 (size 2)
        const page2 = await factory.getUserDonationDetails(donor1.address, 2, 2);
        expect(page2.campaigns.length).to.equal(1);
        expect(page2.total).to.equal(3);
        
        expect(page1.campaigns[0]).to.equal(allAddrs[0]);
        expect(page2.campaigns[0]).to.equal(allAddrs[2]);
      });
    });
  });

  // =========================================================
  // CREATE REQUEST
  // =========================================================
  describe("Create Request", function () {
    it("should allow manager to create a request", async () => {
      const verifier = donor2;
      // FIX E: Need sufficient funds before creating request
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        ethers.encodeBytes32String("Buy supplies"), 
        ethers.parseEther("0.05"), 
        recipient.address, 
        verifier.address, 
        ethers.encodeBytes32String("QmTestHash")
      );

      const request = await campaign.requests(0);
      expect(request.description).to.equal(ethers.encodeBytes32String("Buy supplies"));
      expect(request.value).to.equal(ethers.parseEther("0.05"));
      expect(request.recipient).to.equal(recipient.address);
      expect(request.status).to.equal(0); // OPEN
      expect(request.totalApprovalWeight).to.equal(0n);
      expect(request.evidenceHash).to.equal(ethers.encodeBytes32String("QmTestHash"));
    });

    it("should emit RequestCreated event", async () => {
      // FIX E: Need sufficient funds before creating request
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await expect(
        campaign.createRequest(
          ethers.encodeBytes32String("Buy supplies"),
          ethers.parseEther("0.05"),
          recipient.address,
          donor2.address,
          ethers.encodeBytes32String("QmTestHash")
        )
      )
        .to.emit(campaign, "RequestCreated")
        .withArgs(
          0,
          ethers.encodeBytes32String("Buy supplies"),
          ethers.parseEther("0.05"),
          recipient.address,
          donor2.address,
          ethers.encodeBytes32String("QmTestHash"),
          [],
          anyValue
        );
    });

    it("should allow manager to re-select validators after timeout", async () => {
        // Donate first to enable validator path
        await campaign.connect(donor1).donate({ value: ethers.parseEther("0.5") });
        await campaign.connect(donor2).donate({ value: ethers.parseEther("0.3") });
        await campaign.connect(donor3).donate({ value: ethers.parseEther("0.2") });
        
        // Create small request
        await campaign.createRequest(
          ethers.encodeBytes32String("Small"), 
          100, 
          recipient.address, 
          donor2.address, 
          ethers.encodeBytes32String("QmTest")
        );
        
        // Try to re-select immediately (should fail)
        await expect(campaign.connect(owner).reselectValidators(0))
            .to.be.revertedWithCustomError(campaign, "ActionTooSoon");
            
        // Fast forward 48 hours + 1 second
        await ethers.provider.send("evm_increaseTime", [48 * 3600 + 1]);
        await ethers.provider.send("evm_mine", []);
        
        // Now it should work
        await expect(campaign.connect(owner).reselectValidators(0))
            .to.emit(campaign, "RequestCreated");
    });

    it("should include selectedValidators in RequestCreated event for small requests", async () => {
      // Cần có donor donate đủ lớn để totalFundsRaised > 0 và value <= threshold
      await campaign.connect(donor1).donate({ value: ethers.parseEther("5") });
      await campaign.connect(donor2).donate({ value: ethers.parseEther("3") });
      await campaign.connect(donor3).donate({ value: ethers.parseEther("2") });

      // Value nhỏ (0.01 ETH) <= 0.5% of 10 ETH (0.05 ETH) -> sẽ kích hoạt validator selection
      const tx = await campaign.createRequest(
        ethers.encodeBytes32String("Small purchase"), 
        ethers.parseEther("0.01"), 
        recipient.address, 
        donor2.address, 
        ethers.encodeBytes32String("QmEvidence")
      );
      const receipt = await tx.wait();

      // Lọc event RequestCreated và kiểm tra selectedValidators
      const requestCreatedEvents = receipt!.logs.filter((log: any) => {
        try {
          const parsed = campaign.interface.parseLog({ topics: log.topics as string[], data: log.data });
          return parsed?.name === "RequestCreated";
        } catch { return false; }
      });

      expect(requestCreatedEvents.length).to.equal(1);
      const parsed = campaign.interface.parseLog({
        topics: requestCreatedEvents[0].topics as string[],
        data: requestCreatedEvents[0].data
      });
      // selectedValidators phải có đúng 3 validator
      expect(parsed!.args.selectedValidators.length).to.equal(3);
    });

    it("should track multiple requests", async () => {
      // FIX E: Need sufficient funds before creating requests
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(ethers.encodeBytes32String("Req 1"), 100, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"));
      await campaign.createRequest(ethers.encodeBytes32String("Req 2"), 200, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"));
      await campaign.createRequest(ethers.encodeBytes32String("Request 3"), 300, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"));

      expect(await campaign.getRequestsCount()).to.equal(3);
    });

    it("only manager can create request", async () => {
      await expect(
        campaign
          .connect(donor1)
          .createRequest(ethers.encodeBytes32String("Buy supplies"), 100, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"))
      ).to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("should revert with zero value", async () => {
      await expect(
        campaign.createRequest(ethers.encodeBytes32String("Buy supplies"), 0, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"))
      ).to.be.revertedWithCustomError(campaign, "InsufficientFunds");
    });

    it("should revert with zero-address recipient", async () => {
      await expect(
        campaign.createRequest(ethers.encodeBytes32String("Buy supplies"), 100, ethers.ZeroAddress, donor2.address, ethers.encodeBytes32String("QmTestHash"))
      ).to.be.revertedWithCustomError(campaign, "InvalidAddress");
    });

    it("should revert with empty description", async () => {
      await expect(
        campaign.createRequest(ethers.ZeroHash, 100, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"))
      ).to.be.revertedWithCustomError(campaign, "EmptyDescription");
    });

    it("should revert with empty evidence hash", async () => {
      await expect(
        campaign.createRequest(ethers.encodeBytes32String("Buy supplies"), 100, recipient.address, donor2.address, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(campaign, "EmptyEvidenceHash");
    });
  });

  // =========================================================
  // BUDGET RESERVATION (lockedFunds) - FIX E
  // =========================================================
  describe("Budget Reservation (lockedFunds)", function () {
    beforeEach(async () => {
      // Campaign has 5 ETH total
      await campaign.connect(donor1).donate({ value: ethers.parseEther("3") });
      await campaign.connect(donor2).donate({ value: ethers.parseEther("2") });
    });

    it("should revert when single request exceeds available balance", async () => {
      // Campaign balance = 5 ETH, try to create request for 6 ETH
      await expect(
        campaign.createRequest(
          ethers.encodeBytes32String("Too expensive"), 
          ethers.parseEther("6"), 
          recipient.address, 
          donor2.address, 
          ethers.encodeBytes32String("QmHash")
        )
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");
    });

    it("should revert when cumulative requests exceed balance", async () => {
      // Create first request for 3 ETH (OK, 5-3=2 available)
      await campaign.createRequest(
        ethers.encodeBytes32String("Req 1"), 
        ethers.parseEther("3"), 
        recipient.address, 
        donor2.address, 
        ethers.encodeBytes32String("QmHash1")
      );
      
      // Create second request for 2 ETH (OK, 2-2=0 available)
      await campaign.createRequest(
        ethers.encodeBytes32String("Req 2"), 
        ethers.parseEther("2"), 
        recipient.address, 
        donor2.address, 
        ethers.encodeBytes32String("QmHash2")
      );
      
      // Create third request for even 1 wei (should FAIL, 0 available)
      await expect(
        campaign.createRequest(
          ethers.encodeBytes32String("Req 3"), 
          1, 
          recipient.address, 
          donor2.address, 
          ethers.encodeBytes32String("QmHash3")
        )
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");
    });

    it("should allow new request after finalize releases locked funds", async () => {
      // Lock all 5 ETH
      await campaign.createRequest(
        ethers.encodeBytes32String("Req 1"), 
        ethers.parseEther("5"), 
        recipient.address, 
        donor2.address, 
        ethers.encodeBytes32String("QmHash1")
      );
      
      // No more room
      await expect(
        campaign.createRequest(ethers.encodeBytes32String("Req 2"), 1, recipient.address, donor2.address, ethers.encodeBytes32String("QmHash2"))
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");

      // Approve and finalize Req 1 → releases 5 ETH from locked
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      const sig = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, sig, ethers.encodeBytes32String("QmProof"));

      // Now balance = 0, lockedFunds = 0 → still can't create (no actual ETH)
      await expect(
        campaign.createRequest(ethers.encodeBytes32String("Req After"), ethers.parseEther("1"), recipient.address, donor2.address, ethers.encodeBytes32String("QmH"))
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");
    });

    it("should track availableFunds correctly", async () => {
      expect(await campaign.availableFunds()).to.equal(ethers.parseEther("5"));
      
      await campaign.createRequest(ethers.encodeBytes32String("Req 1"), ethers.parseEther("2"), recipient.address, donor2.address, ethers.encodeBytes32String("QmHash1"));
      expect(await campaign.availableFunds()).to.equal(ethers.parseEther("3"));
      
      await campaign.createRequest(ethers.encodeBytes32String("Req 2"), ethers.parseEther("3"), recipient.address, donor2.address, ethers.encodeBytes32String("QmHash2"));
      expect(await campaign.availableFunds()).to.equal(ethers.parseEther("0"));
    });

    it("should revert when multi-stage request exceeds available balance", async () => {
      // Lock 4 ETH first
      await campaign.createRequest(ethers.encodeBytes32String("Req 1"), ethers.parseEther("4"), recipient.address, donor2.address, ethers.encodeBytes32String("QmHash1"));
      
      // Try to create multi-stage with total 2 ETH (only 1 available)
      await expect(
        campaign.createMultiStageRequest(
          ethers.encodeBytes32String("Multi too big"),
          recipient.address,
          donor2.address,
          [ethers.parseEther("1"), ethers.parseEther("1")],
          [ethers.encodeBytes32String("M1"), ethers.encodeBytes32String("M2")],
          ethers.encodeBytes32String("QmInitial")
        )
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");
    });

    it("should release locked funds after milestone execution", async () => {
      // Create multi-stage request for 2 ETH total
      await campaign.createMultiStageRequest(
        ethers.encodeBytes32String("Multi project"),
        recipient.address,
        donor2.address,
        [ethers.parseEther("1"), ethers.parseEther("1")],
        [ethers.encodeBytes32String("Phase 1"), ethers.encodeBytes32String("Phase 2")],
        ethers.encodeBytes32String("QmInitial")
      );
      
      // Available = 5 - 2 = 3 ETH
      expect(await campaign.availableFunds()).to.equal(ethers.parseEther("3"));

      // Approve the multi-stage request
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // Execute milestone 0 → releases 1 ETH from locked
      const network = await ethers.provider.getNetwork();
      const msgHash0 = ethers.solidityPackedKeccak256(
        ["uint256", "address", "uint256", "uint256"],
        [network.chainId, await campaign.getAddress(), 0, 0]
      );
      const sig0 = await donor2.signMessage(ethers.toBeArray(msgHash0));
      await campaign.executeMilestone(0, sig0, ethers.encodeBytes32String("QmM1"));

      // Available = (5-1) balance - (2-1) locked = 4 - 1 = 3 ETH
      expect(await campaign.lockedFunds()).to.equal(ethers.parseEther("1"));
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
        ethers.encodeBytes32String("Spend money"),
        ethers.parseEther("0.5"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );
    });

    it("should allow a donor to vote", async () => {
      await campaign.connect(donor1).approveRequest(0);

      const request = await campaign.requests(0);
      expect(request.totalApprovalWeight).to.equal(ethers.parseEther("1"));
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

    it("should prevent manager from donating and voting", async () => {
      // Manager cannot even donate to become a donor
      await expect(
        campaign.connect(owner).donate({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(campaign, "ManagerCannotDonate");

      // Even if they try to vote directly, they are not a donor
      await expect(
        campaign.connect(owner).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "NotDonor");
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
      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"));

      // donor3 joins and tries to vote on completed request
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("1") });

      await expect(
        campaign.connect(donor3).approveRequest(0)
      ).to.be.revertedWithCustomError(campaign, "RequestAlreadyProcessed");
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
        ethers.encodeBytes32String("Spend money"),
        ethers.parseEther("1"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );
    });

    it("should finalize when > 50% approval (2/2 donors)", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      const before = await ethers.provider.getBalance(recipient.address);
      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"));
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("1"));
    });

    it("should fail if not enough approvals", async () => {
      const verifier = donor2;
      await campaign.createRequest(ethers.encodeBytes32String("Big Buy"), ethers.parseEther("1"), recipient.address, verifier.address, ethers.encodeBytes32String("QmEvidence"));
      const signature = await getFinalSignature(verifier, await campaign.getAddress(), 0);
      await expect(campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof")))
        .to.be.revertedWithCustomError(campaign, "NotEnoughApprovals");
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
      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"));
      const after = await ethers.provider.getBalance(recipient.address);

      expect(after - before).to.equal(ethers.parseEther("1"));
    });

    it("should revert if not enough votes (1 out of 3 donors)", async () => {
      await campaign
        .connect(donor3)
        .donate({ value: ethers.parseEther("1") });
      await campaign.connect(donor1).approveRequest(0);
      // 1/3 <= 50%

      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await expect(
        campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"))
      ).to.be.revertedWithCustomError(campaign, "NotEnoughApprovals");
    });

    it("should emit FundsReleased event", async () => {
      const verifier = donor2;
      await campaign.createRequest(ethers.encodeBytes32String("Buy PC"), ethers.parseEther("0.5"), recipient.address, verifier.address, ethers.encodeBytes32String("QmEvidence"));
      
      await campaign.connect(donor1).approveRequest(1);
      await campaign.connect(donor2).approveRequest(1);

      const signature = await getFinalSignature(verifier, await campaign.getAddress(), 1);
      await expect(campaign.finalizeRequest(1, signature, ethers.encodeBytes32String("QmProof")))
        .to.emit(campaign, "FundsReleased")
        .withArgs(1, recipient.address);
    });

    it("should not allow non-manager to finalize", async () => {
      const verifier = donor2;
      await campaign.createRequest(ethers.encodeBytes32String("Buy PC"), ethers.parseEther("0.1"), recipient.address, verifier.address, ethers.encodeBytes32String("QmEvidence"));
      await campaign.connect(donor1).approveRequest(1);
      await campaign.connect(donor2).approveRequest(1);
      const signature = await getFinalSignature(verifier, await campaign.getAddress(), 1);
      await expect(campaign.connect(donor1).finalizeRequest(1, signature, ethers.encodeBytes32String("QmProof")))
        .to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("should not allow double finalization", async () => {
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"));

      await expect(
        campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"))
      ).to.be.revertedWithCustomError(campaign, "RequestAlreadyProcessed");
    });

    it("should revert if contract balance is insufficient", async () => {
      // FIX E: Now the check happens at createRequest time, not finalizeRequest
      await expect(
        campaign.createRequest(
          ethers.encodeBytes32String("Expensive"),
          ethers.parseEther("100"),
          recipient.address,
          donor2.address,
          ethers.encodeBytes32String("QmTestHash")
        )
      ).to.be.revertedWithCustomError(campaign, "InsufficientAvailableFunds");
    });

    it("should revert for invalid request index", async () => {
      const sig = await getFinalSignature(donor2, await campaign.getAddress(), 99);
      await expect(
        campaign.finalizeRequest(99, sig, ethers.encodeBytes32String("QmProof"))
      ).to.be.revertedWithCustomError(campaign, "InvalidRequestIndex");
    });

    it("should handle multiple requests independently", async () => {
      // Create second request
      await campaign.createRequest(
        ethers.encodeBytes32String("Second request"),
        ethers.parseEther("0.5"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );

      // Vote and finalize first request
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);
      const sig0 = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, sig0, ethers.encodeBytes32String("P0"));

      // Second request should still be pending
      const req = await campaign.requests(1);
      expect(req.status).to.equal(0); // OPEN

      // Vote and finalize second request
      await campaign.connect(donor1).approveRequest(1);
      await campaign.connect(donor2).approveRequest(1);

      const before = await ethers.provider.getBalance(recipient.address);
      const sig1 = await getFinalSignature(donor2, await campaign.getAddress(), 1);
      await campaign.finalizeRequest(1, sig1, ethers.encodeBytes32String("P1"));
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
        campaign.createRequest(ethers.encodeBytes32String("Test"), 100, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"))
      ).to.be.revertedWithCustomError(campaign, "CampaignNotActive");
    });

    it("cannot vote on deactivated campaign", async () => {
      // Donate and create request first
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        ethers.encodeBytes32String("Req 1"),
        100,
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
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
        ethers.encodeBytes32String("Final spend"),
        ethers.parseEther("0.5"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );
      await campaign.connect(donor1).approveRequest(0);

      // Deactivate campaign
      await campaign.deactivateCampaign();

      // Manager can still finalize (no onlyActive modifier on finalize)
      const before = await ethers.provider.getBalance(recipient.address);
      const signatureF = await getFinalSignature(donor2, await campaign.getAddress(), 0); 
      await campaign.finalizeRequest(0, signatureF, ethers.encodeBytes32String("QmProof"));
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
        ethers.encodeBytes32String("Test"),
        ethers.parseEther("0.5"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );

      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("1"));
      expect(summary.minContribution).to.equal(MIN_CONTRIBUTION);
      expect(summary.numRequests).to.equal(1n);
      expect(summary.donors).to.equal(1n);
      expect(summary.managerAddr).to.equal(owner.address);
      expect(summary.imgHash).to.equal(ethers.encodeBytes32String("QmTest"));
      expect(summary.isActive).to.equal(true);
    });

    it("getRequestsCount returns correct count", async () => {
      expect(await campaign.getRequestsCount()).to.equal(0);

      // FIX E: Need sufficient funds before creating requests
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(ethers.encodeBytes32String("Req 1"), 100, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"));
      expect(await campaign.getRequestsCount()).to.equal(1);

      await campaign.createRequest(ethers.encodeBytes32String("Req 2"), 200, recipient.address, donor2.address, ethers.encodeBytes32String("QmTestHash"));
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
        ethers.encodeBytes32String("Development costs"),
        ethers.parseEther("4"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmTestHash")
      );

      // 3. Donors vote (need > 50% = need at least 2 out of 3)
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // 4. Manager finalizes
      const recipientBefore = await ethers.provider.getBalance(
        recipient.address
      );
      const signature0 = await getFinalSignature(donor2, await campaign.getAddress(), 0); 
      await campaign.finalizeRequest(0, signature0, ethers.encodeBytes32String("QmProof"));
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
      expect(request.status).to.equal(1); // COMPLETED
    });

    it("multiple requests lifecycle", async () => {
      await campaign
        .connect(donor1)
        .donate({ value: ethers.parseEther("10") });

      // Create 3 requests
      await campaign.createRequest(
        ethers.encodeBytes32String("Phase 1"),
        ethers.parseEther("2"),
        recipient.address,
        donor1.address,
        ethers.encodeBytes32String("QmTestHash")
      );
      await campaign.createRequest(
        ethers.encodeBytes32String("Phase 2"),
        ethers.parseEther("3"),
        recipient.address,
        donor1.address,
        ethers.encodeBytes32String("QmTestHash")
      );
      await campaign.createRequest(
        ethers.encodeBytes32String("Phase 3"),
        ethers.parseEther("4"),
        recipient.address,
        donor1.address,
        ethers.encodeBytes32String("QmTestHash")
      );

      // Approve and finalize all
      for (let i = 0; i < 3; i++) {
        await campaign.connect(donor1).approveRequest(i);
        const sig = await getFinalSignature(donor1, await campaign.getAddress(), i);
        await campaign.finalizeRequest(i, sig, ethers.encodeBytes32String("QmProof"));
      }

      const summary = await campaign.getSummary();
      expect(summary.balance).to.equal(ethers.parseEther("1")); // 10 - 2 - 3 - 4
    });
  });

  // =========================================================
  // SUPPLIER OPTIMIZATION
  // =========================================================
  describe("Supplier Optimization", function () {
    it("should store and return supplier metadata correctly", async () => {
      const details = await supplierRegistry.getSuppliers(0, 10);
      expect(ethers.decodeBytes32String(details.names[0])).to.equal("Tech Global");
      expect(ethers.decodeBytes32String(details.metadatas[0])).to.equal("ipfs://techglobal");
    });

    it("should allow supplier to update their own info", async () => {
      await supplierRegistry.connect(recipient).updateSupplierInfo(
        recipient.address, 
        ethers.encodeBytes32String("Tech New"), 
        ethers.encodeBytes32String("ipfs://new")
      );
      const info = await supplierRegistry.suppliers(recipient.address);
      expect(ethers.decodeBytes32String(info.name)).to.equal("Tech New");
    });

    it("should track supplier earnings from Single Request", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      const verifier = donor2;
      await campaign.createRequest(ethers.encodeBytes32String("Buy PC"), ethers.parseEther("0.5"), recipient.address, verifier.address, ethers.encodeBytes32String("QmEvidence"));
      
      // Approve by 100% weight
      await campaign.connect(donor1).approveRequest(0);
      
      const beforeEarnings = (await supplierRegistry.suppliers(recipient.address)).totalEarned;
      const signature = await getFinalSignature(verifier, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof"));
      const afterEarnings = (await supplierRegistry.suppliers(recipient.address)).totalEarned;
      
      expect(afterEarnings - beforeEarnings).to.equal(ethers.parseEther("0.5"));
    });

    it("should track supplier earnings from Milestones", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("2") });
      
      const verifier = donor2;
      await campaign.createMultiStageRequest(
        ethers.encodeBytes32String("Phase 1"), recipient.address, verifier.address, 
        [ethers.parseEther("0.1"), ethers.parseEther("0.2")], 
        [ethers.encodeBytes32String("M1"), ethers.encodeBytes32String("M2")],
        ethers.encodeBytes32String("ipfs://initial")
      );
      
      await campaign.connect(donor1).approveRequest(0);

      // Verifier signs for milestone 0
      const network = await ethers.provider.getNetwork();
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "address", "uint256", "uint256"],
        [network.chainId, await campaign.getAddress(), 0, 0]
      );
      const signature = await verifier.signMessage(ethers.toBeArray(messageHash));

      const beforeEarnings = (await supplierRegistry.suppliers(recipient.address)).totalEarned;
      await campaign.executeMilestone(0, signature, ethers.encodeBytes32String("QmHash1"));
      const afterEarnings = (await supplierRegistry.suppliers(recipient.address)).totalEarned;

      expect(afterEarnings - beforeEarnings).to.equal(ethers.parseEther("0.1"));
    });

    it("should emit SupplierEarningsUpdated event", async () => {
        await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
        const verifier = donor2;
        await expect(campaign.connect(owner).createRequest(ethers.encodeBytes32String("Buy medicines"), ethers.parseEther("1"), recipient.address, verifier.address, ethers.encodeBytes32String("QmTestHash")))
            .to.emit(campaign, "RequestCreated");
        await campaign.connect(donor1).approveRequest(0);

        const signature = await getFinalSignature(verifier, await campaign.getAddress(), 0);
        await expect(campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmProof")))
            .to.emit(supplierRegistry, "SupplierEarningsUpdated");
    });

    it("should block recordPayment from unauthorized addresses", async () => {
        await expect(supplierRegistry.recordPayment(recipient.address, 100))
            .to.be.revertedWithCustomError(supplierRegistry, "NotAuthorized");
    });
  });

  // =========================================================
  // REQUEST LIFECYCLE: CANCEL & DEADLINE
  // =========================================================
  describe("Request Lifecycle: Cancel & Deadline", function () {
    it("should allow manager to cancel an open request and release funds", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      const beforeLocked = await campaign.lockedFunds();
      
      await campaign.createRequest(
        ethers.encodeBytes32String("Cancel me"),
        ethers.parseEther("0.1"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmEvidence")
      );
      
      expect(await campaign.lockedFunds()).to.equal(beforeLocked + ethers.parseEther("0.1"));
      
      await campaign.cancelRequest(0); 
      
      const request = await campaign.requests(0);
      expect(request.status).to.equal(2); // CANCELLED
      expect(await campaign.lockedFunds()).to.equal(beforeLocked);
    });

    it("should not allow non-manager to cancel", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        ethers.encodeBytes32String("Protected"),
        ethers.parseEther("0.1"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmEvidence")
      );
      await expect(campaign.connect(donor1).cancelRequest(0))
        .to.be.revertedWithCustomError(campaign, "NotManager");
    });

    it("should not allow canceling a COMPLETED request", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        ethers.encodeBytes32String("Complete me"),
        ethers.parseEther("0.1"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmEvidence")
      );
      await campaign.connect(donor1).approveRequest(0);
      const signature = await getFinalSignature(donor2, await campaign.getAddress(), 0);
      await campaign.finalizeRequest(0, signature, ethers.encodeBytes32String("QmFinal"));
      
      await expect(campaign.cancelRequest(0))
        .to.be.revertedWithCustomError(campaign, "RequestAlreadyProcessed");
    });

    it("should not allow canceling a Multi-stage request if milestone 1 is paid", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createMultiStageRequest(
        ethers.encodeBytes32String("Multi"),
        recipient.address,
        donor2.address,
        [ethers.parseEther("0.1"), ethers.parseEther("0.1")],
        [ethers.encodeBytes32String("M1"), ethers.encodeBytes32String("M2")],
        ethers.encodeBytes32String("QmInit")
      );
      
      await campaign.connect(donor1).approveRequest(0);
      
      // Execute M1
      const network = await ethers.provider.getNetwork();
      const msgHash = ethers.solidityPackedKeccak256(
        ["uint256", "address", "uint256", "uint256"],
        [network.chainId, await campaign.getAddress(), 0, 0]
      );
      const sig = await donor2.signMessage(ethers.toBeArray(msgHash));
      await campaign.executeMilestone(0, sig, ethers.encodeBytes32String("QmProof"));
      
      // Try cancel
      await expect(campaign.cancelRequest(0))
        .to.be.revertedWithCustomError(campaign, "RequestAlreadyReleased");
    });

    it("should revert if voting on an expired request", async () => {
      await campaign.connect(donor1).donate({ value: ethers.parseEther("1") });
      await campaign.createRequest(
        ethers.encodeBytes32String("Slow"),
        ethers.parseEther("0.1"),
        recipient.address,
        donor2.address,
        ethers.encodeBytes32String("QmEvidence")
      );
      
      // Fast forward 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      await expect(campaign.connect(donor1).approveRequest(0))
        .to.be.revertedWithCustomError(campaign, "RequestExpired");
    });
  });
});
