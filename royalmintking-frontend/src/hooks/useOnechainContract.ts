import { Transaction } from "@mysten/sui/transactions";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import {
  CONTRACT_PACKAGE_ID,
  CONTRACT_MODULE,
  CONTRACT_FUNCTIONS,
  CONTRACT_EVENTS,
  GAME_REGISTRY_ID,
  PLAYER_STATS_ID,
  suiClient,
} from "@/config/onechain";

import { useState, useEffect, useCallback } from "react";

export const useSubmitAIGame = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitAIGame = async ({
    gameId,
    humanWon,
    isDraw,
  }: {
    gameId: string;
    humanWon: boolean;
    isDraw: boolean;
  }) => {
    if (!currentAccount) {
      throw new Error("No wallet connected. Please connect OneWallet first.");
    }

    if (!GAME_REGISTRY_ID || !PLAYER_STATS_ID) {
      throw new Error(
        "Contract shared objects not configured. Please check .env file."
      );
    }

    setIsPending(true);
    setError(null);

    try {
      const tx = new Transaction();

      // Set sender - CRITICAL FIX
      tx.setSender(currentAccount.address);

      // Convert gameId to bytes
      const gameIdBytes = Array.from(new TextEncoder().encode(gameId));

      // Call Move contract function
      tx.moveCall({
        target: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_FUNCTIONS.SUBMIT_AI_GAME}`,
        arguments: [
          tx.object(GAME_REGISTRY_ID), // registry: &mut GameRegistry
          tx.object(PLAYER_STATS_ID), // stats: &mut PlayerStats
          tx.pure.vector("u8", gameIdBytes), // game_id: vector<u8>
          tx.pure.address(currentAccount.address), // human_player: address
          tx.pure.bool(humanWon), // human_won: bool
          tx.pure.bool(isDraw), // is_draw: bool
          tx.object("0x6"), // clock: &Clock (Sui's shared Clock object)
        ],
      });

      // Set gas budget - CRITICAL FIX
      tx.setGasBudget(100000000); // 0.1 SUI

      // Build transaction bytes for dry-run - CRITICAL FIX
      console.log("Building transaction block...");
      const txBytes = await tx.build({ client: suiClient });

      console.log("Transaction built successfully, running dry-run...");

      // Dry-run for debugging using the built transaction
      try {
        const dryRun = await suiClient.dryRunTransactionBlock({
          transactionBlock: txBytes,
        });

        console.log("Dry-run result:", dryRun);

        if (dryRun.effects.status.status !== "success") {
          throw new Error(
            `Transaction validation failed: ${
              dryRun.effects.status.error || "Unknown error"
            }`
          );
        }

        console.log("✅ Dry-run successful! Transaction is valid.");
      } catch (dryErr) {
        console.error("Dry-run failed:", dryErr);
        throw new Error(
          `Transaction validation failed: ${
            dryErr instanceof Error ? dryErr.message : "Unknown error"
          }`
        );
      }

      // Sign and execute transaction
      console.log("Submitting transaction to blockchain...");
      const result = await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("✅ AI Game submitted successfully:", result.digest);
          },
        }
      );

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("❌ Error submitting AI game:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync: submitAIGame,
    isPending,
    error,
  };
};

export const useSubmitTwoPlayerGame = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitTwoPlayerGame = async ({
    gameId,
    player1,
    player2,
    winner,
    isDraw,
  }: {
    gameId: string;
    player1: string;
    player2: string;
    winner: string;
    isDraw: boolean;
  }) => {
    if (!currentAccount) {
      throw new Error("No wallet connected");
    }

    if (!GAME_REGISTRY_ID || !PLAYER_STATS_ID) {
      throw new Error(
        "Contract shared objects not configured. Please check .env file."
      );
    }

    setIsPending(true);
    setError(null);

    try {
      const tx = new Transaction();

      // Set sender - CRITICAL FIX
      tx.setSender(currentAccount.address);

      // Convert gameId to bytes
      const gameIdBytes = Array.from(new TextEncoder().encode(gameId));

      tx.moveCall({
        target: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_FUNCTIONS.SUBMIT_TWO_PLAYER_GAME}`,
        arguments: [
          tx.object(GAME_REGISTRY_ID), // registry: &mut GameRegistry
          tx.object(PLAYER_STATS_ID), // stats: &mut PlayerStats
          tx.pure.vector("u8", gameIdBytes), // game_id: vector<u8>
          tx.pure.address(player1), // player1: address
          tx.pure.address(player2), // player2: address
          tx.pure.address(winner), // winner: address
          tx.pure.bool(isDraw), // is_draw: bool
          tx.object("0x6"), // clock: &Clock
        ],
      });

      // Set gas budget - CRITICAL FIX
      tx.setGasBudget(100000000); // 0.1 SUI

      const result = await signAndExecute({
        transaction: tx,
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("❌ Error submitting two-player game:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync: submitTwoPlayerGame, isPending, error };
};

export const useGetPlayerStats = (playerAddress?: string) => {
  const client = useSuiClient();
  const [stats, setStats] = useState<{
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    nftBalance: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (
      !playerAddress ||
      !CONTRACT_PACKAGE_ID ||
      CONTRACT_PACKAGE_ID === "0x0"
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query player's game events
      const gameEvents = await client.queryEvents({
        query: {
          MoveEventType: CONTRACT_EVENTS.GAME_SUBMITTED,
        },
        limit: 1000,
      });

      // Calculate stats from events
      let wins = 0;
      let losses = 0;
      let draws = 0;

      gameEvents.data.forEach((event: any) => {
        const parsedData = event.parsedJson;

        if (
          parsedData.player1 === playerAddress ||
          parsedData.player2 === playerAddress
        ) {
          if (parsedData.is_draw) {
            draws++;
          } else if (parsedData.winner === playerAddress) {
            wins++;
          } else {
            losses++;
          }
        }
      });

      // Get NFT balance (owned objects)
      const ownedObjects = await client.getOwnedObjects({
        owner: playerAddress,
        filter: {
          StructType: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::GameVictoryNFT`,
        },
      });

      setStats({
        wins,
        losses,
        draws,
        gamesPlayed: wins + losses + draws,
        nftBalance: ownedObjects.data.length,
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("Error fetching player stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playerAddress, client]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

export const useTotalGamesStats = () => {
  const client = useSuiClient();
  const [totalGames, setTotalGames] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uniquePlayers, setUniquePlayers] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    if (!CONTRACT_PACKAGE_ID || CONTRACT_PACKAGE_ID === "0x0") {
      console.warn(
        "⚠️ Contract not deployed yet. Set VITE_CONTRACT_PACKAGE_ID in .env"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching game events from OneChain...");

      // Query all game submission events
      const gameEvents = await client.queryEvents({
        query: {
          MoveEventType: CONTRACT_EVENTS.GAME_SUBMITTED,
        },
        limit: 1000,
      });

      console.log("✅ Events fetched:", gameEvents.data.length);

      setEvents(gameEvents.data);
      setTotalGames(gameEvents.data.length);

      // Calculate unique players
      const playersSet = new Set<string>();
      gameEvents.data.forEach((event: any) => {
        const parsedData = event.parsedJson;
        if (parsedData.player1) playersSet.add(parsedData.player1);
        if (parsedData.player2 && parsedData.player2 !== "0x0") {
          playersSet.add(parsedData.player2);
        }
      });

      setUniquePlayers(Array.from(playersSet));
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("❌ Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    totalGamesPlayedByEveryone: totalGames,
    events,
    uniquePlayers,
    isLoading,
    error,
    refetchEvents: fetchEvents,
  };
};

export const useTotalNFTCount = (playerAddresses: string[]) => {
  const client = useSuiClient();
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNFTCount = useCallback(async () => {
    if (
      playerAddresses.length === 0 ||
      !CONTRACT_PACKAGE_ID ||
      CONTRACT_PACKAGE_ID === "0x0"
    ) {
      setTotalNFTs(0);
      return;
    }

    setIsLoading(true);

    try {
      let count = 0;

      for (const address of playerAddresses) {
        const ownedObjects = await client.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${CONTRACT_PACKAGE_ID}::${CONTRACT_MODULE}::GameVictoryNFT`,
          },
        });
        count += ownedObjects.data.length;
      }

      setTotalNFTs(count);
    } catch (error) {
      console.error("Error fetching NFT count:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playerAddresses, client]);

  useEffect(() => {
    fetchNFTCount();
  }, [fetchNFTCount]);

  return { totalNFTs, isLoading };
};

export const useSignMessage = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const signMessage = async (message: string) => {
    if (!currentAccount) {
      throw new Error("No wallet connected");
    }

    // Note: For message signing on Sui, you typically use personal_sign
    // This is a placeholder - adjust based on your actual signing needs
    const messageBytes = new TextEncoder().encode(message);

    // In Sui, message signing is done differently
    // You may need to use a different approach based on OneWallet's capabilities
    console.log("Message to sign:", message);

    return {
      signature: "", // Placeholder
      message,
    };
  };

  return { signMessage };
};

export const useWalletConnection = () => {
  const currentAccount = useCurrentAccount();

  return {
    isConnected: !!currentAccount,
    address: currentAccount?.address,
    account: currentAccount,
  };
};
