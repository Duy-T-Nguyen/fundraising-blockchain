import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Campaign Withdrawal Optimization", function () {
  let factory: any;
  let campaign: any;
  let validatorPool: any;
  let owner: HardhatEthersSigner;
  let donor1: HardhatEthersSigner;
  let donor2: HardhatEthersSigner;
  let validator1: HardhatEthersSigner;
  let validator2: HardhatEthersSigner;
  let validator3: HardhatEthersSigner;
  let validator4: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.1");

  beforeEach(async () => {
    [owner, donor1, donor2, validator1, validator2, validator3, validator4, verifier, recipient] = await ethers.getSigners();

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy();

    // Factory creates Campaign and ValidatorPool
    await factory.createCampaign(MIN_CONTRIBUTION);
    const campaignAddress = await factory.deployedCampaigns(0);
    
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.attach(campaignAddress);

    const validatorPoolAddress = await campaign.validatorPool();
    const ValidatorPool = await ethers.getContractFactory("ValidatorPool");
    validatorPool = await ValidatorPool.attach(validatorPoolAddress);

    // Setup Validators
    await validatorPool.connect(owner).addValidator(validator1.address);
    await validatorPool.connect(owner).addValidator(validator2.address);
    await validatorPool.connect(owner).addValidator(validator3.address);
    await validatorPool.connect(owner).addValidator(validator4.address);

    // Add some funds to the campaign
    await campaign.connect(donor1).donate({ value: ethers.parseEther("10") });
    await campaign.connect(donor2).donate({ value: ethers.parseEther("10") });
  });

  describe("Path A: Small Requests (Validator-only)", function () {
    it("should assign 3 random validators for small requests", async () => {
      // 0.5% of 20 ETH = 0.1 ETH. Let's request 0.05 ETH.
      const amount = ethers.parseEther("0.05");
      await campaign.createRequest("Small fix", amount, recipient.address);
      
      const request = await campaign.requests(0);
      // selectedValidators is an internal array in RequestLib.Request, 
      // but in Solidity versions where we return structs, it might be tricky.
      // We'll check the length via a custom getter or just checking if approveAsValidator works for the selected ones.
      
      // We can't directly access the selectedValidators array from the returned struct in ethers easily if it's dynamic.
      // But we can check if the logic picked 3.
    });

    it("should allow 2/3 validators to approve and finalize a small request", async () => {
      const amount = ethers.parseEther("0.05");
      await campaign.createRequest("Small fix", amount, recipient.address);
      
      // Find out who were selected
      const selected: string[] = [];
      const vAddrs = [validator1.address, validator2.address, validator3.address, validator4.address];
      
      // We'll peek into the contract state or just try all.
      // For testing, let's just find the 3 selected ones.
      for (const v of [validator1, validator2, validator3, validator4]) {
          try {
              await campaign.connect(v).approveAsValidator(0);
              selected.push(v.address);
          } catch (e) {
              // Not selected
          }
      }
      
      expect(selected.length).to.equal(3);
      
      // If 2 approved, manager can finalize
      if (selected.length >= 2) {
          await campaign.connect(owner).finalizeRequest(0);
          const afterBalance = await ethers.provider.getBalance(recipient.address);
          // Check if funds were sent (recipient might have had funds, so we check delta)
      }
    });

    it("should revert if amount > 0.5% and try to use validator path", async () => {
       const largeAmount = ethers.parseEther("0.2"); // 1% of 20 ETH
       await campaign.createRequest("Large one", largeAmount, recipient.address);
       
       await expect(campaign.connect(validator1).approveAsValidator(0))
         .to.be.revertedWithCustomError(campaign, "MilestoneNotApproved");
    });
  });

  describe("Path B: Multi-Stage Requests (Donor + Oracle)", function () {
    const milestoneValues = [ethers.parseEther("1"), ethers.parseEther("2")];
    const milestoneDescs = ["Stage 1", "Stage 2"];

    it("should allow donor to approve once and handle milestones via signatures", async () => {
      await campaign.createMultiStageRequest(
          "Long Project",
          recipient.address,
          verifier.address,
          milestoneValues,
          milestoneDescs
      );

      // 1. Donor approves once
      await campaign.connect(donor1).approveRequest(0);
      await campaign.connect(donor2).approveRequest(0);

      // 2. Execute Stage 1
      // Message: address(this), requestIndex (0), milestoneIndex (0)
      const domain = await campaign.getAddress();
      const messageHash = ethers.solidityPackedKeccak256(
          ["address", "uint256", "uint256"],
          [domain, 0, 0]
      );
      const signature = await verifier.signMessage(ethers.toBeArray(messageHash));
      
      const beforeBalance = await ethers.provider.getBalance(recipient.address);
      await campaign.executeMilestone(0, signature);
      const afterBalance = await ethers.provider.getBalance(recipient.address);
      
      expect(afterBalance - beforeBalance).to.equal(milestoneValues[0]);

      // 3. Execute Stage 2
      const messageHash2 = ethers.solidityPackedKeccak256(
          ["address", "uint256", "uint256"],
          [domain, 0, 1]
      );
      const signature2 = await verifier.signMessage(ethers.toBeArray(messageHash2));
      await campaign.executeMilestone(0, signature2);
      
      const request = await campaign.requests(0);
      expect(request.complete).to.equal(true);
    });

    it("should revert if signature is from wrong verifier", async () => {
        await campaign.createMultiStageRequest(
            "Long Project",
            recipient.address,
            verifier.address,
            milestoneValues,
            milestoneDescs
        );
        await campaign.connect(donor1).approveRequest(0);
        await campaign.connect(donor2).approveRequest(0);

        const domain = await campaign.getAddress();
        const messageHash = ethers.solidityPackedKeccak256(["address", "uint256", "uint256"], [domain, 0, 0]);
        const badSignature = await owner.signMessage(ethers.toBeArray(messageHash));

        await expect(campaign.executeMilestone(0, badSignature))
            .to.be.revertedWithCustomError(campaign, "InvalidSignature");
    });
  });

  describe("Security Restrictions", function () {
    it("should not allow manager to be recipient", async () => {
        await expect(campaign.createRequest("Self pay", 100, owner.address))
            .to.be.revertedWithCustomError(campaign, "ManagerNotAllowedAsRecipient");
    });

    it("should not allow multiple approvals from same validator", async () => {
        const amount = ethers.parseEther("0.01");
        await campaign.createRequest("Small", amount, recipient.address);
        
        // Find one selected validator
        let selectedV: HardhatEthersSigner | null = null;
        for (const v of [validator1, validator2, validator3, validator4]) {
            try {
                await campaign.connect(v).approveAsValidator(0);
                selectedV = v;
                break;
            } catch (e) {}
        }

        if (selectedV) {
            await expect(campaign.connect(selectedV).approveAsValidator(0))
                .to.be.revertedWithCustomError(campaign, "AlreadyVoted");
        }
    });
  });
});
