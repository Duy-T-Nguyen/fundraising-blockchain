import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Campaign Approval Workflow", function () {
  let factory: any;
  let supplierRegistry: any;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let manager: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const MIN_CONTRIBUTION = ethers.parseEther("0.01");

  beforeEach(async () => {
    [owner, admin, manager, other] = await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("Forwarder");
    const forwarder = await Forwarder.deploy();
    const forwarderAddress = await forwarder.getAddress();

    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(admin.address, forwarderAddress);

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    // Constructor: address _supplierRegistry, address _admin, address _trustedForwarder
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress(), admin.address, forwarderAddress);
  });

  it("should allow any user to submit a campaign request", async () => {
    await expect(factory.connect(manager).submitCampaignRequest("Save the Trees", "Save the environment", "QmTest", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") }))
      .to.emit(factory, "CampaignRequestSubmitted")
      .withArgs(0, manager.address, "Save the Trees", "Save the environment", "QmTest", 0, MIN_CONTRIBUTION);

    const request = await factory.campaignRequests(0);
    expect(request.manager).to.equal(manager.address);
    expect(request.name).to.equal("Save the Trees");
    expect(request.status).to.equal(0); // PENDING
  });

  it("should allow admin to approve a request and deploy a campaign", async () => {
    await factory.connect(manager).submitCampaignRequest("Save the Trees", "Save the environment", "QmTest", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });
    
    await expect(factory.connect(admin).approveCampaignRequest(0))
      .to.emit(factory, "CampaignRequestApproved")
      .to.emit(factory, "CampaignStarted");

    const request = await factory.campaignRequests(0);
    expect(request.status).to.equal(1); // APPROVED
    expect(request.deployedAddress).to.not.equal(ethers.ZeroAddress);

    const campaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
    expect(campaigns.length).to.equal(1);
    expect(campaigns[0]).to.equal(request.deployedAddress);
  });

  it("should allow admin to reject a request", async () => {
    await factory.connect(manager).submitCampaignRequest("Spam Campaign", "Spam", "QmSpam", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });
    
    await expect(factory.connect(admin).rejectCampaignRequest(0))
      .to.emit(factory, "CampaignRequestRejected")
      .withArgs(0);

    const request = await factory.campaignRequests(0);
    expect(request.status).to.equal(2); // REJECTED
    expect(request.deployedAddress).to.equal(ethers.ZeroAddress);

    const campaigns = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
    expect(campaigns.length).to.equal(0);
  });

  it("should revert if non-admin tries to approve or reject", async () => {
    await factory.connect(manager).submitCampaignRequest("Test", "Desc", "QmHash", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });

    await expect(factory.connect(other).approveCampaignRequest(0))
      .to.be.revertedWithCustomError(factory, "NotAdmin");

    await expect(factory.connect(other).rejectCampaignRequest(0))
      .to.be.revertedWithCustomError(factory, "NotAdmin");
  });

  it("should revert if processing an already processed request", async () => {
    await factory.connect(manager).submitCampaignRequest("Test", "Desc", "QmHash", 0, MIN_CONTRIBUTION, { value: ethers.parseEther("0.005") });
    await factory.connect(admin).approveCampaignRequest(0);

    await expect(factory.connect(admin).approveCampaignRequest(0))
      .to.be.revertedWithCustomError(factory, "RequestAlreadyProcessed");

    await expect(factory.connect(admin).rejectCampaignRequest(0))
      .to.be.revertedWithCustomError(factory, "RequestAlreadyProcessed");
  });

  it("should revert for invalid request index", async () => {
    await expect(factory.connect(admin).approveCampaignRequest(99))
      .to.be.revertedWithCustomError(factory, "InvalidRequestIndex");
  });
});
