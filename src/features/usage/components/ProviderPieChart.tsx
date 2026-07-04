import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { useUsageStats } from "../hooks/useUsageStats"
import { PROVIDER_LABELS, AGENT_COLORS } from "./usageHelpers"

const pieChartConfig = { tokens: { label: "Tokens" } } satisfies ChartConfig;

export const ProviderPieChart = () => {
    const { data: stats, isLoading } = useUsageStats()

    const pieData = stats?.byProvider.map((p, i) => ({
        name: PROVIDER_LABELS[p.provider] || p.provider,
        value: p.tokens,
        fill: AGENT_COLORS[i % AGENT_COLORS.length],
    })) ?? []

    const loading = isLoading

    return (
        <Card>
            <CardHeader>
                {pieData.length > 0 && !loading ? <CardTitle className="text-base">By Provider</CardTitle> : <Skeleton className="h-5 w-24" />}
            </CardHeader>
            <CardContent>
                {pieData.length > 0 && !loading ? (
                    <>
                        <ChartContainer config={pieChartConfig} className="h-[200px] w-full">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={2}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ChartContainer>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {pieData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </>
                ) : loading ? (
                    <>
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-4 w-16 rounded-full" />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                )}
            </CardContent>
        </Card>
    );
};
