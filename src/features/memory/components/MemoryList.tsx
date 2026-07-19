import { Card, CardContent } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Check, Pencil, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { memorystore } from "../store/store";
import { useMemories } from "../hooks/useMemories";
import { useUpdateMemory } from "../hooks/useUpdateMemory";
import { useDeleteMemory } from "../hooks/useDeleteMemory";

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
      <p className="text-sm text-muted-foreground text-center py-8">
        No memories yet. Add one above, or have a conversation and let the AI remember for you.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <Card key={memory.id} className="border-none bg-card shadow-none p-4">
          <CardContent className="p-0">
            {editingId === memory.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="min-h-16"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={resetEditing}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={updateMutation.isPending || !editingContent.trim()}
                    onClick={() => saveEdit(memory.id)}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    {updateMutation.isPending ? <Spinner /> : <Check className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap break-words">{memory.content}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      memory.source === "auto"
                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {memory.source === "auto" ? "Auto" : "Manual"}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(memory.id, memory.content)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
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
