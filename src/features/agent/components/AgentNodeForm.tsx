import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ChevronsUpDown, Plus } from "lucide-react";
import { BRAND_ASSETS, getProviderImage } from "@/shared/config/providermodels";
import { ToolLabels } from "@/shared/config/toolsselection";
import { ModelEntry } from "@/shared/lib/modelsapi";

interface AgentNodeFormProps {
  mode: "create" | "update" | "delete";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (value: string) => void;
  actor: string;
  prompt: string;
  setPrompt: (value: string) => void;
  provider: string | null;
  setProvider: (value: string) => void;
  model: string | null;
  setModel: (value: string) => void;
  tool: string | null;
  setTool: (value: string) => void;
  toolOpen: boolean;
  setToolOpen: (open: boolean) => void;
  modelOpen: boolean;
  setModelOpen: (open: boolean) => void;
  modelList: ModelEntry[];
  modelsLoading: boolean;
  Api: any[];
  loadingnode: boolean;
  onSubmit: () => void;
  onNavigateSettings: () => void;
}

export const AgentNodeForm = ({
  mode,
  open,
  onOpenChange,
  name,
  setName,
  actor,
  prompt,
  setPrompt,
  provider,
  setProvider,
  model,
  setModel,
  tool,
  setTool,
  toolOpen,
  setToolOpen,
  modelOpen,
  setModelOpen,
  modelList,
  modelsLoading,
  Api,
  loadingnode,
  onSubmit,
  onNavigateSettings,
}: AgentNodeFormProps) => {
  const apiWithLogos = Api
    ? Api.map((item) => ({
        ...item,
        imageUrl: BRAND_ASSETS[item.provider.toLowerCase()],
      }))
    : [];

  const title =
    mode === "create"
      ? "Add Agent Node"
      : mode === "update"
      ? "Update Agent Node"
      : "Delete Agent Node";

  const description =
    mode === "delete"
      ? null
      : "Add your own ai agent into your workflow.";

  const submitLabel =
    mode === "create"
      ? "Add"
      : mode === "update"
      ? "Update"
      : "Delete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}

        {mode === "delete" ? (
          <DialogDescription>
            Are you sure do you want to delete{" "}
            <span className="font-semibold">"{name}"</span>?
          </DialogDescription>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder={
                  mode === "create"
                    ? "Enter Agent Name"
                    : "Enter New Agent"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="Agent Name..."
                value={actor}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder={
                  mode === "create"
                    ? "Enter Agent Prompt"
                    : "Enter New Agent Prompt"
                }
                className="resize-none h-20"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="provider">Provider</Label>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => {
                      setProvider(value ?? "");
                      setModel("");
                    }}
                    value={provider}
                  >
                    <SelectTrigger>
                      {provider ? (
                        <>
                          <img
                            src={BRAND_ASSETS[provider.toLowerCase()]}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                          />
                          <span>
                            {provider.charAt(0).toUpperCase() +
                              provider.slice(1)}
                          </span>
                        </>
                      ) : (
                        "Select Provider"
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {apiWithLogos.map((item) => (
                        <SelectItem
                          key={item.provider}
                          value={item.provider}
                        >
                          <img
                            src={item.imageUrl}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                          />
                          <span>
                            {item.provider.charAt(0).toUpperCase() +
                              item.provider.slice(1)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onNavigateSettings}
                    title="Add Provider"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="Tool">Tools</Label>
                <Popover open={toolOpen} onOpenChange={setToolOpen}>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={toolOpen}
                      className="w-full justify-between"
                    >
                      {tool ? ToolLabels[tool] : "Select tool..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-1"
                    align="start"
                  >
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Search tool..." />
                      <CommandList>
                        <CommandEmpty>No tool found.</CommandEmpty>
                        <CommandGroup>
                          {Object.entries(ToolLabels).map(
                            ([key, label]) => (
                              <CommandItem
                                key={key}
                                value={label}
                                onSelect={() => {
                                  setTool(key);
                                  setToolOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                {label}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="model">Models</Label>
                {Api.length > 0 && (
                  <Popover
                    open={modelOpen}
                    onOpenChange={setModelOpen}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={modelOpen}
                          className="justify-between"
                          disabled={!provider || modelsLoading}
                        />
                      }
                    >
                      {modelsLoading ? (
                        <span className="text-sm text-muted-foreground">
                          Loading...
                        </span>
                      ) : model ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getProviderImage(provider || "")}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                          />
                          <span className="truncate">
                            {model.substring(0, 7) + "..."}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select Model
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="p-1" align="start">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Search model..." />
                        <CommandList>
                          <CommandEmpty>
                            No model found.
                          </CommandEmpty>
                          <CommandGroup>
                            {modelList.length === 0 &&
                              !modelsLoading && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No models available.
                                </div>
                              )}
                            {modelList.map((entry) => (
                              <CommandItem
                                key={entry.model}
                                value={entry.model}
                                onSelect={() => {
                                  setModel(entry.model);
                                  setModelOpen(false);
                                }}
                              >
                                <img
                                  src={getProviderImage(
                                    provider || ""
                                  )}
                                  className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                />
                                <span className="text-sm ml-3">
                                  {entry.model}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
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
          <Button
            onClick={() => onOpenChange(false)}
            variant="destructive"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
