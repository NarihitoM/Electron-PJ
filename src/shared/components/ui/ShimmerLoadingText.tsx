import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const PHRASES = [
    "Thinking",
    "Searching",
    "Processing",
    "Generating",
    "Analyzing",
    "Working on it",
]

interface ShimmerLoadingTextProps {
    phrases?: string[]
    interval?: number
    className?: string
}

export default function ShimmerLoadingText({
    phrases = PHRASES,
    interval = 2200,
    className = "",
}: ShimmerLoadingTextProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length)
        }, interval)
        return () => clearInterval(timer)
    }, [phrases.length, interval])

    return (
        <span className={`inline-flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block"
                >
                    {phrases[index]}
                </motion.span>
            </AnimatePresence>
            <span className="inline-flex w-8 overflow-hidden">
                <motion.span
                    animate={{ x: ["0%", "120%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-block text-muted-foreground"
                >
                    ...
                </motion.span>
            </span>
        </span>
    )
}
