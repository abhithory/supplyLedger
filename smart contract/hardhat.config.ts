import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  // solidity: "0.8.18",
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        // allowUnlimitedContractSize: true,
        enabled: true,
        runs: 200
      }
    }
  },
  networks:{
    // local:{
    // }
  }
};

export default config;
