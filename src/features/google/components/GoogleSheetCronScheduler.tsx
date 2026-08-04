import { useEffect, useMemo, useState } from "react";
import { Plus, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BRAND_ASSETS,
  getProviderDisplayName,
  getProviderImage,
  getProviderModels,
} from "@/shared/config/providermodels";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useGoogleService } from "../hooks/useGoogleService";
import { googleauth } from "../api/api";
import { googleauthstore, initialSheetCron } from "../store/store";
import type { ModelEntry } from "@/shared/lib/modelsapi";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getDaysInMonth = (monthIndex: number): number => {
  return new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
};

export const GoogleSheetCronScheduler = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: googleService } = useGoogleService();
  const store = googleauthstore();
  const navigate = useNavigate();

  const [modelOpen, setModelOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [cronModelList, setCronModelList] = useState<ModelEntry[]>([]);

  const sheets = (googleService as any)?.googlesheet ?? [];

  const apiWithLogos = Api.map((provider) => ({
    ...provider,
    imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()],
  }));

  useEffect(() => {
    const fetchCron = async () => {
      try {
        const response = await googleauth.sheetcronget();
        if (response.success && response.data) {
          store.setSheetcron(response.data);
        } else {
          store.setSheetcron({ ...initialSheetCron });
        }
      } catch {
        store.setSheetcron({ ...initialSheetCron });
      }
    };
    fetchCron();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.sheetcron.customSchedule) {
      try {
        const schedule = JSON.parse(store.sheetcron.customSchedule);
        store.setCustomDayOfWeek_sheet(schedule.dayOfWeek || []);
        store.setCustomDayOfMonth_sheet(schedule.dayOfMonth || []);
        store.setCustomMonth_sheet(schedule.month || []);
      } catch {
        store.setCustomDayOfWeek_sheet([]);
        store.setCustomDayOfMonth_sheet([]);
        store.setCustomMonth_sheet([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sheetcron.customSchedule]);

  useEffect(() => {
    if (!store.sheetcron.provider) {
      setCronModelList([]);
      return;
    }
    getProviderModels(store.sheetcron.provider).then((models) => {
      setCronModelList(models);
    });
  }, [store.sheetcron.provider]);

  const handlecronchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    store.setSheetcron({ ...store.sheetcron, [name]: value });
  };

  const toggleCustomDayOfWeek = (day: number) => {
    const prev = store.customDayOfWeek_sheet;
    store.setCustomDayOfWeek_sheet(
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleCustomDayOfMonth = (day: number) => {
    const prev = store.customDayOfMonth_sheet;
    store.setCustomDayOfMonth_sheet(
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleCustomMonth = (month: number) => {
    const prev = store.customMonth_sheet;
    const next = prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month];
    store.setCustomMonth_sheet(next);
    if (next.length > 0) {
      const maxDays = Math.min(...next.map((m) => getDaysInMonth(m)));
      store.setCustomDayOfMonth_sheet(store.customDayOfMonth_sheet.filter((d) => d <= maxDays));
    }
  };

  const cronsubmint = async () => {
    try {
      store.setLoadingsheetcroncreate(true);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
        ...store.sheetcron,
        timezone: userTimezone,
        customSchedule:
          store.sheetcron.crontype === "custom"
            ? JSON.stringify({
                dayOfWeek: store.customDayOfWeek_sheet,
                dayOfMonth: store.customDayOfMonth_sheet,
                month: store.customMonth_sheet,
              })
            : "",
      };
      const response = await googleauth.sheetcroncreate(payload);
      if (response.success) {
        toast.success(response.message);
        store.setOpensheetcron(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      store.setLoadingsheetcroncreate(false);
    }
  };

  const maxDayOfMonth = useMemo(() => {
    if (store.customMonth_sheet.length === 0) return 31;
    return Math.min(...store.customMonth_sheet.map((m) => getDaysInMonth(m)));
  }, [store.customMonth_sheet]);

  return (
    <Dialog open={store.opensheetcron} onOpenChange={store.setOpensheetcron} modal={false}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sheet Cron Task</DialogTitle>
          <DialogDescription>
            Configure your AI Agent to work on a spreadsheet automatically on a recurring schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Spreadsheet</Label>
            <Select
              value={store.sheetcron.sheetUrl || undefined}
              disabled={!store.sheetcron.provider || !store.sheetcron.isActive}
              onValueChange={(val) => {
                const sheet = sheets.find((s: any) => s.url === val);
                store.setSheetcron({
                  ...store.sheetcron,
                  sheetUrl: val ?? "",
                  sheetName: sheet?.name ?? "",
                });
              }}
            >
              <SelectTrigger className="w-full">
                <span className="truncate">
                  {store.sheetcron.sheetName ? store.sheetcron.sheetName : "Select Spreadsheet"}
                </span>
              </SelectTrigger>
              <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto">
                {sheets.map((s: any) => (
                  <SelectItem key={s.id} value={s.url}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="provider">Provider</Label>
              {apiWithLogos.length > 0 ? (
                <div className="flex gap-2">
                  <Select
                    value={store.sheetcron.provider || undefined}
                    disabled={!store.sheetcron.isActive}
                    onValueChange={(value) => {
                      store.setSheetcron({ ...store.sheetcron, provider: value ?? "" });
                    }}
                  >
                    <SelectTrigger className="w-full flex items-center gap-2">
                      {store.sheetcron.provider ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={BRAND_ASSETS[store.sheetcron.provider.toLowerCase()]}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                            alt=""
                          />
                          <span>{getProviderDisplayName(store.sheetcron.provider)}</span>
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
                            <span>{getProviderDisplayName(item.provider)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/app/settings")}
                    title="Add Provider"
                  >
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
              {apiWithLogos.length > 0 && (
                <div className="relative overflow-visible">
                  <Button
                    variant="outline"
                    onClick={() => setModelOpen(!modelOpen)}
                    className="w-full justify-between"
                    disabled={!store.sheetcron.provider || !store.sheetcron.isActive}
                  >
                    {store.sheetcron.model ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={getProviderImage(store.sheetcron.provider || "")}
                          className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                        />
                        <span className="truncate">{store.sheetcron.model}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select Model</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  {modelOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-100 min-w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
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
                        {cronModelList.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No models available.
                          </div>
                        )}
                        {cronModelList.filter((entry) =>
                          entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                        ).length === 0 && cronModelList.length > 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            No model found.
                          </p>
                        ) : (
                          cronModelList
                            .filter((entry) =>
                              entry.model.toLowerCase().includes(modelSearch.toLowerCase()),
                            )
                            .map((entry) => (
                              <button
                                key={entry.model}
                                type="button"
                                onClick={() => {
                                  store.setSheetcron({
                                    ...store.sheetcron,
                                    model: entry.model,
                                  });
                                  setModelOpen(false);
                                  setModelSearch("");
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                              >
                                <img
                                  src={getProviderImage(store.sheetcron.provider || "")}
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
                  variant={store.sheetcron.crontype === opt.value ? "default" : "outline"}
                  onClick={() => store.setSheetcron({ ...store.sheetcron, crontype: opt.value })}
                  disabled={!store.sheetcron.isActive}
                  className={
                    store.sheetcron.crontype === opt.value
                      ? "bg-cyan-500 dark:bg-white text-white dark:text-black"
                      : ""
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {store.sheetcron.crontype === "custom" && store.sheetcron.isActive && (
            <div className="space-y-3 p-3 rounded-xl border bg-muted/30">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Day of Week
                </Label>
                <div className="flex gap-1 flex-wrap">
                  {DAY_NAMES.map((name, index) => (
                    <Button
                      key={index}
                      type="button"
                      size="sm"
                      variant={store.customDayOfWeek_sheet.includes(index) ? "default" : "outline"}
                      onClick={() => toggleCustomDayOfWeek(index)}
                      className={
                        store.customDayOfWeek_sheet.includes(index)
                          ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 px-3"
                          : "h-8 px-3"
                      }
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Day of Month
                </Label>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      disabled={day > maxDayOfMonth}
                      variant={store.customDayOfMonth_sheet.includes(day) ? "default" : "outline"}
                      onClick={() => toggleCustomDayOfMonth(day)}
                      className={
                        day > maxDayOfMonth
                          ? "opacity-30 cursor-not-allowed h-8 w-9 p-0"
                          : store.customDayOfMonth_sheet.includes(day)
                            ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 w-9 p-0"
                            : "h-8 w-9 p-0"
                      }
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Month
                </Label>
                <div className="flex gap-1 flex-wrap">
                  {MONTH_NAMES.map((name, index) => (
                    <Button
                      key={index}
                      type="button"
                      size="sm"
                      variant={store.customMonth_sheet.includes(index) ? "default" : "outline"}
                      onClick={() => toggleCustomMonth(index)}
                      className={
                        store.customMonth_sheet.includes(index)
                          ? "bg-cyan-500 dark:bg-white text-white dark:text-black h-8 px-3"
                          : "h-8 px-3"
                      }
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Select at least one day of week or day of month. Leave month empty to run every
                month.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="triggerAt">Execution Time</Label>
            <Input
              id="triggerAt"
              name="triggerAt"
              type="time"
              value={store.sheetcron.triggerAt}
              onChange={handlecronchange}
              disabled={!store.sheetcron.isActive}
              required
              className="time-input"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="message">Agent Prompt Message</Label>
            <Textarea
              id="message"
              name="message"
              value={store.sheetcron.message}
              onChange={handlecronchange}
              disabled={!store.sheetcron.isActive}
              placeholder="What should the agent do on this spreadsheet?"
              className="min-h-20"
              required
            />
          </div>

          <DialogFooter className="flex items-center pt-2">
            <div className="flex">
              <Label htmlFor="isActive" className="mr-1">
                Active Schedule
              </Label>
              <Switch
                checked={store.sheetcron.isActive}
                onCheckedChange={(checked) => {
                  store.setSheetcron({ ...store.sheetcron, isActive: checked });
                }}
                className="data-checked:bg-green-500 data-checked:border-green-500 dark:data-checked:bg-primary dark:data-checked:border-primary"
                id="isActive"
                name="isActive"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => store.setOpensheetcron(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                cronsubmint();
              }}
              className="bg-cyan-500 dark:bg-white"
              disabled={store.loadingsheetcroncreate}
            >
              {store.loadingsheetcroncreate ? <Spinner /> : "Save Schedule"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
