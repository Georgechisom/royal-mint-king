import { defineChain } from "@mysten/dapp-kit";

// === ONECHAIN TESTNET (ACTIVE) ===
// export const onechainTestnet = defineChain("onechain:testnet", {
//   name: "OneChain Testnet",
//   network: "onechain-testnet",
//   rpcUrl: "https://rpc-testnet.onelabs.cc:443",
// });

// === SUI TESTNET (COMMENTED - Uncomment to switch back) ===
export const suiTestnet = defineChain("sui:testnet", {
  name: "Sui Testnet",
  network: "sui-testnet",
  rpcUrl: "https://fullnode.testnet.sui.io:443",
});
