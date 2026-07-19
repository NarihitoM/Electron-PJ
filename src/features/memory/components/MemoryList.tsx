import { Card, CardContent } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Bot, Brain, Check, Pencil, Trash, User, X } from "lucide-react";
import { toast } from "sonner";
import { memorystore } from "../store/store";
import { useMemories } from "../hooks/useMemories";
import { useUpdateMemory } from "../hooks/useUpdateMemory";
import { useDeleteMemory } from "../hooks/useDeleteMemory";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const MemoryList = () => {
  const { data: memories = [] } = useMemories();
  const editingId = memorystore((s) => s.editingId);
  const editingContent = memorystore((s) => s.editingContent);
  const setEditingId = memorystore((s) => s.setEditingId);
  const setEditingContent = memorystore((s) => s.setEditingContent);
  const resetEditing = memorystore((s) => s.resetEditing);

  const updateMutation = useUpdateMemory();
  const deleteMutation = useDeleteMemory();

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  };

  const saveEdit = async (id: string) => {
    if (!editingContent.trim()) return;
    try {
      const response = await updateMutation.mutateAsync({ id, content: editingContent.trim() });
      if (response.success) {
        toast.success(response.message);
        resetEditing();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const response = await deleteMutation.mutateAsync(id);
      if (response.success) {
        toast.success(response.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="p-3 rounded-full bg-cyan-500/10">
          <Brain className="w-7 h-7 text-cyan-500 dark:text-white" />
        </div>
        <p className="font-semibold">No memories yet</p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Add one above, or just keep chatting — the AI will remember the important things for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Saved memories
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {memories.length} {memories.length === 1 ? "memory" : "memories"}
        </span>
      </div>
      {memories.map((memory) => (
        <Card
          key={memory.id}
          className="group border border-transparent bg-card shadow-none p-4 rounded-2xl transition-colors hover:border-zinc-200 dark:hover:border-zinc-800 animate-in fade-in slide-in-from-bottom-1"
        >
          <CardContent className="p-0">
            {editingId === memory.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="min-h-16 rounded-xl"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={resetEditing}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={updateMutation.isPending || !editingContent.trim()}
                    onClick={() => saveEdit(memory.id)}
                    className="bg-cyan-500 dark:bg-white rounded-lg"
                  >
                    {updateMutation.isPending ? <Spinner /> : <Check className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg h-fit shrink-0 mt-0.5 ${
                    memory.source === "auto" ? "bg-cyan-500/10" : "bg-zinc-100 dark:bg-zinc-800/80"
                  }`}
                >
                  {memory.source === "auto" ? (
                    <Bot className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  ) : (
                    <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {memory.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        memory.source === "auto"
                          ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {memory.source === "auto" ? "Auto" : "Manual"}
                    </span>
                    {formatDate(memory.createdAt) && (
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(memory.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    title="Edit memory"
                    onClick={() => startEdit(memory.id, memory.content)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    title="Delete memory"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMemory(memory.id)}
                  >
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
