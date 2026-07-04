import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../shared/components/ui/collapsible"
import { Button } from "../../../shared/components/ui/button"
import { ChevronDown, Sparkles } from "lucide-react"
import type { ToolCallSignal } from "../../../shared/types/globaltype"

interface SubagentCardProps {
    chain: ToolCallSignal
}

export const SubagentCard = ({ chain }: SubagentCardProps) => {
    if (chain.status === "loading") {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20 text-[11px] text-cyan-700 dark:text-cyan-300 animate-pulse w-fit">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-medium">{chain.name}</span>
            </div>
        )
    }

    return (
        <Collapsible className="w-full max-w-[95%] space-y-2">
            <CollapsibleTrigger asChild>
                <Button
                    className="group flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all hover:bg-zinc-50 active:scale-95 text-black dark:text-white border-zinc-100 dark:border-zinc-800 bg-white dark:bg-card shadow-sm"
                >
                    <Sparkles size={12} className="text-cyan-500" />
                    <span>{chain.name}</span>
                    <ChevronDown size={15} className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden max-w-[95%]">
                    {chain.input && (
                        <div className="border-b border-zinc-200 dark:border-zinc-800">
                            <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <Sparkles size={10} className="text-cyan-400" />
                                <span className="text-[9px] font-medium text-muted-foreground uppercase">Plan / Instruction</span>
                            </div>
                            <div className="p-3 overflow-x-auto scrollbar-hide">
                                <pre className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 whitespace-pre-wrap">{chain.input}</pre>
                            </div>
                        </div>
                    )}
                    {chain.output && (
                        <div className="flex-1 overflow-hidden">
                            <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <Sparkles size={10} className="text-emerald-400" />
                                <span className="text-[9px] font-medium text-muted-foreground uppercase">Response</span>
                            </div>
                            <div className="p-3 max-h-62.5 overflow-y-auto scrollbar-thin">
                                <pre className="text-[10px] font-mono text-green-700 dark:text-green-500 whitespace-pre-wrap">{chain.output}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
