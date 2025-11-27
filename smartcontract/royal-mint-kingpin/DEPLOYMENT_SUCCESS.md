# 🎉 RoyalMintKingpin - Successfully Deployed on Sui!

## ✅ Deployment Complete

**Network:** Sui Devnet  
**Date:** 2025-11-27  
**Deployed By:** `0x31b44ed3defac4cfcfb5820682dc29a76af735845570d9db58c5476891614a64`

---

## 📦 Contract Details

**Package ID:**  
```
0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66
```

**Module:** `royal_mint_kingpin`

**Explorer Link:**  
https://suiscan.xyz/devnet/object/0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66

---

## 💰 Deployment Costs

- **Gas Used:** 29,631,480 MIST (~0.03 SUI)
- **Gas Budget:** 100,000,000 MIST (0.1 SUI)
- **Remaining Balance:** ~9.97 SUI

---

## 🎮 How to Use

### Submit a Two-Player Game

```bash
sui client call \
  --package 0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66 \
  --module royal_mint_kingpin \
  --function submit_two_player_game \
  --args <GAME_REGISTRY_ID> <PLAYER_STATS_ID> "game1" <PLAYER1_ADDR> <PLAYER2_ADDR> <WINNER_ADDR> false 0x6 \
  --gas-budget 10000000
```

### Submit an AI Game

```bash
sui client call \
  --package 0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66 \
  --module royal_mint_kingpin \
  --function submit_ai_game \
  --args <GAME_REGISTRY_ID> <PLAYER_STATS_ID> "aigame1" <YOUR_ADDRESS> true false 0x6 \
  --gas-budget 10000000
```

### Query Player Stats

```bash
sui client call \
  --package 0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66 \
  --module royal_mint_kingpin \
  --function get_wins \
  --args <PLAYER_STATS_ID> <PLAYER_ADDRESS> \
  --gas-budget 1000000
```

---

## 📊 Contract Features

✅ **NFT Minting** - Victory NFTs for game winners  
✅ **Game Tracking** - Permanent on-chain game records  
✅ **Player Statistics** - Wins, losses, draws tracking  
✅ **PvP Support** - Two-player game submissions  
✅ **PvAI Support** - AI game submissions  
✅ **Anti-replay** - Duplicate game prevention  

---

## 🔗 Important Links

- **Sui Devnet Explorer:** https://suiscan.xyz/devnet
- **Package:** https://suiscan.xyz/devnet/object/0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66
- **Sui Documentation:** https://docs.sui.io
- **Faucet:** https://faucet.devnet.sui.io

---

## 🎯 Next Steps for OneHack 2.0

1. ✅ Contract deployed on Sui
2. ⏳ Get shared object IDs (PlayerStats, GameRegistry)
3. ⏳ Test game submissions
4. ⏳ Integrate with frontend
5. ⏳ Submit to OneHack 2.0 hackathon

---

**Status:** 🟢 **LIVE ON SUI DEVNET**
