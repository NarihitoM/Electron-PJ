import { Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";

function RestoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
    >
      <rect x="2.5" y="5.5" width="8" height="8" rx="1" />
      <rect x="5.5" y="2.5" width="8" height="8" rx="1" />
    </svg>
  );
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    (window as any).api
      ?.isMaximized()
      .then((m: boolean) => setMaximized(m))
      .catch(() => {});

    const cleanup = (window as any).api?.onMaximizedChanged?.((m: boolean) =>
      setMaximized(m),
    );
    return () => cleanup?.();
  }, []);

  return (
    <header
      className="flex h-10 shrink-0 items-center justify-between bg-[#1e1e2e] px-3 select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <span className="text-sm font-medium text-white/70 tracking-wide">MultimateAi</span>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={() => (window as any).api?.minimizeWindow()}
          className="flex h-7 w-7 items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Minimize"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => (window as any).api?.maximizeWindow()}
          className="flex h-7 w-7 items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? (
            <RestoreIcon className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => (window as any).api?.closeWindow()}
          className="flex h-7 w-7 items-center justify-center rounded text-white/60 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
