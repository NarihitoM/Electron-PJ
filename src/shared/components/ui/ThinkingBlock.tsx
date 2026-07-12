import { useState, useEffect } from "react"
import { Brain } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import { motion } from "framer-motion"

interface ThinkingBlockProps {
    thinking: string
    isStreaming?: boolean
}

export default function ThinkingBlock({ thinking, isStreaming }: ThinkingBlockProps) {
    const [open, setOpen] = useState(true)

    // Auto-collapse when streaming finishes
    useEffect(() => {
        if (!isStreaming && thinking) {
            const timer = setTimeout(() => setOpen(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isStreaming, thinking])

    if (!thinking) return null

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full mb-2">
            <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-muted/50 group w-full text-left">
                    <Brain size={14} className="shrink-0 text-purple-500" />
                    {isStreaming ? (
                        <motion.span
                            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{
                                backgroundImage: "linear-gradient(90deg, #a855f7 0%, #e9d5ff 50%, #a855f7 100%)",
                                backgroundSize: "200% 100%",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Thinking...
                        </motion.span>
                    ) : (
                        <span className="text-muted-foreground">Thinking</span>
                    )}
                    <svg
                        className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mt-1 ml-2 pl-4 border-l-2 border-purple-500/30 max-h-64 overflow-y-auto pr-2 scrollbar-thin" style={{ scrollbarWidth: "none" }}>
                    <p className="text-xs text-muted-foreground/80 whitespace-pre-wrap leading-relaxed">
                        {thinking}
                    </p>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
