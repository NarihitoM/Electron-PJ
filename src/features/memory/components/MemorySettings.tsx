import { useState } from "react";
import { AlertTriangle, Brain, List, Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useMemories } from "../hooks/useMemories";
import { MemoryToggle } from "./MemoryToggle";
import { MemoryForm } from "./MemoryForm";
import { MemoryList } from "./MemoryList";
import { MemoryGlobe } from "./MemoryGlobe";

export const MemorySettings = () => {
  const { isLoading, isError, refetch } = useMemories();
  const [view, setView] = useState<"list" | "globe">("list");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 mt-4 mb-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center py-16">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load memories</h2>
        <p className="text-sm text-muted-foreground">
          There was a problem connecting to the server.
        </p>
        <Button onClick={() => refetch()} className="bg-cyan-500 dark:bg-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 mt-4 mb-6 space-y-4">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Brain className="w-6 h-6 text-cyan-500 dark:text-white" /> Memory
          </h1>
          <p className="text-muted-foreground">
            Facts and preferences the AI remembers across the Chatbot and integrated services.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 w-fit">
          <Button
            size="sm"
            variant={view === "list" ? "default" : "ghost"}
            className={view === "list" ? "bg-cyan-500 dark:bg-white rounded-lg" : "rounded-lg"}
            onClick={() => setView("list")}
          >
            <List className="w-4 h-4 mr-1" /> List
          </Button>
          <Button
            size="sm"
            variant={view === "globe" ? "default" : "ghost"}
            className={view === "globe" ? "bg-cyan-500 dark:bg-white rounded-lg" : "rounded-lg"}
            onClick={() => setView("globe")}
          >
            <Globe className="w-4 h-4 mr-1" /> Globe
          </Button>
        </div>
      </div>
      <MemoryToggle />
      <MemoryForm />
      {view === "list" ? <MemoryList /> : <MemoryGlobe />}
    </div>
  );
};
