OneChain Deployment - Faucet Issue
⚠️ BLOCKER: OneChain Faucet Not Working
Issue
The OneChain testnet faucet is not delivering gas despite multiple requests over an extended period.

Attempts Made
Total Requests: 8+

Batch 1 (Initial attempts):

Request 1: Task ID 19bcd61b-7822-41ca-910b-190ae8673971
Request 2: Task ID a0bef8fb-7374-4f62-89a7-517666fe4465
Request 3: Sent
Batch 2 (Latest attempt - 5 requests):

Request 1: Task ID 748f126c-26e0-4316-b431-4b4da0d93f86
Request 2: Task ID caa80077-c770-4cfe-98bc-c4d8c5aa5408
Request 3: Task ID f154a75a-88de-4538-8683-e92408b8f604
Request 4: Task ID 479c87b1-68a6-4e00-85cf-f7d00bc892b7
Request 5: Task ID e896555f-675b-45cf-9e97-50eaeb048058
Waiting Times: 20s, 30s, 60s+ between checks

Result: 0 SUI received on address 0x31b4...891614a64

✅ Everything Else is Ready
Contract
✅ Built successfully
✅ No errors, only minor warnings (safe)
✅ Ready to deploy
CLI Setup
✅ OneChain network configured (onechain)
✅ Private key imported (alias: onechain-deployer)
✅ Active environment: OneChain
✅ Active address: 0x31...91614a64
Frontend Configuration
✅ All 3 config files updated for OneChain
✅ Sui settings preserved (commented)
✅ Env variables ready with VITE*ONECHAIN*\* prefix
✅ Network switching documented
Documentation
✅ Network switching README
✅ Deployment instructions
✅ Testing procedures
🔄 Alternative Solutions
Option 1: Manual Gas Request via Community
OneChain Labs likely has a Discord or Telegram channel where you can:

Request gas manually from admins/moderators
Report faucet issue
Get direct support
Recommended Steps:

1. Join OneChain Labs Discord/Telegram
2. Find #faucet or #support channel
3. Provide address: 0x31b4...891614a64
4. Mention hackathon (OneHack 2.0) if applicable
   Option 2: Use Different Address
   If you have another funded address on OneChain:

# Import the address

sui keytool import <private_key> ed25519 --alias my-funded-address

# Switch to it

sui client switch --address my-funded-address

# Deploy contract

cd smartcontract/royal-mint-king
sui client publish --gas-budget 500000000
Option 3: Wait for Faucet Fix
The faucet might be temporarily down. You could:

Check OneChain Labs status page
Try again in a few hours
Monitor their social media for updates
Option 4: Deploy on Sui Instead (Working)
You already have a fully working Sui deployment:

Package: 0x15d494dfc89e799e5823c674aec83bf80ea9abf7844b243cddada957b38e41f7
Tested and verified ✅
To switch back to Sui:

Follow
network_switch.md
Uncomment Sui sections in 3 files
Comment OneChain sections
Restart server
📋 When Gas Arrives - Deployment is 5 Minutes
Once you get gas on OneChain (via any method above):

1. Verify Gas
   sui client gas

# Should show gas coins

2. Deploy Contract
   cd /home/george/Documents/react/hackathons/Royal-Mint-King/smartcontract/royal-mint-king
   sui client publish --gas-budget 500000000
3. Capture IDs
   From deployment output, save:

Package ID
GameRegistry shared object ID
PlayerStats shared object ID 4. Update .env
VITE_ONECHAIN_CONTRACT_PACKAGE_ID=<package_id>
VITE_ONECHAIN_GAME_REGISTRY_ID=<game_registry_id>
VITE_ONECHAIN_PLAYER_STATS_ID=<player_stats_id> 5. Test Transaction
sui client call \\
--package <PACKAGE_ID> \\
--module royal_mint_kingpin \\
--function submit_ai_game \\
--args <GAME_REGISTRY> <PLAYER_STATS> <GAME_ID_BYTES> <ADDRESS> true false 0x6 \\
--gas-budget 100000000 6. Test Frontend
npm run dev

# Connect wallet → Should show "OneChain Testnet"

# Submit game → Should sign successfully

Summary
Issue: OneChain faucet not working
Blocker: No gas for deployment
Ready: Contract, CLI, Config, Documentation
Next Step: Get gas via alternative method
ETA: 5-10 minutes once gas is available

Recommendation: Try OneChain Discord/Telegram for manual gas request while waiting for faucet to be fixed.
