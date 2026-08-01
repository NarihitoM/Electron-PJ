import { motion } from "framer-motion";
import { GradientShimmer } from "gradient-shimmer";

interface ShimmerLoadingTextProps {
  phrases?: string[];
  className?: string;
}

export default function ShimmerLoadingText({
  phrases = ["Thinking"],
  className = "",
}: ShimmerLoadingTextProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <span className="inline-block font-medium">
        <GradientShimmer
          gradient={[
            { color: "#06b6d4", position: 0 },
            { color: "#ffffff", position: 1 },
          ]}
          className="text-muted-foreground"
        >
          {phrases[0]}
        </GradientShimmer>
      </span>
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
