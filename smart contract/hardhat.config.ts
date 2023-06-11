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
        "73ec30cabe9019d5cdb6fc5bec9a3cbd220efc3e579bccd29a223b2d6c23a4ab", "8b687b3cbd5f40d9b48d7f6ec62ce262b589c5d1153c1e3b3a2107e0368489cb", "542542604c14c2c483163ceebae127b09520ffb7172a18d236cb47cb32f3d008", "5c90ee7cb682c8eeb008d75e1ca5cbafc8df1abd19b554cab0df910008b6c2de",
        "3f977a37d23ed7b982de1480d9d5cfeb2827c13edbc411fc2de6e2ffc47af25a",
        "62c4d5c7bc5c12ffd28321674720b4879c616c4942d78ce2afb7bc85fc69b5f5"
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
