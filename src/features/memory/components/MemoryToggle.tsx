import { Card, CardContent } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Spinner } from "@/shared/components/ui/spinner";
import { Sparkles } from "lucide-react";
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

  const isOn = enabled ?? true;

  return (
    <Card className="border border-cyan-500/15 bg-linear-to-r from-cyan-500/5 to-transparent shadow-none p-5 rounded-2xl">
      <CardContent className="p-0 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 h-fit shrink-0">
            <Sparkles className="h-5 w-5 text-cyan-500 dark:text-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold">Remember conversations</p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  isOn
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {isOn ? "On" : "Off"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Let the AI automatically remember facts and preferences from your conversations, and
              use them across the Chatbot and integrated services.
            </p>
          </div>
        </div>
        {isLoading ? (
          <Spinner className="h-5 w-5 shrink-0" />
        ) : (
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
            className="shrink-0"
          />
        )}
      </CardContent>
    </Card>
  );
};
