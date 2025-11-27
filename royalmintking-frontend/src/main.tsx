import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import "./index.css";
import "@mysten/dapp-kit/dist/index.css";
import { ONECHAIN_CONFIG } from "./config/onechain.ts";

// OneChain network configuration for Sui SDK
const networks = {
  "onechain-testnet": {
    url: ONECHAIN_CONFIG.testnet.rpc,
  },
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="onechain-testnet">
      <WalletProvider autoConnect>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#fff",
              border: "1px solid #D4AF37",
            },
            success: {
              duration: 5000,
              iconTheme: {
                primary: "#D4AF37",
                secondary: "#1A1A1A",
              },
            },
            error: {
              duration: 7000,
            },
          }}
        />
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);
