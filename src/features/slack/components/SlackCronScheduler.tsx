import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";
import { BRAND_ASSETS, getProviderImage } from "@/shared/config/providermodels";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import type { slackcrondata } from "@/features/slack/types/type";
import type { NavigateFunction } from "react-router-dom";
import type { Servicefetch } from "@/features/services/types/type";

interface Channel {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface SlackCronSchedulerProps {
    opencron: boolean;
    setopencron: (open: boolean) => void;
    slackcron: slackcrondata;
    setslackcron: React.Dispatch<React.SetStateAction<slackcrondata>>;
    handlechange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    loadingcroncreate: boolean;
    cronsubmint: () => void;
    publichannel: Channel[];
    privatechannel: Channel[];
    im: Channel[];
    mpim: Channel[];
    workspace: string;
    Api: Servicefetch[];
    apiWithLogos: (Servicefetch & { imageUrl: string })[];
    navigate: NavigateFunction;
    cronModelList: ModelEntry[];
    modelOpen: boolean;
    setModelOpen: (open: boolean) => void;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];
    toggleCustomDayOfWeek: (day: number) => void;
    toggleCustomDayOfMonth: (day: number) => void;
    toggleCustomMonth: (month: number) => void;
    DAY_NAMES: string[];
    MONTH_NAMES: string[];
    maxDayOfMonth: number;
    selectedPublicchannelcron: string;
    selectedPrivatechannelcron: string;
    selectedimchannelcron: string;
    selectedmpimchannelcron: string;
}

