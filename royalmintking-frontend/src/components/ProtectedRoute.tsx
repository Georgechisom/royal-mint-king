import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentAccount) {
      toast.error("❌ Please connect your OneWallet first");
      console.error("Wallet not connected!");
      return;
    }
  }, [currentAccount, navigate]);

  if (!currentAccount) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
