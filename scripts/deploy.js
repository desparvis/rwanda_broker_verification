const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of RWAREB contracts...\n");

  // 1. Deploy the Agent Registry
  console.log("Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  
  // In Ethers v6, we use waitForDeployment() instead of deployed()
  await agentRegistry.waitForDeployment();
  const registryAddress = await agentRegistry.getAddress();
  
  console.log(`Success: AgentRegistry deployed to: ${registryAddress}\n`);

  // 2. Deploy the Inspection Escrow
  console.log("Deploying InspectionEscrow...");
  // Pass the registryAddress to the constructor
  const InspectionEscrow = await hre.ethers.getContractFactory("InspectionEscrow");
  const inspectionEscrow = await InspectionEscrow.deploy(registryAddress);
  
  await inspectionEscrow.waitForDeployment();
  const escrowAddress = await inspectionEscrow.getAddress();
  
  console.log(`Success: InspectionEscrow deployed to: ${escrowAddress}\n`);

  // Print out the final instructions for the frontend
  console.log("Deployment Complete!");
  console.log(`const REGISTRY_ADDRESS = "${registryAddress}";`);
  console.log(`const ESCROW_ADDRESS = "${escrowAddress}";`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});