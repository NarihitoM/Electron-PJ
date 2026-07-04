import { useState } from "react";
import { Eye, MessageSquare, Code, Brain, Wrench, Image, ChevronsUpDown } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../../shared/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../shared/components/ui/select";
import { getProviderImage } from "../../../shared/config/providermodels";
import type { ModelEntry } from "../../../shared/lib/modelsapi";

const CAPABILITY_META: Record<string, { icon: typeof Eye; label: string; color: string }> = {
    vision:            { icon: Eye,          label: "Vision",         color: "text-violet-400" },
    text:              { icon: MessageSquare, label: "Text",          color: "text-blue-400" },
    code:              { icon: Code,         label: "Code",           color: "text-emerald-400" },
    reasoning:         { icon: Brain,        label: "Reasoning",      color: "text-amber-400" },
    tools:             { icon: Wrench,       label: "Tool Use",       color: "text-cyan-400" },
    image_generation:  { icon: Image,        label: "Image Gen",      color: "text-purple-400" },
};

function CapabilityBadge({ name }: { name: string }) {
    const cap = CAPABILITY_META[name];
    if (!cap) return null;
    const Icon = cap.icon;
    return (
        <Tooltip>
            <TooltipTrigger render={<span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white/10 ${cap.color}`} />}>
                <Icon size={10} />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>
                {cap.label}
            </TooltipContent>
        </Tooltip>
    );
}

type ReasoningLevel = "" | "low" | "medium" | "high";

interface ModelSelectProps {
    modelList: ModelEntry[];
    provider: string;
    model: string;
    loading: boolean;
    disabled?: boolean;
    onSelect: (model: string) => void;
    reasoningLevel?: ReasoningLevel;
    onReasoningLevelChange?: (level: ReasoningLevel) => void;
}

function ReasoningLevelSelect({ value, onChange }: { value: ReasoningLevel; onChange: (v: ReasoningLevel) => void }) {
    return (
        <Select value={value || "auto"} onValueChange={(v) => onChange(v === "auto" ? "" : v as ReasoningLevel)}>
            <SelectTrigger size="sm" className="w-[110px] border-cyan-500/20 bg-cyan-500/5">
                <Brain size={12} className="text-amber-400 mr-1" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
            </SelectContent>
        </Select>
    );
}

export function ModelSelect({ modelList, provider, model, loading, disabled, onSelect, reasoningLevel, onReasoningLevelChange }: ModelSelectProps) {
    const [open, setOpen] = useState(false);

    const selectedModel = modelList.find(m => m.model === model);
    const hasReasoning = selectedModel?.capabilities.includes("reasoning") ?? false;

    return (
        <TooltipProvider>
            <div className="flex gap-2 items-center">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        render={
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="justify-between"
                                disabled={disabled || loading}
                            />
                        }
                    >
                        {loading ? (
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : model ? (
                            <div className="flex items-center gap-2">
                                <img src={getProviderImage(provider)} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                <span className="truncate">{model}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">Select Model</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="p-1" align="start">
                        <Command className="bg-transparent">
                            <CommandInput placeholder="Search model..." />
                            <CommandList>
                                <CommandEmpty>No model found.</CommandEmpty>
                                <CommandGroup>
                                    {modelList.length === 0 && !loading && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">No models available. Configure your API key in Settings.</div>
                                    )}
                                    {modelList.map((entry) => (
                                        <CommandItem
                                            key={entry.model}
                                            value={entry.model}
                                            onSelect={() => { onSelect(entry.model); setOpen(false); }}
                                            className="group"
                                        >
                                            <img src={getProviderImage(provider)} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                            <span className="text-sm ml-3 truncate">{entry.model}</span>
                                            {entry.capabilities.length > 0 && (
                                                <span className="ml-auto flex gap-0.5">
                                                    {entry.capabilities.map(c => (
                                                        <CapabilityBadge key={c} name={c} />
                                                    ))}
                                                </span>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {hasReasoning && onReasoningLevelChange && (
                    <ReasoningLevelSelect value={reasoningLevel ?? ""} onChange={onReasoningLevelChange} />
                )}
            </div>
        </TooltipProvider>
    );
}
