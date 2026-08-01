import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientShimmer } from "gradient-shimmer";

const PHRASES = ["Thinking", "Searching", "Processing", "Generating", "Analyzing", "Working on it"];

interface ShimmerLoadingTextProps {
  phrases?: string[];
  interval?: number;
  className?: string;
}

export default function ShimmerLoadingText({
  phrases = PHRASES,
  interval = 2200,
  className = "",
}: ShimmerLoadingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <span className={`inline-flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2 }}
          className="inline-block font-medium"
        >
          <GradientShimmer gradient="tonic" className="text-muted-foreground">
            {phrases[index]}
          </GradientShimmer>
        </motion.span>
      </AnimatePresence>
      <span className="inline-flex overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            className="inline-block text-muted-foreground"
          >
            .
          </motion.span>
        ))}
      </span>
    </span>
  );
}
