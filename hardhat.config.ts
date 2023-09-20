import * as dotenv from 'dotenv';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomiclabs/hardhat-ethers';
import "hardhat-deploy";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  gasReporter: {
    currency: 'USD',
    enabled: true,
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: {
        mnemonic: process.env.MNEMONIC || '',
      },
      chainId: 80001,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.POLY_API_KEY || '',
  },
};

export default config;