export const SlackCronScheduler: React.FC<SlackCronSchedulerProps> = ({
    opencron,
    setopencron,
    slackcron,
    setslackcron,
    handlechange,
    loadingcroncreate,
    cronsubmint,
    publichannel,
    privatechannel,
    im,
    mpim,
    workspace,
    Api,
    apiWithLogos,
    navigate,
    cronModelList,
    modelOpen,
    setModelOpen,
    customDayOfWeek,
    customDayOfMonth,
    customMonth,
    toggleCustomDayOfWeek,
    toggleCustomDayOfMonth,
    toggleCustomMonth,
    DAY_NAMES,
    MONTH_NAMES,
    maxDayOfMonth,
    selectedPublicchannelcron,
    selectedPrivatechannelcron,
    selectedimchannelcron,
    selectedmpimchannelcron,
}) => {
    return (
        <Dialog open={opencron} onOpenChange={setopencron} modal={false}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Slack Cron Task</DialogTitle>
                    <DialogDescription>
                        Configure your AI Agent to broadcast messages automatically on a recurring minute schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label htmlFor="workspace">Workspace Name</Label>
                        <Input
                            id="workspace"
                            name="workspace"
                            disabled
                            value={slackcron.workspace}
                            onChange={handlechange}
                            placeholder="e.g., Acme Corp"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="chatId">Channel</Label>
                            <div className="flex gap-5">
                                {workspace && (
                                    <>
                                        {(publichannel.length > 0 || privatechannel.length > 0 || im.length > 0 || mpim.length > 0) && (
                                            <Select
                                                key={slackcron.channel}
                                                onValueChange={(val) => {
                                                    setslackcron((prev) => ({ ...prev, roomId: "" }));
                                                    setslackcron((prev) => ({ ...prev, channel: val ?? "" }));
                                                }}
                                                value={slackcron.channel}
                                                disabled={!slackcron.provider || !slackcron.isActive}
                                            >
                                                <SelectTrigger>
                                                    <span className="truncate">
                                                        {slackcron.channel ? slackcron.channel : "Select Channel"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                                    <SelectItem value="Public">Public</SelectItem>
                                                    <SelectItem value="Private">Private</SelectItem>
                                                    <SelectItem value="Direct message">Direct Message</SelectItem>
                                                    <SelectItem value="Group message">Group Message</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {slackcron.channel === "Public" && publichannel.length > 0 && (
                                            <Select
                                                key={slackcron.roomId}
                                                onValueChange={(val) => setslackcron((prev) => ({ ...prev, roomId: val ?? "" }))}
                                                value={slackcron.roomId}
                                                disabled={!slackcron.provider || !slackcron.isActive}
                                            >
                                                <SelectTrigger>
                                                    <span className="truncate">
                                                        {slackcron.roomId ? selectedPublicchannelcron?.substring(0, 15) + "..." : "Select Public Channel"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                                    {publichannel.map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {slackcron.channel === "Private" && privatechannel.length > 0 && (
                                            <Select
                                                key={slackcron.roomId}
                                                onValueChange={(val) => setslackcron((prev) => ({ ...prev, roomId: val ?? "" }))}
                                                value={slackcron.roomId}
                                                disabled={!slackcron.provider || !slackcron.isActive}
                                            >
                                                <SelectTrigger>
                                                    <span className="truncate">
                                                        {slackcron.roomId ? selectedPrivatechannelcron?.substring(0, 15) + "..." : "Select Private Channel"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                                    {privatechannel.map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {slackcron.channel === "Direct message" && im.length > 0 && (
                                            <Select
                                                key={slackcron.roomId}
                                                onValueChange={(val) => setslackcron((prev) => ({ ...prev, roomId: val ?? "" }))}
                                                value={slackcron.roomId}
                                                disabled={!slackcron.provider || !slackcron.isActive}
                                            >
                                                <SelectTrigger>
                                                    <span className="truncate">
                                                        {slackcron.roomId ? selectedimchannelcron?.substring(0, 15) + "..." : "Select Direct Message Channel"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                                    {im.map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {slackcron.channel === "Group message" && mpim.length > 0 && (
                                            <Select
                                                key={slackcron.roomId}
                                                onValueChange={(val) => setslackcron((prev) => ({ ...prev, roomId: val ?? "" }))}
                                                value={slackcron.roomId}
                                                disabled={!slackcron.provider || !slackcron.isActive}
                                            >
                                                <SelectTrigger>
                                                    <span className="truncate">
                                                        {slackcron.roomId ? selectedmpimchannelcron?.substring(0, 15) + "..." : "Select Group Message Channel"}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                                    {mpim.map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="provider">Provider</Label>
                            {Api.length > 0 ? (
                                <div className="flex gap-2 w-full">
                                    <Select
                                        value={slackcron.provider || undefined}
                                        disabled={!slackcron.isActive}
                                        onValueChange={(value) => {
                                            setslackcron((prev) => ({ ...prev, provider: value ?? "" }));
                                        }}
                                    >
                                        <SelectTrigger className="w-full flex items-center gap-2">
                                            {slackcron.provider ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={BRAND_ASSETS[slackcron.provider.toLowerCase()]}
                                                        className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                        alt=""
                                                    />
                                                    <span>{slackcron.provider.charAt(0).toUpperCase() + slackcron.provider.slice(1)}</span>
                                                </div>
                                            ) : (
                                                "Select Provider"
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apiWithLogos.map((item) => (
                                                <SelectItem
                                                    key={item.provider}
                                                    value={item.provider.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={item.imageUrl}
                                                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                            alt=""
                                                        />
                                                        <span>{item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => navigate("/app/settings")} title="Add Provider">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="bg-cyan-500 dark:bg-white text-white dark:text-black"
                                    onClick={() => navigate("/app/settings")}
                                >
                                    Add Provider
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="model">Model</Label>
                            {Api.length > 0 && (
                                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                    <PopoverTrigger render={<Button variant="outline" role="combobox" aria-expanded={modelOpen} className="justify-between" disabled={!slackcron.provider || !slackcron.isActive} />}>
                                        {slackcron.model ? (
                                            <div className="flex items-center gap-2">
                                                <img src={getProviderImage(slackcron.provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                <span className="truncate">{slackcron.model}</span>
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
                                                    {cronModelList.length === 0 && (
                                                        <div className="px-3 py-2 text-sm text-muted-foreground">No models available.</div>
                                                    )}
                                                    {cronModelList.map((entry) => (
                                                        <CommandItem key={entry.model} value={entry.model} onSelect={() => { setslackcron((prev) => ({ ...prev, model: entry.model })); setModelOpen(false); }}>
                                                            <img src={getProviderImage(slackcron.provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                            <span className="text-sm ml-3">{entry.model}</span>
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

                    <div className="space-y-1">
                        <Label>Cron Type</Label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { label: "Every minute", value: "minute" },
                                { label: "Every day", value: "day" },
                                { label: "Every week", value: "week" },
                                { label: "Every month", value: "month" },
                                { label: "Custom", value: "custom" },
                            ].map((opt) => (
                                <Button
                                    key={opt.value}
                                    type="button"
                                    variant={slackcron.crontype === opt.value ? "default" : "outline"}
                                    onClick={() => setslackcron((prev) => ({ ...prev, crontype: opt.value }))}
                                    disabled={!slackcron.isActive}
                                    className={slackcron.crontype === opt.value ? "bg-cyan-500 dark:bg-white text-white dark:text-black" : ""}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {slackcron.crontype === "custom" && slackcron.isActive && (
                        <div className="space-y-3 p-3 rounded-xl border bg-muted/30">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day of Week</Label>
                                <div className="flex gap-1 flex-wrap">
                                    {DAY_NAMES.map((name, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            size="sm"
                                            variant={customDayOfWeek.includes(index) ? "default" : "outline"}
                                            onClick={() => toggleCustomDayOfWeek(index)}
                                            className={customDayOfWeek.includes(index) ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 px-3" : "h-8 px-3"}
                                        >
                                            {name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day of Month</Label>
                                <div className="flex gap-1 flex-wrap">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <Button
                                            key={day}
                                            type="button"
                                            size="sm"
                                            disabled={day > maxDayOfMonth}
                                            variant={customDayOfMonth.includes(day) ? "default" : "outline"}
                                            onClick={() => toggleCustomDayOfMonth(day)}
                                            className={day > maxDayOfMonth ? "opacity-30 cursor-not-allowed h-8 w-9 p-0" : customDayOfMonth.includes(day) ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 w-9 p-0" : "h-8 w-9 p-0"}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Month</Label>
                                <div className="flex gap-1 flex-wrap">
                                    {MONTH_NAMES.map((name, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            size="sm"
                                            variant={customMonth.includes(index) ? "default" : "outline"}
                                            onClick={() => toggleCustomMonth(index)}
                                            className={customMonth.includes(index) ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 px-3" : "h-8 px-3"}
                                        >
                                            {name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Select at least one day of week or day of month. Leave month empty to run every month.
                            </p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="triggerAt">Execution Time</Label>
                        <Input
                            id="triggerAt"
                            name="triggerAt"
                            type="time"
                            value={slackcron.triggerAt}
                            onChange={handlechange}
                            disabled={!slackcron.isActive}
                            required
                            className="time-input"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="message">Agent Prompt Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={slackcron.message}
                            onChange={handlechange}
                            disabled={!slackcron.isActive}
                            placeholder="What should the agent generate and post?"
                            className="min-h-20"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-2 flex items-center">
                        <div className="flex">
                            <Label htmlFor="isActive" className="mr-1">Active Schedule</Label>
                            <Switch
                                checked={slackcron.isActive}
                                onCheckedChange={(checked) => {
                                    setslackcron((prev) => ({
                                        ...prev,
                                        isActive: checked,
                                    }));
                                }}
                                className="data-checked:bg-green-500 data-checked:border-green-500 dark:data-checked:bg-primary dark:data-checked:border-primary"
                                id="isActive"
                                name="isActive"
                            />
                        </div>
                        <Button type="button" variant="destructive" onClick={() => setopencron(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                cronsubmint();
                            }}
                            className="bg-cyan-500 dark:bg-white"
                            disabled={loadingcroncreate}
                        >
                            {loadingcroncreate ? <Spinner /> : "Save Schedule"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
