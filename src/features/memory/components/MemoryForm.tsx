import { Card, CardContent } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { memorystore } from "../store/store";
import { useAddMemory } from "../hooks/useAddMemory";

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
    <Card className="border-none bg-card shadow-none p-4">
      <CardContent className="p-0 space-y-3">
        <Textarea
          value={newMemoryContent}
          onChange={(e) => setNewMemoryContent(e.target.value)}
          placeholder="Add something for the AI to remember, e.g. 'I prefer concise answers.'"
          className="min-h-20"
        />
        <div className="flex justify-end">
          <Button
            onClick={addMemory}
            disabled={addMutation.isPending || !newMemoryContent.trim()}
            className="bg-cyan-500 dark:bg-white"
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
