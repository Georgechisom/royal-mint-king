import { SuiClient } from "@mysten/sui/client";

// Sui Network Configuration
export const SUI_NETWORK_CONFIG = {
  testnet: {
    rpc: "https://fullnode.testnet.sui.io:443",
    faucet: "https://faucet.testnet.sui.io",
    explorer: "https://suiscan.xyz/testnet",
  },
  devnet: {
    rpc: "https://fullnode.devnet.sui.io:443",
    faucet: "https://faucet.devnet.sui.io",
    explorer: "https://suiscan.xyz/devnet",
  },
  mainnet: {
    rpc: "https://fullnode.mainnet.sui.io:443",
    explorer: "https://suiscan.xyz/mainnet",
  },
};

// Create Sui client
export const suiClient = new SuiClient({
  url: SUI_NETWORK_CONFIG.testnet.rpc,
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
  network: "devnet" | "testnet" | "mainnet" = "testnet"
) => {
  const baseUrls = {
    devnet: "https://suiscan.xyz/devnet/tx",
    testnet: "https://suiscan.xyz/testnet/tx",
    mainnet: "https://suiscan.xyz/mainnet/tx",
  };

  return `${baseUrls[network]}/${txHash}`;
};
