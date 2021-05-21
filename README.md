## Pooltogether Yield Source for Lido ETH2 Staking daily rewards

Adapted from https://github.com/steffenix/sushi-pooltogether

- Accepts wETH as deposits
- Uses 1inch to swap the wETH to native ETH, to then deposit into Lido
- Uses Curve to swap stETH back to native ETH, as a workaround for disabled stETH withdrawals
- Still a work in progress

# Install project

```
yarn
```

# Run tests

## Setup

Copy .env.sample to .env and update the required enviroment variables to ran integration tests:

```
WEB3_INFURA_PROJECT_ID=
ETHERSCAN_TOKEN=
```

You will get the first one from https://infura.io/
You will get the second one from https://etherscan.io/

## Verify

```
yarn verify
```

runs both test and hint.

## Test

```
yarn test
```

## Coverage

```
yarn coverage
```

# Deployement

In order to deploy to mainnet:

Update `HDWALLET_MNEMONIC` in your env file and deploy:

```
env-cmd yarn hardhat --network mainnet deploy
env-cmd yarn hardhat --network mainnet etherscan-verify --api-key $ETHERSCAN_TOKEN
