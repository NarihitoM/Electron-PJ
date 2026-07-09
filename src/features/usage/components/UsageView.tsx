import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { usagestore } from "../store/store";
import { useUsageStats } from "../hooks/useUsageStats";
import { useCreditBalance, useCreditHistory } from "../../credits/hooks/useCredits";
import { BarChart3, Coins, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SummaryCards } from "./SummaryCards";
import { TokenUsageChart } from "./TokenUsageChart";
import { ProviderPieChart } from "./ProviderPieChart";
import { UsageByAgent } from "./UsageByAgent";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { useState } from "react";

const CreditsSection = () => {
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
        <div className="mx-auto w-full max-w-5xl mt-6 space-y-4">
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

            {/* Info + History in 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
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

                <Card className="lg:col-span-2">
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
        </div>
    );
};

export const UsageView = () => {
    const { period, setPeriod, selectedYear, setSelectedYear } = usagestore();
    const { data: stats, isFetching, isError, refetch } = useUsageStats();

    if (isError && !stats) {
        return (
            <div className="flex h-[92vh] w-full flex-col bg-background">
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col gap-3 justify-center items-center">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <h1 className="text-2xl font-semibold">Fail To Load Usage Data</h1>
                        <p className="text-sm text-muted-foreground">There was a problem connecting to the server.</p>
                        <Button onClick={() => refetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[92vh] w-full flex-col bg-background">
            <div className="mx-auto w-full max-w-5xl flex justify-between items-center gap-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-7 h-7 text-cyan-500 dark:text-white" />Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Track token usage, costs, and performance across all ai providers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {stats?.availableYears && Array.from({ length: stats.availableYears.max - stats.availableYears.min + 1 }, (_, i) => stats.availableYears.min + i).map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="icon" variant="outline" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as "day" | "week" | "month" | "year")}>
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="year">Year</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
            <div className="mx-auto w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 mt-4 gap-2">
                <SummaryCards />
            </div>
            <div className="mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 mt-4 gap-3">
                <TokenUsageChart />
                <ProviderPieChart />
            </div>
            <UsageByAgent />
            <RecentActivity />
            <CreditsSection />
        </div>
    );
};
