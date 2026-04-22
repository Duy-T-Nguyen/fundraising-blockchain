const fs = require('fs');
const filePath = '/home/duy/fundraising-blockchain/bc/test/Campaign.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix submitCampaignRequest
// Matches 3 consecutive ethers.encodeBytes32String(...) or ethers.ZeroHash
content = content.replace(/(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)/g, 
  '"ipfs://dummy"');

// 2. Fix createRequest
content = content.replace(/\.createRequest\s*\(\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,)]+)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*\)/g, 
  (match, p1, p2, p3, p4) => {
      return `.createRequest("ipfs://dummy", ${p2}, ${p3}, ${p4})`;
});

// 3. Fix createMultiStageRequest
content = content.replace(/\.createMultiStageRequest\s*\(\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(\[[^\]]+\])\s*,\s*\[([^\]]+)\]\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*\)/g, 
  (match, p1, p2, p3, p4) => {
      return `.createMultiStageRequest("ipfs://dummy", ${p2}, ${p3}, ${p4}, ["ipfs://m1", "ipfs://m2"])`;
});

// 4. Fix RequestCreated withArgs
content = content.replace(/\.withArgs\s*\(\s*([^,]+)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*,\s*\[\]\s*,\s*anyValue\s*\)/g, 
  (match, p1, p2, p3, p4, p5) => {
      return `.withArgs(${p1}, "ipfs://dummy", ${p3}, ${p4}, ${p5}, [], anyValue)`;
});

// 5. Fix CampaignStarted withArgs
content = content.replace(/\.withArgs\s*\(\s*\(\s*addr\s*:\s*string\s*\)\s*=>\s*ethers\.isAddress\s*\(\s*addr\s*\)\s*,\s*owner\.address\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, 
  (match, p1, p2) => {
      return `.withArgs((addr: string) => ethers.isAddress(addr), owner.address, "ipfs://dummy", ${p1}, ${p2})`;
});

// 6. Fix `executeMilestone(0, sig0, ethers.encodeBytes32String("QmM1"))` -> `executeMilestone(0, sig0, "ipfs://dummy")`
content = content.replace(/\.executeMilestone\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*\)/g, 
  (match, p1, p2) => {
      return `.executeMilestone(${p1}, ${p2}, "ipfs://dummy")`;
});

// 7. Fix `finalizeRequest(0, sig, ethers.encodeBytes32String("QmProof"))` -> `finalizeRequest(0, sig, "ipfs://dummy")`
content = content.replace(/\.finalizeRequest\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(ethers\.encodeBytes32String\([^)]+\)|ethers\.ZeroHash)\s*\)/g, 
  (match, p1, p2) => {
      return `.finalizeRequest(${p1}, ${p2}, "ipfs://dummy")`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Smart test file refactored.');
