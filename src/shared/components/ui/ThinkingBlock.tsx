import { useState } from "react"
import { Brain, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import { Button } from "@/shared/components/ui/button"
import { motion } from "framer-motion"

interface ThinkingBlockProps {
    thinking: string
    isStreaming?: boolean
}

export default function ThinkingBlock({ thinking, isStreaming }: ThinkingBlockProps) {
    const [open, setOpen] = useState(false)

    if (!thinking) return null

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full mb-2">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 text-muted-foreground">
                    <Brain size={14} className="shrink-0 text-cyan-500" />
                    {isStreaming ? (
                        <motion.span
                            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{
                                backgroundImage: "linear-gradient(90deg, #06b6d4 0%, #a5f3fc 50%, #06b6d4 100%)",
                                backgroundSize: "200% 100%",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Thinking...
                        </motion.span>
                    ) : (
                        <span>Thinking</span>
                    )}
                    <ChevronDown size={15} className="ml-1 text-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200 w-full">
                <div className="mt-1 flex flex-col rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm">
                    <div className="px-3 py-1.5 flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                        <Brain size={10} className="text-cyan-400" />
                        <span className="text-[9px] font-medium text-muted-foreground uppercase">Thinking</span>
                    </div>
                    <div className="p-3 max-h-64 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: "none" }}>
                        <pre className={`text-[10px] font-mono whitespace-pre-wrap ${isStreaming ? "text-foreground" : "text-muted-foreground"}`}>
                            {thinking}
                        </pre>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
