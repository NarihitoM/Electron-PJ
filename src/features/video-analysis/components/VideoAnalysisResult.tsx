import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Sparkles, TimerReset, Text, AlertTriangle } from "lucide-react";
import DOMPurify from "dompurify";

interface TimestampSegment {
    id: string | number;
    start: number;
    end: number;
    text: string;
}

interface SummaryData {
    title: string;
    summary: string;
    category?: string;
}

interface VideoAnalysisResultProps {
    summary: SummaryData | null;
    timestamps: TimestampSegment[];
    isPending: boolean;
    loadingupload: boolean;
    analysisError: boolean;
    onRetry: () => void;
}

export const VideoAnalysisResult = ({
    summary,
    timestamps,
    isPending,
    loadingupload,
    analysisError,
    onRetry,
}: VideoAnalysisResultProps) => {
    if (summary || timestamps.length > 0) {
        return (
            <>
                <div className="flex-1 flex flex-col min-h-1/2">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-1">
                        <Sparkles /> Ai Summary
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                        {summary && (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-lg font-bold pl-4 tracking-tight truncate">
                                        {summary.title}
                                    </h2>
                                    {summary.category && (
                                        <span className="uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 tracking-wider shrink-0">
                                            {summary.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm pl-4 text-zinc-400 leading-relaxed">
                                    {(() => {
                                        const clean = DOMPurify.sanitize(summary.summary);
                                        return <div dangerouslySetInnerHTML={{ __html: clean }} />
                                    })()}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <Separator />
                <div className="flex-1 flex flex-col min-h-1/2">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-1">
                        <TimerReset /> Transcript
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 pb-10 flex flex-col gap-2">
                        {timestamps.length > 0 && (
                            timestamps.map((segment) => (
                                <div
                                    key={segment.id}
                                    onClick={() => {
                                        const videoElement = document.querySelector("video");
                                        if (videoElement) {
                                            videoElement.currentTime = segment.start;
                                            videoElement.pause();
                                        }
                                    }}
                                    className="flex items-start gap-4 border p-2.5 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-all duration-200"
                                >
                                    <span className="font-mono text-xs bg-cyan-500/10 border border-cyan-500/10 text-cyan-500 font-bold px-2 py-1 rounded shrink-0">
                                        [{segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s]
                                    </span>
                                    <p className="text-sm leading-relaxed transition-colors pt-0.5">
                                        {segment.text}
                                    </p>
                                </div>
                            )))}
                    </div>
                </div>
            </>
        );
    }

    if (isPending || loadingupload) {
        return (
            <>
                {[1, 2, 3, 4].map((element) => (
                    <div key={element} className="flex flex-col gap-4 pl-4 animate-pulse">
                        <div className="flex items-center justify-between gap-4 w-full">
                            <Skeleton className="h-6 rounded-md w-3/4" />
                            <Skeleton className="h-4 rounded w-12 shrink-0" />
                        </div>
                        <div className="space-y-2 mt-1">
                            <Skeleton className="h-4 rounded-md w-full" />
                            <Skeleton className="h-4 rounded-md w-[95%]" />
                            <Skeleton className="h-4 rounded-md w-[85%]" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (analysisError) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h1 className="text-xl font-semibold">Failed To Analyze</h1>
                <p className="text-sm text-muted-foreground">An error occurred during video analysis.</p>
                <Button onClick={onRetry} className="bg-cyan-500 dark:bg-white mt-2">Retry</Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-1">
            <Text className="w-5 h-5 text-cyan-500 dark:text-white" />
            <h1 className="text-xl font-semibold">No Analysis Data Found</h1>
            <p className="text-[11px] text-muted-foreground">Generate the video to transcript and summarize.</p>
        </div>
    );
};
