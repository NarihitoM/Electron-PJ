import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { BarChart3, Coins, Activity, Clock } from "lucide-react"
import { formatNumber, formatCost, formatLatency } from "./usageHelpers"

export const SummaryCards = ({ s, loading }: { s: { totalTokens: number; totalInputTokens: number; totalOutputTokens: number; totalCost: number; totalRequests: number; avgLatency: number } | null | undefined; loading: boolean }) => {
    if (s && !loading) {
        return (
            <>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                            <CardDescription>All providers combined</CardDescription>
                        </div>
                        <CardAction><BarChart3 className="w-5 h-5 text-cyan-500 dark:text-white" /></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(s.totalTokens)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{formatNumber(s.totalInputTokens)} in / {formatNumber(s.totalOutputTokens)} out</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <CardDescription>Estimated spend</CardDescription>
                        </div>
                        <CardAction><Coins className="w-5 h-5 text-cyan-500 dark:text-white" /></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCost(s.totalCost)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Can Vary Depending On Providers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <CardDescription>LLM API calls</CardDescription>
                        </div>
                        <CardAction><Activity className="w-5 h-5 text-cyan-500 dark:text-white" /></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{s.totalRequests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                            <CardDescription>Response time</CardDescription>
                        </div>
                        <CardAction><Clock className="w-5 h-5 text-cyan-500 dark:text-white" /></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatLatency(s.avgLatency)}</div>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-16 rounded-lg" />
                    </CardContent>
                </Card>
            ))}
        </>
    );
};
