import { useMemo } from "react";
import { Plus, ChevronsUpDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Switch } from "@/shared/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/shared/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { BRAND_ASSETS, getProviderImage } from "@/shared/config/providermodels";
import type { ModelEntry } from "@/shared/lib/modelsapi";
import type { telegramcrondata, TelegramChatEntity, TelegramContactEntity } from "@/features/telegram/types";
import type { Servicefetch } from "@/features/services/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDaysInMonth = (monthIndex: number): number => {
    return new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
};

interface TelegramCronSchedulerProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    telegramcron: telegramcrondata;
    settelegramcron: React.Dispatch<React.SetStateAction<telegramcrondata>>;
    loadingcroncreate: boolean;
    cronsubmint: () => void;
    apiWithLogos: (Servicefetch & { imageUrl: string })[];
    cronModelList: ModelEntry[];
    setModelOpen: (val: boolean) => void;
    modelOpen: boolean;
    customDayOfWeek: number[];
    customDayOfMonth: number[];
    customMonth: number[];
    toggleCustomDayOfWeek: (day: number) => void;
    toggleCustomDayOfMonth: (day: number) => void;
    toggleCustomMonth: (month: number) => void;
    handlecronchange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    telegramuserdata: boolean;
    groups: TelegramChatEntity[];
    contacts: TelegramContactEntity[];
}

