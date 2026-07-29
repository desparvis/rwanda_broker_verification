import { network } from "hardhat";

async function main() {
  console.log("Deploying AgentRegistry contract...");

  // Hardhat 3 network connection instantiation
  const { ethers, networkName } = await network.create();

  console.log(`Connecting to network: ${networkName}`);

  // In Hardhat 3 + hardhat-ethers, deployContract handles factory creation & deployment
  const registry = await ethers.deployContract("AgentRegistry");

  await registry.waitForDeployment();

  const deployedAddress = await registry.getAddress();
  console.log(`Success: AgentRegistry successfully deployed to: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});