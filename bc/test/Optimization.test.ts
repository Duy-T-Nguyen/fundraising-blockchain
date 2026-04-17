import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Optimization & Unified Indexing Tests", function () {
  let supplierRegistry: any;
  let validatorPool: any;
  let factory: any;
  let owner: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  beforeEach(async () => {
    [owner, ...addrs] = await ethers.getSigners();

    // Setup SupplierRegistry
    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    supplierRegistry = await SupplierRegistry.deploy(owner.address);

    // Setup ValidatorPool
    const ValidatorPool = await ethers.getContractFactory("ValidatorPool");
    validatorPool = await ValidatorPool.deploy(owner.address);

    // Setup Factory
    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await supplierRegistry.getAddress());
  });

  describe("SupplierRegistry O(1) Removal", function () {
    it("should correctly remove elements from the middle of the list", async () => {
      // Add 5 suppliers
      const suppliers = addrs.slice(0, 5);
      for (const s of suppliers) {
        await supplierRegistry.addSupplier(s.address);
      }
      expect(await supplierRegistry.getSupplierCount()).to.equal(5);

      // Remove the 3rd one (index 2)
      const toRemove = suppliers[2].address;
      const lastOne = suppliers[4].address;
      await supplierRegistry.removeSupplier(toRemove);

      expect(await supplierRegistry.getSupplierCount()).to.equal(4);
      expect(await supplierRegistry.isSupplier(toRemove)).to.be.false;
      expect(await supplierRegistry.isSupplier(lastOne)).to.be.true;

      // Check if last one moved to the gap correctly
      const all = await supplierRegistry.getAllSuppliers();
      expect(all).to.not.contain(toRemove);
      expect(all[2]).to.equal(lastOne);
    });
  });

  describe("ValidatorPool O(1) Removal", function () {
    it("should correctly remove validators using swap and pop", async () => {
      // Add 5 validators
      const validators = addrs.slice(5, 10);
      for (const v of validators) {
        await validatorPool.addValidator(v.address);
      }
      expect(await validatorPool.getValidatorsCount()).to.equal(5);

      // Remove the 1st one (index 0)
      const toRemove = validators[0].address;
      const lastOne = validators[4].address;
      await validatorPool.removeValidator(toRemove);

      expect(await validatorPool.getValidatorsCount()).to.equal(4);
      expect(await validatorPool.isValidator(toRemove)).to.be.false;
      
      const all = await validatorPool.validators(0);
      expect(all).to.equal(lastOne); // Last one should now be at index 0
    });
  });

  describe("CampaignFactory Unified Indexing (Advanced)", function () {
    it("should handle mixed queries through getCampaigns", async () => {
      // Create campaigns with mixed managers and categories
      // Manager: owner (default), donor1
      const donor1 = addrs[0];
      
      await factory.createCampaign("C1", 0, 100); // Owner, Cat 0
      await factory.createCampaign("C2", 1, 100); // Owner, Cat 1
      await factory.connect(donor1).createCampaign("C3", 0, 100); // Donor1, Cat 0
      
      // Query ALL
      const all = await factory.getCampaigns(0, ethers.ZeroAddress, 0, 0, 10);
      expect(all.length).to.equal(3);

      // Query BY_MANAGER (donor1)
      const byManager = await factory.getCampaigns(1, donor1.address, 0, 0, 10);
      expect(byManager.length).to.equal(1);
      expect(await factory.getManagerCount(donor1.address)).to.equal(1);

      // Query BY_CATEGORY (0)
      const byCategory = await factory.getCampaigns(2, ethers.ZeroAddress, 0, 0, 10);
      expect(byCategory.length).to.equal(2);
      expect(await factory.getCategoryCount(0)).to.equal(2);
    });
  });
});
