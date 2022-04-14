import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import '@nomiclabs/hardhat-ethers';
import "@typechain/hardhat";
import "solidity-coverage";

import * as dotenv from 'dotenv';

import "./tasks/QuokkaToken.tasks"

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',]
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts:
      process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
    }
  }

export default config;