import { defineConfig } from "hardhat/config";
import harhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [harhatEthers],
  solidity: {
    version: "0.8.28",
  },
});
