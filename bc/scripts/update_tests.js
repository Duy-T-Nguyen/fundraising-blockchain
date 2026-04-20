const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../test/Campaign.ts'),
  path.join(__dirname, '../test/Campaign_WithdrawalOptimization.test.ts')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Let's just do a brute force string replacement of `""` where it appears as an argument.
  // Common patterns:
  content = content.replace(/, ""\)/g, ', "QmTestHash")');
  content = content.replace(/,\n\s*""\n\s*\)/g, ',\n        "QmTestHash"\n      )');
  content = content.replace(/,\n\s*""\n\s*\]/g, ',\n        "QmTestHash"\n        ]');
  content = content.replace(/, ""\n/g, ', "QmTestHash"\n');
  content = content.replace(/,\s*""\n/g, ', "QmTestHash"\n');

  fs.writeFileSync(file, content);
}
console.log("Done");
