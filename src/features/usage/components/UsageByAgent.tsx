import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { AGENT_COLORS, formatNumber, formatCost } from "./usageHelpers"

export const UsageByAgent = ({ agentData, loading }: { agentData: { name: string; tokens: number; cost: number }[]; loading: boolean }) => {
    return (
        <div className="mx-auto w-full max-w-5xl mt-4">
            <Card>
                <CardHeader>
                    {agentData.length > 0 && !loading ? <CardTitle className="text-base">Usage by Agent</CardTitle> : <Skeleton className="h-5 w-32" />}
                </CardHeader>
                <CardContent>
                    {agentData.length > 0 && !loading ? (
                        <div className="space-y-3">
                            {agentData.map((a, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-24 text-sm font-medium truncate">{a.name}</div>
                                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${Math.max((a.tokens / Math.max(...agentData.map((x) => x.tokens))) * 100, 2)}%`,
                                                backgroundColor: AGENT_COLORS[i % AGENT_COLORS.length],
                                            }}
                                        />
                                    </div>
                                    <div className="w-16 text-right text-sm text-muted-foreground">{formatNumber(a.tokens)}</div>
                                    <div className="w-16 text-right text-sm font-medium">{formatCost(a.cost)}</div>
                                </div>
                            ))}
                        </div>
                    ) : loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="flex-1 h-6 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-12 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
