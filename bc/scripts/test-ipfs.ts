import { ethers } from "hardhat";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

async function main() {
  const [manager] = await ethers.getSigners();
  console.log("Testing with account:", manager.address);

  // 1. Giả lập ảnh minh chứng (tạo file text giả thành ảnh)
  const dummyFilePath = path.join(__dirname, "dummy-evidence.txt");
  fs.writeFileSync(dummyFilePath, "Đây là bằng chứng minh bạch cho việc chi tiêu quỹ.");

  console.log("1. Đang gửi ảnh tới Backend (NestJS)...");
  let cid = "fake-cid-for-testing";
  
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(dummyFilePath), "evidence.txt");

    // Giả sử Backend đang chạy tại localhost:3000 (do chúng ta chưa khởi chạy thực tế nên có thể lỗi)
    // Trong môi trường này, chúng ta sẽ bắt lỗi và dùng CID giả nếu BE chưa chạy.
    const response = await axios.post("http://localhost:3000/evidence/upload", formData, {
      headers: formData.getHeaders(),
    });
    cid = response.data.cid;
    console.log("   Thành công! CID từ Backend:", cid);
  } catch (error) {
    console.warn("   [Cảnh báo] Không kết nối được Backend. Sử dụng CID giả để kiểm tra Smart Contract.");
  }

  // 2. Deploy các contract phụ trợ
  console.log("2. Đang khởi tạo các contract phụ trợ...");
  
  // 2.1 Deploy Forwarder
  const Forwarder = await ethers.getContractFactory("Forwarder");
  const forwarder = await Forwarder.deploy();
  const forwarderAddress = await forwarder.getAddress();

  const SupplierRegistry = await ethers.getContractFactory("SupplierRegistry");
  const sr = await SupplierRegistry.deploy(manager.address, forwarderAddress);
  
  const recipient = (await ethers.getSigners())[1];
  // addSupplier: address, name, metadata
  await sr.addSupplier(recipient.address, "Supplier 1", "ipfs://metadata");

  // Cần một ValidatorPool thực tế để qua được check constructor
  const ValidatorPool = await ethers.getContractFactory("ValidatorPool");
  const vp = await ValidatorPool.deploy(manager.address, forwarderAddress);

  console.log("3. Đang deploy Campaign...");
  const Campaign = await ethers.getContractFactory("Campaign");
  const campaign = await Campaign.deploy(
    "Chiến dịch mẫu",
    "Mô tả mẫu",
    "QmImage",
    0, // Category
    ethers.parseEther("0.01"), 
    manager.address, 
    await vp.getAddress(), 
    await sr.getAddress(),
    forwarderAddress
  );

  // 3. Tạo Request kèm CID
  console.log("3. Đang tạo Spend Request với CID:", cid);
  // createRequest: description, value, recipient, verifier, evidenceHash
  const tx = await campaign.createRequest(
    "Mua vật tư y tế", 
    ethers.parseEther("0.1"), 
    recipient.address, 
    manager.address, // Verifier (dùng tạm manager)
    cid
  );
  await tx.wait();

  // 4. Kiểm tra dữ liệu trên chuỗi
  console.log("4. Đang kiểm tra dữ liệu trên Blockchain...");
  const request = await campaign.requests(0);
  console.log("   Description:", request.description);
  console.log("   Evidence CID:", request.evidenceHash);

  if (request.evidenceHash === cid) {
    console.log("\n KIỂM THỬ THÀNH CÔNG: Minh chứng đã được lưu trữ vĩnh viễn trên Blockchain!");
  } else {
    console.error("\n KIỂM THỬ THẤT BẠI: CID không khớp.");
  }

  // Dọn dẹp
  fs.unlinkSync(dummyFilePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
