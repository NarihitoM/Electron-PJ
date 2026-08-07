import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { ChevronsUpDown, Plus, Search } from "lucide-react";
import {
  BRAND_ASSETS,
  getProviderDisplayName,
  getProviderImage,
  getProviderModels,
} from "@/shared/config/providermodels";
import {
  ToolLabels,
  SERVICE_TOOLS,
  SERVICE_TOOL_MAP,
  SERVICE_GROUP_LABELS,
  SERVICE_ICONS,
  getToolDisplayLabel,
} from "@/shared/config/toolsselection";
import { useagentstore } from "../store/store";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { agentauth } from "../api/api";
import { useCreateAgentNode } from "../hooks/useCreateAgentNode";
import { useDeleteAgentNode } from "../hooks/useDeleteAgentNode";
import { useConnections } from "../hooks/useConnections";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type ToolEntry = { key: string; label: string; group?: string; icon?: string };

export const AgentNodeForm = () => {
  const store = useagentstore();
  const { data: Api = [] } = useServiceKeys();
  const { data: connections = {} } = useConnections();
  const queryClient = useQueryClient();
  const { mutateAsync: createAgentNode } = useCreateAgentNode();
  const { mutateAsync: deleteAgentNode } = useDeleteAgentNode();
  const navigate = useNavigate();
  const [loadingnode, setLoadingnode] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const mode = store.nodeDialogMode;
  const open = store.nodeDialogOpen;
  const isOrchestrator = store.actor?.trim().toLowerCase() === "orchestrator";

  useEffect(() => {
    if (isOrchestrator && store.tool) store.setTool("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is a zustand hook, its identity is unstable and must not retrigger this effect
  }, [isOrchestrator]);

  const apiWithLogos = Api.map((item: any) => ({
    ...item,
    imageUrl: BRAND_ASSETS[item.provider.toLowerCase()],
  }));

  // A node with a service tool gets that service's ENTIRE toolset at
  // runtime (electron/tools/toolsregister.ts resolves the whole bucket, not
  // just the one picked action), so the dropdown offers one entry per
  // connected service rather than one per individual action.
  const toolEntries: ToolEntry[] = [
    ...Object.entries(ToolLabels)
      .filter(([key]) => !(key === "send_email" && connections.gmail))
      .map(([key, label]) => ({ key, label })),
    ...Object.entries(SERVICE_GROUP_LABELS)
      .filter(([service]) => connections[service])
      .map(([service, group]) => {
        const serviceToolIds = Object.keys(SERVICE_TOOLS[service]).filter(
          (key) => SERVICE_TOOL_MAP[key] === service,
        );
        return {
          key: serviceToolIds[0],
          label: group,
          group: "Connected Services",
          icon: SERVICE_ICONS[service],
        };
      }),
  ];

  useEffect(() => {
    if (!open) return;
    if (!store.provider) {
      store.setModelList([]);
      return;
    }
    store.setModelsLoading(true);
    getProviderModels(store.provider).then((models) => {
      store.setModelList(models);
      store.setModelsLoading(false);
      if (models.length > 0 && !models.some((m) => m.model === store.model)) {
        store.setModel(models[0].model);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is a zustand hook, its identity is unstable and must not retrigger this effect
  }, [store.provider, open]);

  const onSubmit = async () => {
    setLoadingnode(true);
    try {
      if (mode === "create") {
        const response = await createAgentNode({
          name: store.name,
          provider: store.provider,
          actor: store.actor,
          model: store.model,
          tool: store.tool ?? "",
          prompt: store.prompt,
        });
        if (response.success) {
          toast.success("Node created successfully");
          queryClient.invalidateQueries({ queryKey: ["node"] });
          store.resetForm();
        } else {
          toast.error(response.message);
        }
      } else if (mode === "update") {
        const response = await agentauth.updatenode(
          store.nodeid,
          store.name,
          store.provider,
          store.actor,
          store.model,
          store.tool ?? "",
          store.prompt,
        );
        if (response.success) {
          toast.success("Node updated successfully");
          queryClient.invalidateQueries({ queryKey: ["node"] });
          store.resetForm();
        } else {
          toast.error(response.message);
        }
      } else if (mode === "delete") {
        const response = await deleteAgentNode(store.nodeid);
        if (response.success) {
          toast.success("Node deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["node"] });
          queryClient.invalidateQueries({ queryKey: ["edges"] });
          store.resetForm();
        } else {
          toast.error(response.message);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "An unexpected error occurred.");
    } finally {
      setLoadingnode(false);
    }
  };

  const title =
    mode === "create"
      ? "Add Agent Node"
      : mode === "update"
        ? "Update Agent Node"
        : "Delete Agent Node";
  const description = mode === "delete" ? null : "Add your own ai agent into your workflow.";
  const submitLabel = mode === "create" ? "Add" : mode === "update" ? "Update" : "Delete";

  return (
    <Dialog open={open} onOpenChange={store.setNodeDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>
        {description && <DialogDescription>{description}</DialogDescription>}

        {mode === "delete" ? (
          <DialogDescription>
            Are you sure do you want to delete <span className="font-semibold">"{store.name}"</span>
            ?
          </DialogDescription>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder={mode === "create" ? "Enter Agent Name" : "Enter New Agent"}
                value={store.name}
                onChange={(e) => store.setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="e.g. Researcher, Coder, Writer, Orchestrator..."
                value={store.actor}
                onChange={(e) => store.setActor(e.target.value)}
              />
              {isOrchestrator && (
                <p className="text-xs text-muted-foreground">
                  This node will delegate to the nodes connected to it on the canvas as sub-agents,
                  instead of using a tool directly.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder={mode === "create" ? "Enter Agent Prompt" : "Enter New Agent Prompt"}
                className="resize-none h-20"
                value={store.prompt}
                onChange={(e) => store.setPrompt(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="provider">Provider</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 overflow-visible">
                    <Button
                      variant="outline"
                      onClick={() => store.setProviderOpen(!store.providerOpen)}
                      className="w-full justify-between"
                    >
                      {store.provider ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={BRAND_ASSETS[store.provider.toLowerCase()]}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                          />
                          <span className="truncate">{getProviderDisplayName(store.provider)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select Provider</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    {store.providerOpen && (
                      <div className="absolute left-0 right-0 bottom-full mb-1 z-100 min-w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
                        <div className="max-h-60 overflow-y-auto p-1">
                          {apiWithLogos.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No providers available.
                            </div>
                          ) : (
                            apiWithLogos.map((item: any) => (
                              <button
                                key={item.provider}
                                type="button"
                                onClick={() => {
                                  store.setProvider(item.provider);
                                  store.setProviderOpen(false);
                                  store.setModel("");
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                              >
                                <img
                                  src={item.imageUrl}
                                  className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                />
                                <span>{getProviderDisplayName(item.provider)}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/app/settings")}
                    title="Add Provider"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="Tool">Tools</Label>
                <div className="relative overflow-visible">
                  <Button
                    variant="outline"
                    disabled={isOrchestrator}
                    onClick={() => store.setToolOpen(!store.toolOpen)}
                    className="w-full justify-between"
                  >
                    {isOrchestrator ? (
                      "Delegates to sub-agents"
                    ) : store.tool ? (
                      <span className="flex items-center gap-2">
                        {SERVICE_TOOL_MAP[store.tool] && (
                          <img
                            src={SERVICE_ICONS[SERVICE_TOOL_MAP[store.tool]]}
                            className="w-4 h-4 shrink-0 object-contain"
                          />
                        )}
                        {getToolDisplayLabel(store.tool)}
                      </span>
                    ) : (
                      "Select tool..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  {store.toolOpen && !isOrchestrator && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 z-100 min-w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
                      <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                        <input
                          autoFocus
                          placeholder="Search tool..."
                          value={toolSearch}
                          onChange={(e) => setToolSearch(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1">
                        {"orchestrator".includes(toolSearch.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              store.setTool("");
                              store.setActor("Orchestrator");
                              store.setToolOpen(false);
                              setToolSearch("");
                            }}
                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-cyan-500 hover:bg-accent cursor-pointer"
                          >
                            Orchestrator
                          </button>
                        )}
                        {(() => {
                          const filtered = toolEntries.filter((t) =>
                            t.label.toLowerCase().includes(toolSearch.toLowerCase()),
                          );
                          if (
                            filtered.length === 0 &&
                            !"orchestrator".includes(toolSearch.toLowerCase())
                          ) {
                            return (
                              <p className="py-6 text-center text-sm text-muted-foreground">
                                No tool found.
                              </p>
                            );
                          }
                          let lastGroup: string | undefined;
                          return filtered.map((t) => {
                            const showHeader = t.group && t.group !== lastGroup;
                            lastGroup = t.group;
                            return (
                              <div key={t.key}>
                                {showHeader && (
                                  <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                                    {t.group}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    store.setTool(t.key);
                                    store.setActor(t.label);
                                    store.setToolOpen(false);
                                    setToolSearch("");
                                  }}
                                  className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                                >
                                  {t.icon && (
                                    <img src={t.icon} className="w-4 h-4 shrink-0 object-contain" />
                                  )}
                                  {t.label}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="model">Models</Label>
              {Api.length > 0 && (
                <div className="relative overflow-visible">
                  <Button
                    variant="outline"
                    onClick={() => store.setModelOpen(!store.modelOpen)}
                    className="w-full justify-between"
                    disabled={!store.provider || store.modelsLoading}
                  >
                    {store.modelsLoading ? (
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    ) : store.model ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={getProviderImage(store.provider || "")}
                          className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                        />
                        <span className="truncate">{store.model}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select Model</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  {store.modelOpen && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 z-100 min-w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
                      <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                        <input
                          autoFocus
                          placeholder="Search model..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1">
                        {store.modelList.length === 0 && !store.modelsLoading && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No models available.
                          </div>
                        )}
                        {store.modelList.filter((entry) =>
                          entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                        ).length === 0 && store.modelList.length > 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            No model found.
                          </p>
                        ) : (
                          store.modelList
                            .filter((entry) =>
                              entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                            )
                            .map((entry) => (
                              <button
                                key={entry.model}
                                type="button"
                                onClick={() => {
                                  store.setModel(entry.model);
                                  store.setModelOpen(false);
                                  setModelSearch("");
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                              >
                                <img
                                  src={getProviderImage(store.provider || "")}
                                  className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                />
                                <span className="text-sm ml-3">{entry.model}</span>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            disabled={loadingnode}
            onClick={onSubmit}
            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
          >
            {loadingnode ? <Spinner /> : submitLabel}
          </Button>
          <Button onClick={() => store.setNodeDialogOpen(false)} variant="destructive">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
