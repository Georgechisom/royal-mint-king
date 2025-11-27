import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gamepad2, Trophy, Sparkles, Shield } from "lucide-react";
import ChessBoardPreview from "@/components/chess/ChessBoardPreview";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useMemo } from "react";
import {
  useTotalGamesStats,
  useTotalNFTCount,
} from "@/hooks/useOnechainContract";

const Index = () => {
  const { totalGamesPlayedByEveryone, events, isLoading, uniquePlayers } =
    useTotalGamesStats();
  const { totalNFTs, isLoading: nftsLoading } = useTotalNFTCount(uniquePlayers);

  // Calculate unique players count
  const uniquePlayersCount = useMemo(() => {
    return uniquePlayers.length;
  }, [uniquePlayers]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-muted/30" />

        <div className="md:container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center justify-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gold">Decentralized</span> Chess
                <br />
                <span className="text-accent">On-Chain</span> Glory
              </h1>

              <p className="text-base md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Play immersive chess against humans or NullShot AI. Every
                victory is immortalized on OneChain with NFT badges. Fair play
                guaranteed through cryptographic signatures.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-luxury"
                >
                  <Link to="/arena">
                    <Gamepad2 className="mr-2" />
                    Enter Arena
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <Link to="/how-to-play">Learn Rules</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 items-center justify-center gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">
                    {isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      totalGamesPlayedByEveryone
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Games Played
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {nftsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      totalNFTs
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    NFTs Minted
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sapphire">
                    {isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      uniquePlayersCount
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
              </div>

              {/* OneChain Badge */}
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 bg-gold/10 border border-gold px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-gold">
                    Powered by OneChain
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: 3D Chess Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[600px] rounded-2xl overflow-hidden md:border md:border-border md:shadow-luxury hover:shadow-luxury"
            >
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 8, 8]} />
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={0.5}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 2.5}
                />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight
                  position={[-10, 10, -5]}
                  intensity={0.5}
                  color="#50C878"
                />
                <ChessBoardPreview />
              </Canvas>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted">
        <div className="md:container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-center mb-16 text-nowrap"
          >
            Why <span className="text-accent">Royal Mint King Chess</span>?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-gold" />,
                title: "3D Immersive Play",
                description:
                  "Hyper-realistic chess pieces, dynamic lighting, and multiple luxurious themes",
              },
              {
                icon: <Shield className="w-8 h-8 text-accent" />,
                title: "OneChain Verified",
                description:
                  "Cryptographic signatures ensure fair play. Results stored on OneChain blockchain",
              },
              {
                icon: <Trophy className="w-8 h-8 text-gold" />,
                title: "NFT Rewards",
                description:
                  "Mint NFT badges for every victory. Build your collection of wins on-chain",
              },
              {
                icon: <Gamepad2 className="w-8 h-8 text-sapphire" />,
                title: "AI Opponent",
                description:
                  "Challenge NullShot AI agent powered by MCP for strategic gameplay",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-xl border border-border shadow-luxury card-3d"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl text-nowrap font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OneChain Info Section */}
      <section className="py-20 px-6 bg-background">
        <div className="md:container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-gold/20 to-accent/20 border-2 border-gold/50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-gold-foreground" />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">
                Built on <span className="text-gold">OneChain</span>
              </h3>

              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                OneChain is a Sui-compatible consortium blockchain designed for
                enterprises. Royal Mint King Chess leverages OneChain's speed
                and security to provide instant, verifiable game results stored
                permanently on-chain.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gold mb-1">
                    &lt;1s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Transaction Speed
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    Sui Compatible
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Move Smart Contracts
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-sapphire mb-1">
                    Testnet
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Free to Play
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="md:container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-card p-12 rounded-2xl border border-border shadow-luxury"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-6">
              Ready to Claim <span className="text-gold">Victory</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your OneWallet, choose your strategy, and let OneChain
              remember your triumphs forever.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-emerald"
            >
              <Link to="/arena">Start Playing Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
