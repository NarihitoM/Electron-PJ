import { Card, CardContent } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Label } from "@/shared/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { memorystore } from "../store/store";
import { useAddMemory } from "../hooks/useAddMemory";

const MAX_LENGTH = 2000;

export const MemoryForm = () => {
  const newMemoryContent = memorystore((s) => s.newMemoryContent);
  const setNewMemoryContent = memorystore((s) => s.setNewMemoryContent);
  const addMutation = useAddMemory();

  const addMemory = async () => {
    if (!newMemoryContent.trim()) return;
    try {
      const response = await addMutation.mutateAsync(newMemoryContent.trim());
      if (response.success) {
        toast.success(response.message);
        setNewMemoryContent("");
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

  return (
    <Card className="border-none bg-card shadow-none p-5 rounded-2xl">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Add a memory
          </Label>
          <span
            className={`text-[11px] tabular-nums ${
              newMemoryContent.length > MAX_LENGTH ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {newMemoryContent.length}/{MAX_LENGTH}
          </span>
        </div>
        <Textarea
          value={newMemoryContent}
          onChange={(e) => setNewMemoryContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              addMemory();
            }
          }}
          placeholder="Add something for the AI to remember, e.g. 'I prefer concise answers.'"
          className="min-h-20 rounded-xl"
          maxLength={MAX_LENGTH}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl</kbd> +{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to
            save
          </p>
          <Button
            onClick={addMemory}
            disabled={addMutation.isPending || !newMemoryContent.trim()}
            className="bg-cyan-500 dark:bg-white rounded-xl px-6 font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
          >
            {addMutation.isPending ? (
              <Spinner />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Memory
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
