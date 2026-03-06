import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const targetAddresses = [
    "0x8e133dF53EaC0211B9b57dCB4CF616bACB0a59f9",
    "0xD9b2AbEf89758Dc0B17D43934BEDBF4517F1FcCa"
  ];

  for (const targetAddress of targetAddresses) {
    console.log(`Funding ${targetAddress} with 100 test AVAX...`);

    const tx = await deployer.sendTransaction({
      to: targetAddress,
      value: ethers.parseEther("100"),
    });

    await tx.wait();
    console.log(`✅ Successfully funded ${targetAddress} with 100 AVAX!`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
