import { expect } from "chai";
import { ethers } from "hardhat";
import { Forwarder, CampaignFactory, SupplierRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Meta-Transactions (EIP-2771) Test", function () {
  let forwarder: Forwarder;
  let factory: CampaignFactory;
  let registry: SupplierRegistry;
  let admin: SignerWithAddress;
  let manager: SignerWithAddress;
  let relayer: SignerWithAddress;

  const domainName = "FundraisingForwarder";
  const domainVersion = "1";

  beforeEach(async function () {
    [admin, manager, relayer] = await ethers.getSigners();

    // 1. Deploy Forwarder
    const Forwarder = await ethers.getContractFactory("Forwarder");
    forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();

    // 2. Deploy SupplierRegistry
    const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
    registry = await SupplierRegistry.deploy(admin.address, forwarderAddress);
    await registry.waitForDeployment();

    // 3. Deploy CampaignFactory
    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(await registry.getAddress(), admin.address, forwarderAddress);
    await factory.waitForDeployment();

    // Set factory in registry
    await registry.connect(admin).setFactory(await factory.getAddress());
  });

  async function signForwardRequest(signer: SignerWithAddress, to: string, data: string, value: bigint = 0n) {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const nonce = await forwarder.getNonce(signer.address);

    const domain = {
      name: domainName,
      version: domainVersion,
      chainId: chainId,
      verifyingContract: await forwarder.getAddress(),
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    };

    const message = {
      from: signer.address,
      to: to,
      value: value,
      gas: 1000000,
      nonce: Number(nonce),
      data: data,
    };

    const signature = await signer.signTypedData(domain, types, message);
    return { message, signature };
  }

  it("Nên cho phép Manager gửi Campaign Request qua Relayer (Gasless)", async function () {
    const factoryAddress = await factory.getAddress();
    const antiSpamFee = ethers.parseEther("0.005");
    
    // Chuẩn bị dữ liệu hàm submitCampaignRequest
    const data = factory.interface.encodeFunctionData("submitCampaignRequest", [
      "Meta-Campaign",
      "Description",
      "QmHash",
      0, // Category
      ethers.parseEther("0.1") // Minimum
    ]);

    // 1. Manager ký yêu cầu (Offline, không tốn Gas)
    // Manager chấp thuận việc Forwarder trích xuất 0.005 ETH từ Relayer (hoặc chính manager nếu manager có nạp tiền cho Forwarder, nhưng ở đây Relayer trả hộ)
    const { message, signature } = await signForwardRequest(manager, factoryAddress, data, antiSpamFee);

    // 2. Relayer gửi giao dịch lên mạng (Relayer trả tiền Gas + Phí chống spam)
    await forwarder.connect(relayer).execute(message, signature, { value: antiSpamFee });

    // 3. Kiểm tra kết quả: Request phải được ghi nhận cho Manager, không phải cho Relayer
    const request = await factory.campaignRequests(0);
    expect(request.manager).to.equal(manager.address);
    expect(request.name).to.equal("Meta-Campaign");

    console.log("✅ Success: Campaign Request created for manager via Relayer!");
  });

  it("Nên cho phép gộp nhiều giao dịch (Batching) trong 1 lần gửi", async function () {
    const factoryAddress = await factory.getAddress();
    const antiSpamFee = ethers.parseEther("0.005");
    
    // Tạo 2 yêu cầu từ 2 người khác nhau (giả lập)
    const data1 = factory.interface.encodeFunctionData("submitCampaignRequest", ["C1", "D1", "H1", 0, 100]);
    const { message: msg1, signature: sig1 } = await signForwardRequest(manager, factoryAddress, data1, antiSpamFee);
    
    const data2 = factory.interface.encodeFunctionData("submitCampaignRequest", ["C2", "D2", "H2", 1, 200]);
    const { message: msg2, signature: sig2 } = await signForwardRequest(admin, factoryAddress, data2, antiSpamFee);

    // Relayer gom lại và gửi 1 phát 2 tx
    await forwarder.connect(relayer).executeBatch(
        [msg1, msg2], 
        [sig1, sig2], 
        { value: antiSpamFee * 2n } 
    );

    expect(await factory.requestCount()).to.equal(2);
    expect((await factory.campaignRequests(0)).manager).to.equal(manager.address);
    expect((await factory.campaignRequests(1)).manager).to.equal(admin.address);
    
    console.log("✅ Success: Batch transactions executed successfully!");
  });
});
