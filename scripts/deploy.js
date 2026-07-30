const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of RWAREB registry...\n");

  // Deploy the Agent Registry
  console.log("Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  
  // Wait for the block to be mined (Ethers v6 syntax)
  await agentRegistry.waitForDeployment();
  const registryAddress = await agentRegistry.getAddress();
  
  console.log(`Success: AgentRegistry deployed to: ${registryAddress}\n`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});