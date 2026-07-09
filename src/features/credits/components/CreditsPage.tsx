import { Coins, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { useCreditBalance, useCreditHistory } from "../hooks/useCredits";
import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Spinner } from "../../../shared/components/ui/spinner";

export const CreditsPage = () => {
  const { data: balanceData, isLoading: balanceLoading } = useCreditBalance();
  const [page, setPage] = useState(1);
  const { data: historyData, isLoading: historyLoading } = useCreditHistory(page);

  const balance = balanceData?.data?.credits ?? 0;
  const transactions = historyData?.transactions ?? [];
  const pagination = historyData?.pagination;

  let balanceColor = "text-green-500";
  if (balance <= 10 && balance > 0) {
    balanceColor = "text-yellow-500";
  } else if (balance <= 0) {
    balanceColor = "text-red-500";
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-500" />
            Credits
          </CardTitle>
          <CardDescription>
            Your free credits for using MultimateAi. Credits reset monthly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-5 w-5" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${balanceColor}`}>
                {balance}
              </span>
              <span className="text-muted-foreground">credits remaining</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How credits work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            You receive <strong>50 free credits</strong> every month that reset
            automatically. Each AI request costs <strong>1 credit</strong> when
            using the free tier.
          </p>
          <p>
            If you add your own API key in{" "}
            <strong>Service Settings</strong>, you can bypass credits entirely
            and use your own billing.
          </p>
          <p>
            Running out of credits? Add an API key or check back next month for
            a fresh batch.
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === "grant" || tx.type === "purchase" ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        tx.amount > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {tx.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
