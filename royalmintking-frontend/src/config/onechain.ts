import { SuiClient } from "@mysten/sui/client";

export const ONECHAIN_CONFIG = {
  testnet: {
    rpc: "https://fullnode.testnet.sui.io:443",
    faucet: "https://faucet.testnet.sui.io",
    explorer: "https://suiscan.xyz/testnet",
  },
  mainnet: {
    rpc: "https://rpc.mainnet.onelabs.cc:443",
    explorer: "https://explorer.mainnet.onelabs.cc", // Assumed
  },
};

// Create OneChain client
export const onechainClient = new SuiClient({
  url: ONECHAIN_CONFIG.testnet.rpc,
});

// Contract configuration
export const CONTRACT_PACKAGE_ID =
  import.meta.env.VITE_CONTRACT_PACKAGE_ID || "";
export const CONTRACT_MODULE = "royal_mint_kingpin";

// Shared object IDs (these will be set after deployment)
export const GAME_REGISTRY_ID = import.meta.env.VITE_GAME_REGISTRY_ID || "";
export const PLAYER_STATS_ID = import.meta.env.VITE_PLAYER_STATS_ID || "";

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
  network: "devnet" | "testnet" | "onechain" = "testnet"
) => {
  const baseUrls = {
    devnet: "https://suiscan.xyz/devnet/tx",
    testnet: "https://suiscan.xyz/testnet/tx",
    onechain: "https://explorer-testnet.onelabs.cc/txblock",
  };

  return `${baseUrls[network]}/${txHash}`;
};
