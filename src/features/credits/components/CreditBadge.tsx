import { Coins } from "lucide-react";
import { useCreditBalance } from "../hooks/useCredits";

export const CreditBadge = () => {
  const { data, isLoading, isFetching } = useCreditBalance();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground animate-pulse">
        <Coins className="w-3.5 h-3.5" />
        <span>...</span>
      </div>
    );
  }

  const balance = data?.data?.credits ?? 0;

  let colorClass = "text-green-500";
  if (balance <= 10 && balance > 0) {
    colorClass = "text-yellow-500";
  } else if (balance <= 0) {
    colorClass = "text-red-500";
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colorClass} ${isFetching ? "opacity-70" : ""}`}
      title={`${balance} credits remaining`}
    >
      <Coins className="w-3.5 h-3.5" />
      <span>Credits Remaining: {balance}</span>
    </div>
  );
};
