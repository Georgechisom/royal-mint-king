# ✅ SUCCESSFUL DEPLOYMENT - Sui Devnet

## Deployment Information

**Date:** 2025-11-27  
**Network:** Sui Devnet  
**Deployer Address:** `0x31b44ed3defac4cfcfb5820682dc29a76af735845570d9db58c5476891614a64`

---

## 📦 Contract IDs

### Package ID

```
0xc3296ce250a35fbedd9defcca2fcd4fe3f9b24e96c9808e733f9f56bdbf11003
```

### Shared Objects

**GameRegistry ID:**

```
0x70d5baf2c7877085d62df332d3895d2e015ef81d16ca3626f5c86271a5629efd
```

**PlayerStats ID:**

```
0xbeb8182126f0bf0c01391002023f2be86fe7e040a6345c4bc055329eb3dbb132
```

---

## 🔗 Explorer Links

**Package:**  
https://suiscan.xyz/devnet/object/0xc675b358926a57d7bce3c70018a8fd80fa6228612a6806b9a8c75847fedae252

**GameRegistry:**  
https://suiscan.xyz/devnet/object/0x67e1e45625f54ef5354c221a44f63cfb2edffec20b904feb9194547d985c2041

**PlayerStats:**  
https://suiscan.xyz/devnet/object/0xbeb8182126f0bf0c01391002023f2be86fe7e040a6345c4bc055329eb3dbb132

---

## 💰 Deployment Cost

- **Gas Used:** 29,631,480 MIST (~0.03 SUI)
- **Gas Budget:** 100,000,000 MIST (0.1 SUI)
- **Transaction Digest:** Check deployment log

---

## 🎮 Usage Examples

### Submit AI Game

```bash
sui client call \
  --package 0xc675b358926a57d7bce3c70018a8fd80fa6228612a6806b9a8c75847fedae252 \
  --module royal_mint_kingpin \
  --function submit_ai_game \
  --args 0x67e1e45625f54ef5354c221a44f63cfb2edffec20b904feb9194547d985c2041 0xf661ae612513febdc4b1585ca1c74f73e8210c88f31fc919db033c413d59bbcf \"game123\" <YOUR_ADDRESS> true false 0x6 \
  --gas-budget 10000000
```

### Submit Two-Player Game

```bash
sui client call \
  --package 0xc675b358926a57d7bce3c70018a8fd80fa6228612a6806b9a8c75847fedae252 \
  --module royal_mint_kingpin \
  --function submit_two_player_game \
  --args 0x67e1e45625f54ef5354c221a44f63cfb2edffec20b904feb9194547d985c2041 0xf661ae612513febdc4b1585ca1c74f73e8210c88f31fc919db033c413d59bbcf \"game456\" <PLAYER1_ADDR> <PLAYER2_ADDR> <WINNER_ADDR> false 0x6 \
  --gas-budget 10000000
```

### Query Player Stats

```bash
sui client call \
  --package 0xc675b358926a57d7bce3c70018a8fd80fa6228612a6806b9a8c75847fedae252 \
  --module royal_mint_kingpin \
  --function get_wins \
  --args 0xf661ae612513febdc4b1585ca1c74f73e8210c88f31fc919db033c413d59bbcf <PLAYER_ADDR> \
  --gas-budget 1000000
```

---

## ✅ Next Steps

1. ✅ **Frontend .env Updated** - All IDs configured
2. ⏭️ **Test Frontend** - `cd royalmintkingpin-frontend && npm run dev`
3. ⏭️ **Update MCP Server** - Add contract IDs to server.ts
4. ⏭️ **Update Documentation** - README files for deployment info

---

## ✅ Next Steps

1. ✅ **Frontend .env Updated** - All IDs configured for OneChain Testnet
2. ⏭️ **Test Frontend** - `cd royalmintkingpin-frontend && npm run dev`
3. ⏭️ **Update MCP Server** - Add contract IDs to server.ts
4. ⏭️ **Update Documentation** - README files for deployment info

---

**Status:** 🟢 **LIVE ON ONECHAIN TESTNET**
