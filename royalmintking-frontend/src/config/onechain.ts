import { SuiClient } from "@mysten/sui/client";

// ============================================
// NETWORK CONFIGURATION
// ============================================
// Toggle between Sui and OneChain by commenting/uncommenting

// === ONE CHAIN TESTNET (ACTIVE) ===
// export const NETWORK_CONFIG = {
//   testnet: {
//     name: "OneChain Testnet",
//     rpc: "https://rpc-testnet.onelabs.cc:443",
//     faucet: "https://faucet-testnet.onelabs.cc",
//     explorer: "https://explorer-testnet.onelabs.cc",
//   },
//   mainnet: {
//     name: "OneChain Mainnet",
//     rpc: "https://rpc.mainnet.onelabs.cc:443",
//     explorer: "https://explorer.mainnet.onelabs.cc",
//   },
// };

// === SUI TESTNET (COMMENTED - Uncomment to switch back) ===
export const NETWORK_CONFIG = {
  testnet: {
    name: "Sui Testnet",
    rpc: "https://fullnode.testnet.sui.io:443",
    faucet: "https://faucet.testnet.sui.io",
    explorer: "https://suiscan.xyz/testnet",
  },
  devnet: {
    name: "Sui Devnet",
    rpc: "https://fullnode.devnet.sui.io:443",
    faucet: "https://faucet.devnet.sui.io",
    explorer: "https://suiscan.xyz/devnet",
  },
  mainnet: {
    name: "Sui Mainnet",
    rpc: "https://fullnode.mainnet.sui.io:443",
    explorer: "https://suiscan.xyz/mainnet",
  },
};

// Create network client
export const networkClient = new SuiClient({
  url: NETWORK_CONFIG.testnet.rpc,
});

// Backwards compatibility aliases
export const SUI_NETWORK_CONFIG = NETWORK_CONFIG;
export const suiClient = networkClient;

// ============================================
// CONTRACT CONFIGURATION
// ============================================

// === ONECHAIN DEPLOYMENT (ACTIVE) ===
// export const CONTRACT_PACKAGE_ID =
//   import.meta.env.VITE_ONECHAIN_CONTRACT_PACKAGE_ID || "";
// export const GAME_REGISTRY_ID = 
//   import.meta.env.VITE_ONECHAIN_GAME_REGISTRY_ID || "";
// export const PLAYER_STATS_ID = 
//   import.meta.env.VITE_ONECHAIN_PLAYER_STATS_ID || "";

// === SUI DEPLOYMENT (COMMENTED - Uncomment to switch back) ===
export const CONTRACT_PACKAGE_ID =
  import.meta.env.VITE_CONTRACT_PACKAGE_ID || "";
export const GAME_REGISTRY_ID = 
  import.meta.env.VITE_GAME_REGISTRY_ID || "";
export const PLAYER_STATS_ID = 
  import.meta.env.VITE_PLAYER_STATS_ID || "";

export const CONTRACT_MODULE = "royal_mint_kingpin";


// Contract function names
export const CONTRACT_FUNCTIONS = {
  SUBMIT_AI_GAME: "submit_ai_game",
  SUBMIT_TWO_PLAYER_GAME: "submit_two_player_game",
  GET_WINS: "get_wins",
  GET_LOSSES: "get_losses",
  GET_DRAWS: "get_draws",
  GET_GAMES_PLAYED: "get_games_played",
};

// Contract event types
export const CONTRACT_EVENTS = {
  GAME_SUBMITTED: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::GameSubmitted`,
  NFT_MINTED: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::NFTMinted`,
};

// Gas budgets
export const GAS_BUDGET = {
  SUBMIT_GAME: "10000000", // 0.01 SUI
  MINT_NFT: "5000000", // 0.005 SUI
  QUERY: "1000000", // 0.001 SUI
};

// Clock object ID (Sui's shared clock object)
export const CLOCK_OBJECT_ID = "0x6";

export const NETWORK = "testnet";

// Helper function to get explorer URL
export const getExplorerUrl = (
  txHash: string,
  network: "devnet" | "testnet" | "mainnet" = "testnet"
) => {
  const baseUrls = {
    devnet: "https://suiscan.xyz/devnet/tx",
    testnet: "https://suiscan.xyz/testnet/tx",
    mainnet: "https://suiscan.xyz/mainnet/tx",
  };

  return `${baseUrls[network]}/${txHash}`;
};
