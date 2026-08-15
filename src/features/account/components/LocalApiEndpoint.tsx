import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { Copy, Play, Square, Zap } from "lucide-react";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useUser } from "@/features/auth/hooks/useUser";
import { PROVIDER_MODELS } from "@/shared/config/providermodels";

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};

export const LocalApiEndpoint = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: userdata } = useUser();
  const [running, setRunning] = useState(false);
  const [url, setUrl] = useState("http://127.0.0.1:8787/v1");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (window as any).api
      ?.getLocalApiStatus()
      .then((status: any) => {
        setRunning(status?.running ?? false);
        if (status?.url) setUrl(status.url);
        return (window as any).api?.ensureLocalApiKey();
      })
      .then((key: string) => {
        if (key) setApiKey(key);
      })
      .catch(() => {});
  }, []);

  const hostmap: Record<string, string> = {};
  Api.forEach((item) => {
    if (item.host) hostmap[item.provider.toLowerCase()] = item.host;
  });

  const modelsMap: Record<string, { model: string }[]> = {};
  for (const [provider, models] of Object.entries(PROVIDER_MODELS)) {
    modelsMap[provider] = models.map((m) => ({ model: m.model }));
  }

  const handleStart = async () => {
    if (!userdata?.useremail) {
      toast.error("User email not found. Please log in again.");
      return;
    }
    if (Api.length === 0) {
      toast.error("Configure at least one provider key first.");
      return;
    }
    setLoading(true);
    try {
      const result = await (window as any).api.startLocalApi({
        encryptkey: Api,
        useremail: userdata.useremail,
        hostmap,
        models: modelsMap,
      });
      setRunning(true);
      if (result?.url) setUrl(result.url);
      const key = await (window as any).api.ensureLocalApiKey();
      if (key) setApiKey(key);
      toast.success("Local API Endpoint started");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start Local API Endpoint");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await (window as any).api.stopLocalApi();
      setRunning(false);
      toast.success("Local API Endpoint stopped");
    } catch (err: any) {
      toast.error(err?.message || "Failed to stop Local API Endpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none bg-card shadow-none mt-6 p-4 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 dark:bg-white rounded-lg">
            <Zap className="h-5 w-5 text-cyan-500 dark:text-black" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Local API Endpoint</CardTitle>
            <CardDescription className="text-muted-foreground">
              Expose an OpenAI-compatible endpoint on localhost for external agentic tools and AI
              routers.
            </CardDescription>
          </div>
          <span
            className={
              running
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded text-xs font-medium"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded text-xs font-medium"
            }
          >
            {running ? "Running" : "Stopped"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Base URL
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => copyToClipboard(url, "Base URL")}
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy
            </Button>
          </div>
          <Input
            value={url}
            readOnly
            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base font-mono"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              API Key
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => apiKey && copyToClipboard(apiKey, "API Key")}
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy
            </Button>
          </div>
          <Input
            value={apiKey}
            readOnly
            type="password"
            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base font-mono"
            placeholder="Start the server to generate an API key"
          />
        </div>

        <div className="flex flex-row gap-3">
          {running ? (
            <Button
              disabled={loading}
              onClick={handleStop}
              variant="destructive"
              className="h-12 px-8 rounded-xl font-semibold transition-all"
            >
              {loading ? (
                "Stopping..."
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={handleStart}
              className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all"
            >
              {loading ? (
                "Starting..."
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-xs dark:text-muted-foreground text-cyan-500 leading-relaxed">
            <strong>Tip:</strong> Point your agentic tool or AI router at{" "}
            <code className="bg-cyan-500/10 px-1 rounded">{url}</code> with the API key above. Use{" "}
            <code className="bg-cyan-500/10 px-1 rounded">/v1/models</code> and{" "}
            <code className="bg-cyan-500/10 px-1 rounded">/v1/chat/completions</code> (streaming
            supported). Model names from your configured providers are auto-listed. Token usage from
            every request is tracked on the Dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
