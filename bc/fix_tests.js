const fs = require('fs');

const filePath = '/home/duy/fundraising-blockchain/bc/test/Campaign.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix submitCampaignRequest
// Old: submitCampaignRequest(ethers.encodeBytes32String(...), ethers.encodeBytes32String(...), ethers.encodeBytes32String(...), category, min, { value: ... })
// New: submitCampaignRequest("ipfs://dummy", category, min, { value: ... })
content = content.replace(/\.submitCampaignRequest\([\s\S]*?ethers\.encodeBytes32String\([^)]+\),[\s\S]*?ethers\.encodeBytes32String\([^)]+\),[\s\S]*?ethers\.encodeBytes32String\([^)]+\),([\s\S]*?)\)/g, (match, p1) => {
    return `.submitCampaignRequest("ipfs://dummy",${p1})`;
});

// 2. Fix createRequest
// Old: createRequest(ethers.encodeBytes32String(...), value, recipient, verifier, ethers.encodeBytes32String(...))
// New: createRequest("ipfs://dummy", value, recipient, verifier)
content = content.replace(/\.createRequest\(\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*\)/g, (match, p1, p2, p3) => {
    return `.createRequest("ipfs://dummy", ${p1}, ${p2}, ${p3})`;
});

// 2b. Fix createRequest with ethers.ZeroHash
content = content.replace(/\.createRequest\(\s*ethers\.ZeroHash\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*\)/g, (match, p1, p2, p3) => {
    return `.createRequest("", ${p1}, ${p2}, ${p3})`;
});
content = content.replace(/\.createRequest\(\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*ethers\.ZeroHash\s*\)/g, (match, p1, p2, p3) => {
    return `.createRequest("ipfs://dummy", ${p1}, ${p2}, ${p3})`;
});


// 3. Fix createMultiStageRequest
// Old: createMultiStageRequest(ethers.encodeBytes32String(...), recipient, verifier, [amounts], [ethers.encodeBytes32String(...), ...], ethers.encodeBytes32String(...))
// New: createMultiStageRequest("ipfs://dummy", recipient, verifier, [amounts], ["ipfs://m1", "ipfs://m2"])
content = content.replace(/\.createMultiStageRequest\(\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(\[.*?\])\s*,\s*\[(.*?)\]\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*\)/g, (match, p1, p2, p3, p4) => {
    // replace ethers.encodeBytes32String(...) inside the array with "ipfs://dummy"
    const parsedArray = p4.replace(/ethers\.encodeBytes32String\([^)]+\)/g, '"ipfs://dummy"');
    return `.createMultiStageRequest("ipfs://dummy", ${p1}, ${p2}, ${p3}, [${parsedArray}])`;
});

// 4. Fix event argument assertions
// WithArgs for CampaignRequestSubmitted (5 args now)
// Old args: id, name, desc, image, cat, min
// New args: id, manager, metadataCID, cat, min
// Wait, RequestCreated event has 8 args: id, metadataCID, value, recipient, verifier, selectedValidators, lastValidatorSelection
content = content.replace(/\.withArgs\(\s*0\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*ethers\.parseEther\("0\.05"\)\s*,\s*recipient\.address\s*,\s*donor2\.address\s*,\s*ethers\.encodeBytes32String\([^)]+\)\s*,\s*\[\]\s*,\s*anyValue\s*\)/g, 
    `.withArgs(0, "ipfs://dummy", ethers.parseEther("0.05"), recipient.address, donor2.address, [], anyValue)`);

content = content.replace(/\.withArgs\([\s\S]*?\(addr: string\) => ethers\.isAddress\(addr\),[\s\S]*?owner\.address,[\s\S]*?ethers\.encodeBytes32String\([^)]+\),[\s\S]*?ethers\.encodeBytes32String\([^)]+\),[\s\S]*?ethers\.encodeBytes32String\([^)]+\),[\s\S]*?3,[\s\S]*?ethers\.parseEther\("0\.05"\)[\s\S]*?\)/g, 
    `.withArgs((addr: string) => ethers.isAddress(addr), owner.address, "ipfs://dummy", 3, ethers.parseEther("0.05"))`);

// 5. Replace other ethers.encodeBytes32String to normal strings in expect
content = content.replace(/ethers\.encodeBytes32String\("([^"]+)"\)/g, '"$1"');

// 6. Fix `executeMilestone(0, sig0, ethers.encodeBytes32String("QmM1"))` -> `executeMilestone(0, sig0)`
// executeMilestone now takes: requestId, signature, (metadataCID? Let me check)
// Let's assume it takes (requestId, signature, metadataCID) or something. We'll leave it as is if it's fine.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Test file modified.');
