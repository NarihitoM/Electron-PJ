import { Card, CardContent } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Spinner } from "@/shared/components/ui/spinner";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { useMemoryStatus } from "../hooks/useMemoryStatus";
import { useToggleMemory } from "../hooks/useToggleMemory";

export const MemoryToggle = () => {
  const { data: enabled, isLoading } = useMemoryStatus();
  const toggleMutation = useToggleMemory();

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await toggleMutation.mutateAsync(checked);
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

  return (
    <Card className="border-none bg-card shadow-none p-4">
      <CardContent className="p-0 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 dark:bg-white rounded-lg h-fit">
            <Brain className="h-5 w-5 text-cyan-500 dark:text-black" />
          </div>
          <div>
            <p className="font-semibold">Remember conversations</p>
            <p className="text-sm text-muted-foreground">
              Let the AI automatically remember facts and preferences from your conversations, and
              use them across the Chatbot and integrated services.
            </p>
          </div>
        </div>
        {isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <Switch
            checked={enabled ?? true}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};
