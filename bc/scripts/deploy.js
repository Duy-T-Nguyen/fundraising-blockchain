async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Campaign = await ethers.getContractFactory("Campaign");

  const campaign = await Campaign.deploy(
    ethers.parseEther("0.01") // minimum donation
  );

  await campaign.waitForDeployment();

  console.log("Contract deployed to:", campaign.target);
}

main();