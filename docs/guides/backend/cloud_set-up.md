# Team Amplify Setup Instructions
# Backend/Cloud Service Setup Template (Web3 Project)
## For New Team Members

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd nnenu-app
    cd <project-folder>

2. **Install dependencies**

   ```bash
   yarn install
    # Use the package manager specified by the project
    npm install
    # or
    yarn install

3. **Configure AWS credentials**

   ```bash
   aws configure
    - If using a cloud service (e.g., Infura, Alchemy, custom node):
       - Obtain API keys or credentials from your team lead.
       - Add them to your `.env` file:
          ```env
          INFURA_API_KEY=<your-infura-key>
          ALCHEMY_API_KEY=<your-alchemy-key>
          PRIVATE_KEY=<your-wallet-private-key>
          ```

4. **Pull the appropriate environment**

   **For Development:**

   ```bash
   amplify pull --appId d14sni1p7z57hd --envName dev
    - Connect to local blockchain (e.g., Hardhat, Ganache, Foundry):
       ```bash
       npx hardhat node
       # or
       anvil
       # or
       ganache-cli
       ```
    - Deploy contracts to local node:
       ```bash
       npx hardhat run scripts/deploy.js --network localhost
       # or
       forge script scripts/Deploy.s.sol --fork-url http://localhost:8545
       ```

   **For Production:**

   ```bash
   amplify pull --appId d14sni1p7z57hd --envName prod
    - Deploy contracts to testnet/mainnet using your cloud provider:
       ```bash
       npx hardhat run scripts/deploy.js --network goerli
       # or
       forge script scripts/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY
       ```

5. **The system will automatically create local config files with correct paths**

## Environment Switching

To switch between environments:

```bash
# Switch to dev
```bash
# For Hardhat/Foundry/Truffle, update your network config in `hardhat.config.js`, `foundry.toml`, or `truffle-config.js`.
# Example: switch from localhost to goerli/testnet/mainnet by changing the network parameter.
npx hardhat run scripts/deploy.js --network goerli
forge script scripts/Deploy.s.sol --rpc-url $RPC_URL
# Switch to prod
amplify env checkout prod
```

- Never commit sensitive files (e.g., `.env`, private keys, API keys) to git.
- Each developer should have their own local `.env` and config files.
- Use your blockchain tool's commands to list environments/networks (e.g., check `hardhat.config.js` or `foundry.toml`).
- Use deployment logs and artifacts to verify current environment and resources.
- Use `amplify env list` to see available environments
- Use `amplify status` to see current environment and resources

## Troubleshooting

### Permission Issues

If you encounter "Permission denied" errors:
```bash
# Fix ownership of project directory (Linux/macOS)
sudo chown -R $USER:$USER <project-folder>
# Never use sudo with blockchain tool commands (e.g., hardhat, forge, truffle)
# Fix ownership of amplify directory
sudo chown -R $USER:staff amplify/

# Never use sudo with amplify commands
# This can cause permission issues for git and other team members
```

If you get merge conflicts with amplify files:
```bash
# Reset local config or artifacts
rm -rf deployments/ artifacts/ .env
# Pull or regenerate environment/config files as needed
# Example: redeploy contracts to local/testnet
npx hardhat run scripts/deploy.js --network localhost
# Reset amplify local config
rm -rf amplify/.config/local-*

# Pull environment again
amplify pull --appId d14sni1p7z57hd --envName dev
```

```bash
# Regenerate your local config files or artifacts
# Example: redeploy contracts or reconfigure .env
npx hardhat run scripts/deploy.js --network localhost
# or
forge script scripts/Deploy.s.sol --fork-url http://localhost:8545
```bash
# Regenerate your local config files
amplify pull --appId d14sni1p7z57hd --envName dev
# or
amplify pull --appId d14sni1p7z57hd --envName prod
```

```bash
# Compile contracts
npx hardhat compile
forge build

# Run tests
npx hardhat test
forge test

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
forge script scripts/Deploy.s.sol --fork-url http://localhost:8545

# Check current network/config
cat .env
cat hardhat.config.js
cat foundry.toml
```
### Common Commands

```bash
# Check current environment
amplify env list

# Switch environment
amplify env checkout <env-name>

# Update local config from cloud
amplify pull
```
