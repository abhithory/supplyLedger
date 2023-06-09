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


  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "3082f5210e9e4588b803f074a2b50e183f03b1fe9bf8bb1929ea945aa60f4a20", "33586c197c3d98428c6f08928f1a43d23e670fcaf06c4df7b24f8d379069433c", "ecbca0a65b3caebdaebefa529f5b4fc564e61ef314933a06841cb0f9481bdb73", "9bde292c185c437e781dc3e2a3e9a203351498d4d04b364828be8aa0b5c7ce4e",
        "d029eefc2c90c32724579dc361c00d02412295858a83de8d53b483c87286ba6c",
        "5599c57943fcdd303f0936556bb4bf0c4c5b9ddefebd6fd2e713da561dd36baf"
      ]
    },
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
