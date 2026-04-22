const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
project.addSourceFileAtPath("test/Campaign.ts");

const sourceFile = project.getSourceFileOrThrow("test/Campaign.ts");

// We need to find all CallExpressions
const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

for (const callExpr of callExpressions) {
    const expression = callExpr.getExpression();
    
    // Check if it's a property access expression (e.g. factory.submitCampaignRequest)
    if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const nameNode = expression.getNameNode();
        const functionName = nameNode.getText();
        
        const args = callExpr.getArguments();

        if (functionName === "submitCampaignRequest") {
            // Old args length: usually 5 or 6 (with overrides)
            // Name, Desc, ImageHash, Category, Minimum, [Overrides]
            if (args.length >= 5) {
                // Remove args 0 and 1, leaving the 3rd (index 2) as the metadataCID, but let's just make it a string
                args[0].replaceWithText('"ipfs://dummy"');
                
                // Remove the second and third arguments
                callExpr.removeArgument(2); // Remove ImageHash
                callExpr.removeArgument(1); // Remove Desc
            }
        } 
        else if (functionName === "createRequest") {
            // Old args: Description, Value, Recipient, Verifier, EvidenceHash
            if (args.length === 5) {
                // Change description (args[0]) to metadataCID
                args[0].replaceWithText('"ipfs://dummy"');
                // Remove EvidenceHash (args[4])
                callExpr.removeArgument(4);
            }
        }
        else if (functionName === "createMultiStageRequest") {
            // Old args: Description, Recipient, Verifier, Amounts, PhaseDescriptions, InitialEvidence
            if (args.length === 6) {
                args[0].replaceWithText('"ipfs://dummy"');
                args[4].replaceWithText('["ipfs://m1", "ipfs://m2"]');
                callExpr.removeArgument(5); // Remove InitialEvidence
            }
        }
    }
}

// Now replace all ethers.encodeBytes32String(...) with string literals
const callExprsAgain = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
for (const callExpr of callExprsAgain) {
    const exprText = callExpr.getExpression().getText();
    if (exprText === "ethers.encodeBytes32String") {
        const args = callExpr.getArguments();
        if (args.length === 1) {
            callExpr.replaceWithText(args[0].getText());
        }
    }
}

// Replace ethers.ZeroHash with "" inside assertions
sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach(node => {
    if (node.getText() === "ethers.ZeroHash") {
        node.replaceWithText('""');
    }
});

sourceFile.saveSync();
console.log("Refactored successfully.");
