# Deployment Instructions for Royal Mint Kingp

## Current Situation

The move contract is ready for deployment but we've encountered gas issues with the Sui faucet. All frontend code has been updated to work with the Sui/OneChain contract.

## What's Been Completed

✅ Frontend config files updated with contract constants
✅ Hooks rewritten for Sui Move contract integration  
✅ All pages updated (removed wagmi/EVM integrations)
✅ Leaderboard uses event-based data fetching
✅ All TypeScript lint errors fixed

## Deployment Options

### Option 1: Sui Devnet (Recommended)

**Gas Issue**: The faucet provides multiple 10 SUI coins, but Sui should automatically "smash" them together for deployment. However, we keep getting an error.

**Alternative Gas Sources**:
1. Try Sui Discord: Join https://discord.gg/sui and use `!faucet <address>` in `#devnet-faucet`
2. Community faucets: `faucet.n1stake.com` or `faucet.suilearn.io`
3. Use a different wallet with existing testnet SUI

**Deployment Command**:
```bash
cd smartcontract/royal-mint-kingpin
sui client publish --gas-budget 100000000
```

### Option 2: OneChain Testnet

OneChain is a Sui-based network. Try deploying there instead:

```bash
# Switch network to OneChain
sui client new-env --rpc https://rpc-testnet.onelabs.cc:443
sui client switch --env onechain

# Get gas from OneChain faucet
curl -X POST https://faucet-testnet.onelabs.cc:443/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"0x31b44ed3defac4cfcfb5820682dc29a76af735845570d9db58c5476891614a64"}}'

# Deploy
sui client publish --gas-budget 100000000
```

## Post-Deployment Steps

After successful deployment, you need to:

1. **Extract IDs from deployment output**:
   - Package ID (starts with `0x...`)
   - Find the `GameRegistry` shared object ID
   - Find the `Player Stats` shared object ID

2. **Update frontend .env file**:
```env
VITE_CONTRACT_PACKAGE_ID=<package_id>
VITE_GAME_REGISTRY_ID=<game_registry_shared_object_id>
VITE_PLAYER_STATS_ID=<player_stats_shared_object_id>
```

3. **Update MCP server** (backend-server/mcp-servers/src/server.ts)

4. **Test frontend**:
```bash
cd royalmintkingpin-frontend
npm run dev
```

5. **Test MCP server**:
```bash
cd backend-server/mcp-servers
pnpm dev
```

## Manual Deployment (If Automated Fails)

If `sui client publish` continues to fail, you can deploy via the Sui Explorer:
1. Go to https://suiscan.xyz/devnet
2. Use the "Publish Module" feature
3. Upload your compiled Move bytecode

## Your Wallet Address

`0x31b44ed3defac4cfcfb5820682dc29a76af735845570d9db58c5476891614a64`
