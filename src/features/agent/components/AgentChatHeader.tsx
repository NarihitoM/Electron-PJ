import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useagentstore } from "../store/store";

export const AgentChatHeader = () => {
  const { data: Api = [] } = useServiceKeys();
  const store = useagentstore();
  const navigate = useNavigate();

  const onAddNode = () => {
    store.setNodeDialogMode("create");
    store.resetForm();
    store.setNodeDialogOpen(true);
  };

  const onAddProvider = () => {
    navigate("/app/settings");
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex gap-3 items-center">
          <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
          Multimate-MultiAgent
        </h1>
        <p className="text-muted-foreground">Ai that does work.</p>
      </div>
      <div className="flex gap-2 items-center">
        {store.messageloading ? (
          <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            Working
          </Badge>
        ) : (
          <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            Up To Date
          </Badge>
        )}
        {store.nodes.length > 0 || Api.length > 0 ? (
          <Button
            onClick={onAddNode}
            className="bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-white dark:text-black"
          >
            Add Node
          </Button>
        ) : (
          <Button className="bg-cyan-500 dark:bg-white" onClick={onAddProvider}>
            Add Provider
          </Button>
        )}
      </div>
    </div>
  );
};
