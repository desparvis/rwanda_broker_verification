require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // This loads .env variables

module.exports = {
  solidity: "0.8.26",
  networks: {
    // Defining the live testnet configuration
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};