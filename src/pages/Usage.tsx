import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { usagestore } from "@/features/usage/store/store";
import { useUsageStats } from "@/features/usage/hooks/useUsageStats";
import { BarChart3, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SummaryCards } from "@/features/usage/components/SummaryCards";
import { TokenUsageChart } from "@/features/usage/components/TokenUsageChart";
import { ProviderPieChart } from "@/features/usage/components/ProviderPieChart";
import { UsageByAgent } from "@/features/usage/components/UsageByAgent";
import { RecentActivity } from "@/features/usage/components/RecentActivity";
import { PROVIDER_LABELS, AGENT_LABELS, AGENT_COLORS } from "@/features/usage/components/usageHelpers";

export const Usage = () => {
    const { period, setPeriod, selectedYear, setSelectedYear, recentPage, setRecentPage } = usagestore();
    const { data: stats, isLoading, isFetching, isError, refetch } = useUsageStats();

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

    const pieData = stats?.byProvider.map((p) => ({
        name: PROVIDER_LABELS[p.provider] || p.provider,
        value: p.tokens,
        fill: AGENT_COLORS[stats.byProvider.indexOf(p) % AGENT_COLORS.length],
    })) ?? [];

    const agentData = stats?.byAgent.map((a) => ({
        name: AGENT_LABELS[a.agent] || a.agent,
        tokens: a.tokens,
        cost: a.cost,
    })) ?? [];

    const loading = isLoading || (!stats && isFetching);

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
                <SummaryCards s={stats?.summary} loading={loading} />
            </div>
            <div className="mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 mt-4 gap-3">
                <TokenUsageChart data={stats?.byTime} loading={loading} period={period} />
                <ProviderPieChart pieData={pieData} loading={loading} />
            </div>
            <UsageByAgent agentData={agentData} loading={loading} />
            <RecentActivity
                recent={stats?.recent ?? []}
                loading={loading}
                pageLoading={isFetching && !isLoading}
                recentPage={recentPage}
                recentTotal={stats?.recentTotal ?? 0}
                onPageChange={setRecentPage}
            />
        </div>
    );
};
