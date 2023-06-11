require('dotenv').config();
require("hardhat-contract-sizer");
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
  // defaultNetwork: "mumbai",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "299d2cce099c88788b2785a2eec3b826c338ada82fd5bf03fb360deed8d5130d", "e9d7e8cf58b23c26fe7a380fcbd565190fe8308183855871c3909d0e9653c22c", "385897e5a0b57545089200a23e4e87230a15a2edf5ad291d527fe65774f75a46", "144b10757d405cc7076b9b8cf01aedca000c1411e31515109b373a92ec9575f6",
        "72c83b154b1a6afb913714eef01ab5526f13e1df05ed0d8e849d8818b49e92b9",
        "f856a6e9c99091102e9be9b6e16d2e9a85e28fa6714ccc1b7917bf2a216b4fd6"
      ]
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2,
        process.env.PRIVATE_KEY3,
        process.env.PRIVATE_KEY4,
        process.env.PRIVATE_KEY5,
        process.env.PRIVATE_KEY6
      ]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  },
  contractSizer: {
    // alphaSort: true,
    // disambiguatePaths: false,
    // runOnCompile: true,
    // strict: true,
    // only: [':ERC20$'],
  }
};

export default config;
