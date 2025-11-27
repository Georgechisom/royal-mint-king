import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, X, Minus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSubmitAIGame } from "@/hooks/useOnechainContract";
import { getExplorerUrl } from "@/config/onechain";
import { v4 as uuidv4 } from "uuid";

interface GameResultModalProps {
  isOpen: boolean;
  result: "win" | "loss" | "draw" | null;
  onClose: () => void;
  playerSide: "white" | "black";
  gameId?: string;
}

const GameResultModal = ({
  isOpen,
  result,
  onClose,
  playerSide,
  gameId,
}: GameResultModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: submitAIGame, isPending } = useSubmitAIGame();

  const getResultInfo = () => {
    switch (result) {
      case "win":
        return {
          title: "🎉 Victory!",
          message: "Congratulations! You defeated NullShot AI!",
          color: "text-gold",
          bgColor: "bg-gold/20",
          borderColor: "border-gold",
        };
      case "loss":
        return {
          title: "💀 Defeat",
          message: "NullShot AI has defeated you. Better luck next time!",
          color: "text-red-500",
          bgColor: "bg-red-500/20",
          borderColor: "border-red-500",
        };
      case "draw":
        return {
          title: "🤝 Draw",
          message: "The game ended in a draw. Well played!",
          color: "text-blue-500",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-500",
        };
      default:
        return {
          title: "",
          message: "",
          color: "",
          bgColor: "",
          borderColor: "",
        };
    }
  };

  const handleSubmitResult = async () => {
    console.log("🎮 Starting game submission to OneChain...");
    console.log("Wallet connected:", !!currentAccount);
    console.log("Wallet address:", currentAccount?.address);

    if (!currentAccount) {
      toast.error("❌ Please connect your OneWallet first");
      console.error("Wallet not connected!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Preparing transaction on OneChain...");

    try {
      const finalGameId = gameId || uuidv4();

      // Determine winner and draw status
      let humanWon = false;
      let isDraw = false;

      if (result === "win") {
        humanWon = true;
        isDraw = false;
      } else if (result === "draw") {
        humanWon = false;
        isDraw = true;
      } else {
        // loss
        humanWon = false;
        isDraw = false;
      }

      console.log("📝 Game submission details:", {
        gameId: finalGameId,
        player: currentAccount.address,
        humanWon,
        isDraw,
        result,
      });

      toast.loading("Please approve the transaction in OneWallet...", {
        id: toastId,
      });

      // Submit to OneChain contract
      const txResult = await submitAIGame({
        gameId: finalGameId,
        humanWon,
        isDraw,
      });

      console.log("✅ Transaction submitted:", txResult);
      console.log("Transaction digest:", txResult.digest);

      if (!txResult.digest) {
        throw new Error(
          "Transaction digest not returned. Please check OneWallet and try again."
        );
      }

      // Show success with transaction hash
      const txDigest = txResult.digest;
      const explorerUrl = getExplorerUrl(txDigest);

      toast.success(
        `✅ Transaction submitted! Digest: ${txDigest.slice(0, 10)}...`,
        { id: toastId, duration: 8000 }
      );

      console.log("🔗 View on OneChain Explorer:", explorerUrl);

      // Show clickable link in a separate toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-card shadow-luxury rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gold`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Transaction Confirmed!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View on OneChain Block Explorer
                  </p>
                  <div className="mt-2">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-gold hover:text-gold/80 underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {explorerUrl.slice(0, 50)}...
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-border">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gold hover:text-gold/80"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 15000 }
      );

      // Wait a bit before redirecting
      setTimeout(() => {
        navigate("/leaderboard", { state: { refresh: true } });
      }, 3000);
    } catch (error: unknown) {
      console.error("❌ OneChain submission error:", error);

      let errorMessage =
        "Failed to submit result to OneChain. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else if (typeof error === "object" && error !== null) {
        const err = error as {
          message?: string;
          code?: string;
        };
        errorMessage = err.message || errorMessage;
        console.error("Error details:", err);
      }

      // Check for specific error types
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User denied")
      ) {
        errorMessage = "❌ Transaction rejected by user";
      } else if (
        errorMessage.includes("Insufficient") ||
        errorMessage.includes("insufficient")
      ) {
        errorMessage =
          "❌ Insufficient funds for gas. Get testnet tokens from faucet.";
      } else if (errorMessage.includes("No wallet connected")) {
        errorMessage = "❌ Please connect your OneWallet first";
      }

      toast.error(errorMessage, { id: toastId, duration: 8000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const info = getResultInfo();

  return (
    <AnimatePresence>
      {isOpen && result && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={`bg-card border-2 ${info.borderColor} rounded-2xl rounded-tl-none shadow-2xl max-w-md w-full p-8`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div
                className={`${info.bgColor} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}
              >
                {result === "win" && (
                  <Trophy className={`w-10 h-10 ${info.color}`} />
                )}
                {result === "loss" && (
                  <X className={`w-10 h-10 ${info.color}`} />
                )}
                {result === "draw" && (
                  <Minus className={`w-10 h-10 ${info.color}`} />
                )}
              </div>

              {/* Title */}
              <h2
                className={`text-xl md:text-3xl font-bold text-center mb-4 ${info.color}`}
              >
                {info.title}
              </h2>

              {/* Message */}
              <p className="text-center text-muted-foreground mb-6">
                {info.message}
              </p>

              {/* Player Info */}
              <div className="bg-background rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    You played as:
                  </span>
                  <span className="font-semibold capitalize">
                    {playerSide === "white" ? "♔ White" : "♚ Black"}
                  </span>
                </div>
                {currentAccount && (
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Your address:
                    </span>
                    <span className="font-mono text-xs">
                      {currentAccount.address.slice(0, 6)}...
                      {currentAccount.address.slice(-4)}
                    </span>
                  </div>
                )}
              </div>

              {/* OneChain Info Banner */}
              <div className="bg-gold/10 border border-gold rounded-lg p-3 mb-6">
                <p className="text-xs text-gold text-center">
                  🔗 This result will be recorded on OneChain Testnet
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting || isPending}
                >
                  Close
                </Button>
                <Button
                  onClick={handleSubmitResult}
                  className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
                  disabled={isSubmitting || isPending || !currentAccount}
                >
                  {isSubmitting || isPending
                    ? "Submitting..."
                    : !currentAccount
                    ? "Connect Wallet"
                    : "Submit to OneChain"}
                </Button>
              </div>

              {/* Wallet Connection Warning */}
              {!currentAccount && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Please connect your OneWallet to submit results
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GameResultModal;
