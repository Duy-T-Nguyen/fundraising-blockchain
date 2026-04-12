async function main() {
  const contract = await ethers.getContractAt(
    "Campaign",
    "0xYourAddress"
  );

  await contract.donate({ value: ethers.parseEther("0.01") });

  console.log("Donated!");
}