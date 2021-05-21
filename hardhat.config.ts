/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { HardhatUserConfig, HardhatNetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';
import 'hardhat-etherscan-abi';
import '@nomiclabs/hardhat-solhint';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'hardhat-dependency-compiler';

// const accounts = {
//   mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
//   accountsBalance: "990000000000000000000",
// }

let hardhat: HardhatNetworkUserConfig = {
  blockGasLimit: 20000000,
  allowUnlimitedContractSize: true,
  chainId: 1,
};

if (process.env.FORK_MAINNET) {
  console.log('Using mainnet fork');
  hardhat = {
    forking: {
      url: `https://mainnet.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
    },
    ...hardhat,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.6.12',
    settings: {
      outputSelection: {
        '*': {
          '*': ['storageLayout'],
        },
      },
    },
  },

  networks: {
    hardhat,
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || '',
      },
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || '',
      },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || '',
      },
    },
    localhost: {
      chainId: 1,
      url: 'http://127.0.0.1:8545',
      allowUnlimitedContractSize: true,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_TOKEN,
  },
  mocha: {
    timeout: 60000,
  },
  dependencyCompiler: {
    paths: [
      '@pooltogether/pooltogether-contracts/contracts/builders/PoolWithMultipleWinnersBuilder.sol',
      '@pooltogether/pooltogether-contracts/contracts/registry/Registry.sol',
      '@pooltogether/pooltogether-contracts/contracts/prize-pool/compound/CompoundPrizePoolProxyFactory.sol',
      '@pooltogether/pooltogether-contracts/contracts/prize-pool/yield-source/YieldSourcePrizePoolProxyFactory.sol',
      '@pooltogether/pooltogether-contracts/contracts/prize-pool/stake/StakePrizePoolProxyFactory.sol',
      '@pooltogether/pooltogether-contracts/contracts/builders/MultipleWinnersBuilder.sol',
      '@pooltogether/pooltogether-contracts/contracts/prize-strategy/multiple-winners/MultipleWinnersProxyFactory.sol',
      '@pooltogether/pooltogether-contracts/contracts/builders/ControlledTokenBuilder.sol',
      '@pooltogether/pooltogether-contracts/contracts/token/ControlledTokenProxyFactory.sol',
      '@pooltogether/pooltogether-contracts/contracts/token/TicketProxyFactory.sol',
    ],
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    lido: {
      localhost: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      mainnet: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    },
    curvePool: {
      localhost: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
      mainnet: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    },
    weth: {
      localhost: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      mainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    oneSplit: {
      localhost: '0x50FDA034C0Ce7a8f7EFDAebDA7Aa7cA21CC1267e',
      mainnet: '0x50FDA034C0Ce7a8f7EFDAebDA7Aa7cA21CC1267e',
    },
  },
};

export default config;
