import { defineChain } from "@mysten/dapp-kit";

export const onechainTestnet = defineChain("onechain:testnet", {
  name: "OneChain Testnet",
  network: "onechain-testnet",
  rpcUrl: "https://rpc-testnet.onelabs.cc:443",
});
