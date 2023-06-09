require('dotenv').config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  // solidity: "0.8.18",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        // allowUnlimitedContractSize: true,
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "mumbai",

  
  networks:{
    // local:{
    // },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};

export default config;