export const TelegramCronScheduler = ({
    open,
    onOpenChange,
    telegramcron,
    settelegramcron,
    loadingcroncreate,
    cronsubmint,
    apiWithLogos,
    cronModelList,
    setModelOpen,
    modelOpen,
    customDayOfWeek,
    customDayOfMonth,
    customMonth,
    toggleCustomDayOfWeek,
    toggleCustomDayOfMonth,
    toggleCustomMonth,
    handlecronchange,
    telegramuserdata,
    groups,
    contacts,
}: TelegramCronSchedulerProps) => {
    const navigate = useNavigate();

    const maxDayOfMonth = useMemo(() => {
        if (customMonth.length === 0) return 31;
        return Math.min(...customMonth.map(m => getDaysInMonth(m)));
    }, [customMonth]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Telegram Cron Task</DialogTitle>
                    <DialogDescription>
                        Configure your AI Agent to broadcast messages automatically on a recurring schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>Channel</Label>
                        {telegramuserdata && (
                            <div className="flex gap-5">
                                {(groups.length > 0 || contacts.length > 0) && (
                                    <Select value={telegramcron.channel} disabled={!telegramcron.provider || !telegramcron.isActive} onValueChange={(val) => {
                                        settelegramcron((prev) => ({ ...prev, chatId: "" }));
                                        settelegramcron((prev) => ({ ...prev, channel: val ?? "" }));
                                    }}>
                                        <SelectTrigger>
                                            <span className="truncate">{telegramcron.channel ? telegramcron.channel : "Select"}</span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto">
                                            <SelectItem value="group">Group</SelectItem>
                                            <SelectItem value="contact">Contact</SelectItem>
                                        </SelectContent>
                                    </Select>)}

                                {telegramcron.channel === "group" && groups.length > 0 && (
                                    <Select disabled={!telegramcron.provider || !telegramcron.isActive} value={telegramcron.chatId || undefined} onValueChange={(val) => settelegramcron((prev) => ({ ...prev, chatId: val ?? "" }))}>
                                        <SelectTrigger>
                                            <span className="truncate">{telegramcron.chatId ? groups.find(g => g.id === telegramcron.chatId)?.title?.substring(0, 15) + "..." : "Select Group"}</span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto">
                                            {groups.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {telegramcron.channel === "contact" && contacts.length > 0 && (
                                    <Select disabled={!telegramcron.provider || !telegramcron.isActive} value={telegramcron.chatId || undefined} onValueChange={(val) => settelegramcron((prev) => ({ ...prev, chatId: val ?? "" }))}>
                                        <SelectTrigger>
                                            <span className="truncate">{telegramcron.chatId ? contacts.find(c => c.id === telegramcron.chatId)?.name?.substring(0, 15) + "..." : "Select Contact"}</span>
                                        </SelectTrigger>
                                        <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto">
                                            {contacts.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="provider">Provider</Label>
                            {apiWithLogos.length > 0 ? (
                                <div className="flex gap-2">
                                    <Select
                                        value={telegramcron.provider || undefined}
                                        disabled={!telegramcron.isActive}
                                        onValueChange={(value) => {
                                            settelegramcron((prev) => ({ ...prev, provider: value ?? "" }));
                                        }}
                                    >
                                        <SelectTrigger className="w-full flex items-center gap-2">
                                            {telegramcron.provider ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={BRAND_ASSETS[telegramcron.provider.toLowerCase()]}
                                                        className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                                                        alt=""
                                                    />
                                                    <span>{telegramcron.provider.charAt(0).toUpperCase() + telegramcron.provider.slice(1)}</span>
                                                </div>
                                            ) : (
                                                "Select Provider"
                                            )}
                                        </SelectTrigger>

                                        <SelectContent>
                                            {apiWithLogos.map((item) => (
                                                <SelectItem key={item.provider} value={item.provider.toString()} className="cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <img src={item.imageUrl} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" alt="" />
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
                                <Button className="bg-cyan-500 dark:bg-white text-white dark:text-black" onClick={() => navigate("/app/settings")}>Add Provider</Button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="model">Model</Label>
                            {apiWithLogos.length > 0 && (
                                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                    <PopoverTrigger render={<Button variant="outline" role="combobox" aria-expanded={modelOpen} className="justify-between" disabled={!telegramcron.provider || !telegramcron.isActive} />}>
                                        {telegramcron.model ? (
                                            <div className="flex items-center gap-2">
                                                <img src={getProviderImage(telegramcron.provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
                                                <span className="truncate">{telegramcron.model}</span>
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
                                                        <CommandItem key={entry.model} value={entry.model} onSelect={() => { settelegramcron((prev) => ({ ...prev, model: entry.model })); setModelOpen(false); }}>
                                                            <img src={getProviderImage(telegramcron.provider || "")} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" />
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
                                    variant={telegramcron.crontype === opt.value ? "default" : "outline"}
                                    onClick={() => settelegramcron((prev) => ({ ...prev, crontype: opt.value }))}
                                    disabled={!telegramcron.isActive}
                                    className={telegramcron.crontype === opt.value ? "bg-cyan-500 dark:bg-white text-white dark:text-black" : ""}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {telegramcron.crontype === "custom" && telegramcron.isActive && (
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
                        <Input id="triggerAt" name="triggerAt" type="time" value={telegramcron.triggerAt} onChange={handlecronchange} disabled={!telegramcron.isActive} required className="time-input" />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="message">Agent Prompt Message</Label>
                        <Textarea id="message" name="message" value={telegramcron.message} onChange={handlecronchange} disabled={!telegramcron.isActive} placeholder="What should the agent generate and post?" className="min-h-20" required />
                    </div>

                    <DialogFooter className="flex items-center pt-2">
                        <div className="flex">
                            <Label htmlFor="isActive" className="mr-1">Active Schedule</Label>
                            <Switch checked={telegramcron.isActive}
                                onCheckedChange={(checked) => {
                                    settelegramcron((prev) => ({
                                        ...prev,
                                        isActive: checked
                                    }));
                                }}
                                className="data-checked:bg-green-500 data-checked:border-green-500 dark:data-checked:bg-primary dark:data-checked:border-primary"
                                id="isActive"
                                name="isActive"
                            >
                            </Switch>
                        </div>
                        <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={(e) => { e.preventDefault(); cronsubmint(); }} className="bg-cyan-500 dark:bg-white" disabled={loadingcroncreate}>{loadingcroncreate ? <Spinner /> : "Save Schedule"}</Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
