import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";
import {
  useWalletConnection,
  useTotalGamesStats,
  useGetPlayerStats,
  useTotalNFTCount,
} from "@/hooks/useOnechainContract";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

interface LeaderboardPlayer {
  address: string;
  wins: number;
  losses: number;
  draws: number;
  nfts: number;
  rank: number;
}

const Leaderboard = () => {
  const { address, isConnected } = useWalletConnection();
  const location = useLocation();
  const [leaders, setLeaders] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    totalGamesPlayedByEveryone,
    events,
    uniquePlayers,
    isLoading: eventsLoading,
    error: eventsError,
    refetchEvents,
  } = useTotalGamesStats();
  const {
    stats: playerStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchPlayerStats,
  } = useGetPlayerStats(address);
  const { totalNFTs, isLoading: nftsLoading } = useTotalNFTCount(uniquePlayers);

  // Calculate leaderboard from events
  const calculateLeaderboard = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }

    // Build stats per player
    const playerStatsMap = new Map<
      string,
      { wins: number; losses: number; draws: number }
    >();

    events.forEach((event: any) => {
      const parsedData = event.parsedJson;
      const player1 = parsedData.player1;
      const player2 = parsedData.player2;
      const winner = parsedData.winner;
      const isDraw = parsedData.is_draw;

      // Initialize players if needed
      if (player1 && player1 !== "0x0") {
        if (!playerStatsMap.has(player1)) {
          playerStatsMap.set(player1, { wins: 0, losses: 0, draws: 0 });
        }
      }
      if (player2 && player2 !== "0x0") {
        if (!playerStatsMap.has(player2)) {
          playerStatsMap.set(player2, { wins: 0, losses: 0, draws: 0 });
        }
      }

      // Update stats
      if (isDraw) {
        if (player1 && player1 !== "0x0") {
          playerStatsMap.get(player1)!.draws++;
        }
        if (player2 && player2 !== "0x0") {
          playerStatsMap.get(player2)!.draws++;
        }
      } else {
        if (winner && winner !== "0x0") {
          playerStatsMap.get(winner)!.wins++;

          // Determine loser
          const loser = winner === player1 ? player2 : player1;
          if (loser && loser !== "0x0") {
            playerStatsMap.get(loser)!.losses++;
          }
        }
      }
    });

    // Convert to array and sort by wins
    const leaderboardData: LeaderboardPlayer[] = Array.from(
      playerStatsMap.entries()
    ).map(([addr, stats]) => ({
      address: addr,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      nfts: 0, // Will be updated separately
      rank: 0, // Will be set after sorting
    }));

    return leaderboardData
      .sort((a, b) => b.wins - a.wins)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [events]);

  useEffect(() => {
    setLeaders(calculateLeaderboard);
  }, [calculateLeaderboard]);

  // Manual refresh function
  const handleRefresh = async () => {
    const loadingToast = toast.loading("Refreshing data from blockchain...");

    try {
      await Promise.all([refetchEvents(), refetchPlayerStats()]);

      toast.success("Data refreshed successfully!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to refresh data", { id: loadingToast });
    }
  };

  // Listen for refresh trigger from navigation state
  useEffect(() => {
    if (location.state?.refresh) {
      handleRefresh();
      // Clear the state to prevent refresh on subsequent visits
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-gold" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-20 px-6">
        <div className="md:container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-3xl md:text-5xl font-bold">
                <span className="text-gold">Leaderboard</span>
              </h1>
              <Button
                onClick={handleRefresh}
                disabled={isLoading || eventsLoading}
                variant="outline"
                size="icon"
                className="border-gold text-gold hover:bg-gold/10"
                title="Refresh data from blockchain"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    isLoading || eventsLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
            <p className="text-base md:text-xl text-muted-foreground">
              Top players ranked by victories on Sui blockchain
            </p>
          </motion.div>

          {/* Player Stats Card (if connected) */}
          {isConnected && playerStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gold/20 to-accent/20 p-8 rounded-2xl border-2 border-gold/50 mb-12"
            >
              <div className="flex flex-col md:flex-row gap-x-5 md:gap-1 justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-5 md:mb-2">
                    Your Stats
                  </h2>
                  <p className="hidden md:flex text-sm text-muted-foreground font-mono mb-5 md:mb-2">
                    {address}
                  </p>
                  <p className="flex md:hidden lg:hidden text-sm text-muted-foreground font-mono mb-5 md:mb-2">
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {playerStats.wins}
                  </div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground">
                    {playerStats.losses}
                  </div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sapphire">
                    {playerStats.draws}
                  </div>
                  <div className="text-xs text-muted-foreground">Draws</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {playerStats.gamesPlayed}
                  </div>
                  <div className="text-xs text-muted-foreground">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">
                    {playerStats.nftBalance}
                  </div>
                  <div className="text-xs text-muted-foreground">NFTs</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-4xl font-bold text-gold mb-2">
                {totalGamesPlayedByEveryone}
              </div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {totalNFTs}
              </div>
              <div className="text-sm text-muted-foreground">NFTs Minted</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-4xl font-bold text-sapphire mb-2">
                {leaders.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Players
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-luxury overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Player
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Wins
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Losses
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Draws
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Win Rate
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      NFTs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        {eventsLoading
                          ? "Loading leaderboard data..."
                          : "No games played yet. Be the first to play!"}
                      </td>
                    </tr>
                  ) : (
                    leaders.map((leader, index) => {
                      const total = leader.wins + leader.losses;
                      const winRate =
                        total > 0
                          ? ((leader.wins / total) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <motion.tr
                          key={leader.address}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="border-t border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getRankIcon(leader.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm">
                              {leader.address.slice(0, 10)}...
                              {leader.address.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-accent">
                              {leader.wins}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-muted-foreground">
                              {leader.losses}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sapphire">
                              {leader.draws}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`font-semibold ${
                                parseFloat(winRate) > 60
                                  ? "text-accent"
                                  : "text-foreground"
                              }`}
                            >
                              {winRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-semibold">
                              <Trophy className="w-3 h-3" />
                              {leader.nfts}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-sm md:text-base text-muted-foreground"
          >
            <p>
              Leaderboard updates in real time as games are submitted on-chain.
            </p>
            <p className="mt-2">
              Data fetched from{" "}
              <span className="text-accent font-mono">Sui Move contract</span>{" "}
              on OneChain testnet.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
