import { useState } from "react";
import { AlertTriangle, Brain, List, Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
      <div className="mx-auto max-w-5xl px-4 mt-4 mb-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 w-fit">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>

        {/* MemoryToggle card */}
        <div className="border border-cyan-500/15 bg-linear-to-r from-cyan-500/5 to-transparent shadow-none p-5 rounded-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-96 max-w-full" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-6 w-10 rounded-full shrink-0" />
          </div>
        </div>

        {/* MemoryForm card */}
        <div className="border-none bg-card shadow-none p-5 rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* MemoryList */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-transparent bg-card shadow-none p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
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
