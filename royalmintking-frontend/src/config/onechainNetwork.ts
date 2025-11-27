import { defineChain } from "@mysten/dapp-kit";

export const suiTestnet = defineChain("sui:testnet", {
  name: "Sui Testnet",
  network: "sui-testnet",
  rpcUrl: "https://fullnode.testnet.sui.io:443",
});
