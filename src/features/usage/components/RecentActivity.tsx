import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { BRAND_ASSETS } from "@/shared/config/providermodels"
import { PROVIDER_LABELS, AGENT_LABELS, formatNumber, formatCost, formatLatency } from "./usageHelpers"
import type { UsageRecent } from "@/features/usage/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const recentLimit = 20;

export const RecentActivity = ({
    recent,
    loading,
    pageLoading,
    recentPage,
    recentTotal,
    onPageChange,
}: {
    recent: UsageRecent[];
    loading: boolean;
    pageLoading: boolean;
    recentPage: number;
    recentTotal: number;
    onPageChange: (page: number) => void;
}) => {
    const totalPages = Math.ceil(recentTotal / recentLimit);

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (recentPage > 3) pages.push("...");
            for (let i = Math.max(2, recentPage - 1); i <= Math.min(totalPages - 1, recentPage + 1); i++) {
                pages.push(i);
            }
            if (recentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="mx-auto w-full max-w-5xl mt-4 mb-6">
            <Card>
                <CardHeader>
                    {!loading ? <CardTitle className="text-base">Recent Activity</CardTitle> : <Skeleton className="h-5 w-36" />}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[350px] w-full rounded-lg" />
                    ) : recent.length > 0 || pageLoading ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Agent</TableHead>
                                        <TableHead className="text-right">Tokens</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Latency</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageLoading
                                        ? Array.from({ length: recentLimit }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                            </TableRow>
                                        ))
                                        : recent.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {BRAND_ASSETS[r.provider] && <img src={BRAND_ASSETS[r.provider]} className="w-4 h-4 rounded bg-white" />}
                                                        <span className="text-sm">{PROVIDER_LABELS[r.provider] || r.provider}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">{r.model.length > 20 ? r.model.slice(0, 20) + "..." : r.model}</TableCell>
                                                <TableCell><Badge variant="outline" className="text-xs">{AGENT_LABELS[r.agent] || r.agent}</Badge></TableCell>
                                                <TableCell className="text-right text-sm">{formatNumber(r.inputTokens + r.outputTokens)}</TableCell>
                                                <TableCell className="text-right text-sm font-medium">{formatCost(r.cost)}</TableCell>
                                                <TableCell className="text-right text-sm">{formatLatency(r.latencyMs)}</TableCell>
                                                <TableCell>
                                                    {r.success ? (
                                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">OK</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-xs">Fail</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {(recentPage - 1) * recentLimit + 1}–{Math.min(recentPage * recentLimit, recentTotal)} of {recentTotal}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="outline" onClick={() => onPageChange(Math.max(1, recentPage - 1))} disabled={recentPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {getPageNumbers().map((p, i) =>
                                            p === "..." ? (
                                                <span key={`dots-${i}`} className="px-2 text-muted-foreground text-sm">...</span>
                                            ) : (
                                                <Button
                                                    key={p}
                                                    size="icon"
                                                    variant={recentPage === p ? "default" : "outline"}
                                                    className={recentPage === p ? "bg-cyan-500 text-white dark:bg-white dark:text-black" : ""}
                                                    onClick={() => onPageChange(p as number)}
                                                >
                                                    {p}
                                                </Button>
                                            )
                                        )}
                                        <Button size="icon" variant="outline" onClick={() => onPageChange(Math.min(totalPages, recentPage + 1))} disabled={recentPage === totalPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-12 flex items-center justify-center text-muted-foreground text-sm">No recent activity</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
