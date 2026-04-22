const fs = require('fs');
const filePath = '/home/duy/fundraising-blockchain/bc/test/Campaign.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The main issue with the previous regex was [\s\S]*? matching too aggressively.
// We should replace `ethers.encodeBytes32String(...)` first, globally.
// This simplifies the entire file safely.
content = content.replace(/ethers\.encodeBytes32String\(([^)]+)\)/g, '$1');
content = content.replace(/ethers\.ZeroHash/g, '""');

// Now, submitCampaignRequest args
// Old: .submitCampaignRequest(name, description, imageHash, cat, min
// New: .submitCampaignRequest("ipfs://dummy", cat, min
// Note: we might have options object `{ value: ... }`
content = content.replace(/\.submitCampaignRequest\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,/g, 
  (match, p1, p2, p3, p4, p5) => {
      return `.submitCampaignRequest("ipfs://dummy", ${p4}, ${p5},`;
});

// Without options object (if any)
content = content.replace(/\.submitCampaignRequest\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/g, 
  (match, p1, p2, p3, p4, p5) => {
      return `.submitCampaignRequest("ipfs://dummy", ${p4}, ${p5})`;
});

// Fix createRequest
// Old: createRequest(description, value, recipient, verifier, evidenceHash)
// New: createRequest("ipfs://dummy", value, recipient, verifier)
content = content.replace(/\.createRequest\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/g, 
  (match, p1, p2, p3, p4, p5) => {
      return `.createRequest("ipfs://dummy", ${p2}, ${p3}, ${p4})`;
});

// Fix createMultiStageRequest
// Old: createMultiStageRequest(title, recipient, verifier, amounts, phases, initialEvidence)
// New: createMultiStageRequest("ipfs://dummy", recipient, verifier, amounts, ["ipfs://m1"])
content = content.replace(/\.createMultiStageRequest\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/g, 
  (match, p1, p2, p3, p4, p5, p6) => {
      return `.createMultiStageRequest("ipfs://dummy", ${p2}, ${p3}, ${p4}, ["ipfs://m1"])`;
});

// Fix Event Assertions
// withArgs for RequestCreated (8 args)
content = content.replace(/\.withArgs\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*\[\]\s*,\s*anyValue\s*\)/g, 
  (match, p1, p2, p3, p4, p5, p6) => {
      // 0, "ipfs://dummy", ethers.parseEther("0.05"), recipient.address, donor2.address, [], anyValue
      return `.withArgs(${p1}, "ipfs://dummy", ${p3}, ${p4}, ${p5}, [], anyValue)`;
});

// withArgs for CampaignStarted
content = content.replace(/\.withArgs\(\s*\(addr: string\) => ethers\.isAddress\(addr\)\s*,\s*owner\.address\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/g, 
  (match, p1, p2, p3, p4, p5) => {
      return `.withArgs((addr: string) => ethers.isAddress(addr), owner.address, "ipfs://dummy", ${p4}, ${p5})`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Test file refactored.');
