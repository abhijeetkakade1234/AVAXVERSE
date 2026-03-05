import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const targetAddress = "0xD9b2AbEf89758Dc0B17D43934BEDBF4517F1FcCa";

  console.log(`Funding ${targetAddress} with 100 test ETH...`);

  const tx = await deployer.sendTransaction({
    to: targetAddress,
    value: ethers.parseEther("100"),
  });

  await tx.wait();
  console.log("✅ Successfully funded user account!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
