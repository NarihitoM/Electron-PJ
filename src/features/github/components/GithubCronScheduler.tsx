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
import { useGithubAccount } from "../hooks/useGithubAccount";
import { githubauth } from "../api/api";
import { githubauthstore, initialGithubCron } from "../store/store";
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

export const GithubCronScheduler = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: accountData } = useGithubAccount();
  const store = githubauthstore();
  const navigate = useNavigate();

  const [modelOpen, setModelOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [cronModelList, setCronModelList] = useState<ModelEntry[]>([]);

  const connected = !!accountData;
  const repos = accountData?.repos ?? [];

  const apiWithLogos = Api.map((provider) => ({
    ...provider,
    imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()],
  }));

  useEffect(() => {
    const fetchCron = async () => {
      try {
        const response = await githubauth.githubcronget();
        if (response.success && response.data) {
          store.setGithubcron(response.data);
        } else {
          store.setGithubcron({ ...initialGithubCron });
        }
      } catch {
        store.setGithubcron({ ...initialGithubCron });
      }
    };
    fetchCron();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store.githubcron.customSchedule) {
      try {
        const schedule = JSON.parse(store.githubcron.customSchedule);
        store.setCustomDayOfWeek(schedule.dayOfWeek || []);
        store.setCustomDayOfMonth(schedule.dayOfMonth || []);
        store.setCustomMonth(schedule.month || []);
      } catch {
        store.setCustomDayOfWeek([]);
        store.setCustomDayOfMonth([]);
        store.setCustomMonth([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.githubcron.customSchedule]);

  useEffect(() => {
    if (!store.githubcron.provider) {
      setCronModelList([]);
      return;
    }
    getProviderModels(store.githubcron.provider).then((models) => {
      setCronModelList(models);
    });
  }, [store.githubcron.provider]);

  const handlecronchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    store.setGithubcron({ ...store.githubcron, [name]: value });
  };

  const toggleCustomDayOfWeek = (day: number) => {
    const prev = store.customDayOfWeek;
    store.setCustomDayOfWeek(prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleCustomDayOfMonth = (day: number) => {
    const prev = store.customDayOfMonth;
    store.setCustomDayOfMonth(prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleCustomMonth = (month: number) => {
    const prev = store.customMonth;
    const next = prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month];
    store.setCustomMonth(next);
    if (next.length > 0) {
      const maxDays = Math.min(...next.map((m) => getDaysInMonth(m)));
      store.setCustomDayOfMonth(store.customDayOfMonth.filter((d) => d <= maxDays));
    }
  };

  const cronsubmint = async () => {
    try {
      store.setLoadingcroncreate(true);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
        ...store.githubcron,
        timezone: userTimezone,
        customSchedule:
          store.githubcron.crontype === "custom"
            ? JSON.stringify({
                dayOfWeek: store.customDayOfWeek,
                dayOfMonth: store.customDayOfMonth,
                month: store.customMonth,
              })
            : "",
      };
      const response = await githubauth.githubcroncreate(payload);
      if (response.success) {
        toast.success(response.message);
        store.setOpencron(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      store.setLoadingcroncreate(false);
    }
  };

  const maxDayOfMonth = useMemo(() => {
    if (store.customMonth.length === 0) return 31;
    return Math.min(...store.customMonth.map((m) => getDaysInMonth(m)));
  }, [store.customMonth]);

  return (
    <Dialog open={store.opencron} onOpenChange={store.setOpencron} modal={false}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Github Cron Task</DialogTitle>
          <DialogDescription>
            Configure your AI Agent to work on a repo automatically on a recurring schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Repository</Label>
            {connected && (
              <Select
                value={store.githubcron.repo || undefined}
                disabled={!store.githubcron.provider || !store.githubcron.isActive}
                onValueChange={(val) => {
                  const repo = repos.find((r) => r.full_name === val);
                  store.setGithubcron({
                    ...store.githubcron,
                    repo: val ?? "",
                    repoName: repo?.full_name ?? "",
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate">
                    {store.githubcron.repo ? store.githubcron.repo : "Select Repository"}
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1 w-60 max-h-68 overflow-y-auto">
                  {repos.map((r) => (
                    <SelectItem key={r.id} value={r.full_name}>
                      {r.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="provider">Provider</Label>
              {apiWithLogos.length > 0 ? (
                <div className="flex gap-2">
                  <Select
                    value={store.githubcron.provider || undefined}
                    disabled={!store.githubcron.isActive}
                    onValueChange={(value) => {
                      store.setGithubcron({ ...store.githubcron, provider: value ?? "" });
                    }}
                  >
                    <SelectTrigger className="w-full flex items-center gap-2">
                      {store.githubcron.provider ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={BRAND_ASSETS[store.githubcron.provider.toLowerCase()]}
                            className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                            alt=""
                          />
                          <span>{getProviderDisplayName(store.githubcron.provider)}</span>
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
                    disabled={!store.githubcron.provider || !store.githubcron.isActive}
                  >
                    {store.githubcron.model ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={getProviderImage(store.githubcron.provider || "")}
                          className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                        />
                        <span className="truncate">{store.githubcron.model}</span>
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
                                  store.setGithubcron({
                                    ...store.githubcron,
                                    model: entry.model,
                                  });
                                  setModelOpen(false);
                                  setModelSearch("");
                                }}
                                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                              >
                                <img
                                  src={getProviderImage(store.githubcron.provider || "")}
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
                  variant={store.githubcron.crontype === opt.value ? "default" : "outline"}
                  onClick={() => store.setGithubcron({ ...store.githubcron, crontype: opt.value })}
                  disabled={!store.githubcron.isActive}
                  className={
                    store.githubcron.crontype === opt.value
                      ? "bg-cyan-500 dark:bg-white text-white dark:text-black"
                      : ""
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {store.githubcron.crontype === "custom" && store.githubcron.isActive && (
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
                      variant={store.customDayOfWeek.includes(index) ? "default" : "outline"}
                      onClick={() => toggleCustomDayOfWeek(index)}
                      className={
                        store.customDayOfWeek.includes(index)
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
                      variant={store.customDayOfMonth.includes(day) ? "default" : "outline"}
                      onClick={() => toggleCustomDayOfMonth(day)}
                      className={
                        day > maxDayOfMonth
                          ? "opacity-30 cursor-not-allowed h-8 w-9 p-0"
                          : store.customDayOfMonth.includes(day)
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
                      variant={store.customMonth.includes(index) ? "default" : "outline"}
                      onClick={() => toggleCustomMonth(index)}
                      className={
                        store.customMonth.includes(index)
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
              value={store.githubcron.triggerAt}
              onChange={handlecronchange}
              disabled={!store.githubcron.isActive}
              required
              className="time-input"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="message">Agent Prompt Message</Label>
            <Textarea
              id="message"
              name="message"
              value={store.githubcron.message}
              onChange={handlecronchange}
              disabled={!store.githubcron.isActive}
              placeholder="What should the agent do on this repo?"
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
                checked={store.githubcron.isActive}
                onCheckedChange={(checked) => {
                  store.setGithubcron({ ...store.githubcron, isActive: checked });
                }}
                className="data-checked:bg-green-500 data-checked:border-green-500 dark:data-checked:bg-primary dark:data-checked:border-primary"
                id="isActive"
                name="isActive"
              />
            </div>
            <Button type="button" variant="destructive" onClick={() => store.setOpencron(false)}>
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                cronsubmint();
              }}
              className="bg-cyan-500 dark:bg-white"
              disabled={store.loadingcroncreate}
            >
              {store.loadingcroncreate ? <Spinner /> : "Save Schedule"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
