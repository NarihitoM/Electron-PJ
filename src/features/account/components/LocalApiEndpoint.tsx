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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Play, Plus, RefreshCw, Square, Trash2, Zap } from "lucide-react";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useUser } from "@/features/auth/hooks/useUser";
import {
  PROVIDER_MODELS,
  BRAND_ASSETS,
  getProviderDisplayName,
} from "@/shared/config/providermodels";

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};

type ModelAlias = { alias: string; provider: string; model: string };

export const LocalApiEndpoint = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: userdata } = useUser();
  const [running, setRunning] = useState(false);
  const [url, setUrl] = useState("http://127.0.0.1:8787/v1");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelAliases, setModelAliases] = useState<ModelAlias[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

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

    (window as any).api
      ?.getModelAliases?.()
      .then((aliases: ModelAlias[]) => {
        if (aliases) setModelAliases(aliases);
      })
      .catch(() => {});
  }, []);

  const hostmap: Record<string, string> = {};
  Api.forEach((item) => {
    if (item.host) hostmap[item.provider.toLowerCase()] = item.host;
  });

  const configuredProviders = Api.map((k) => k.provider.toLowerCase());

  const availableModels: { provider: string; model: string; label: string }[] = [];
  for (const provider of configuredProviders) {
    const models = PROVIDER_MODELS[provider];
    if (models) {
      for (const m of models) {
        availableModels.push({
          provider,
          model: m.model,
          label: `${getProviderDisplayName(provider)} — ${m.model}`,
        });
      }
    }
  }

  const modelsMap: Record<string, { model: string }[]> = {};
  for (const provider of configuredProviders) {
    const models = PROVIDER_MODELS[provider];
    if (models) {
      modelsMap[provider] = models.map((m) => ({ model: m.model }));
    }
  }

  for (const alias of modelAliases) {
    if (!modelsMap[alias.provider]) {
      modelsMap[alias.provider] = [];
    }
    if (!modelsMap[alias.provider].some((m) => m.model === alias.model)) {
      modelsMap[alias.provider].push({ model: alias.model });
    }
  }

  const handleAddAlias = async () => {
    if (!newAlias.trim()) {
      toast.error("Alias name is required");
      return;
    }
    if (!selectedProvider || !selectedModel) {
      toast.error("Select a provider and model");
      return;
    }
    const alias = newAlias.trim();
    if (modelAliases.some((a) => a.alias === alias)) {
      toast.error("Alias already exists");
      return;
    }
    const updated = [...modelAliases, { alias, provider: selectedProvider, model: selectedModel }];
    setModelAliases(updated);
    setNewAlias("");
    setSelectedProvider("");
    setSelectedModel("");
    await (window as any).api?.saveModelAliases?.(updated);
    toast.success(`Model alias "${alias}" added`);
  };

  const handleRemoveAlias = async (alias: string) => {
    const updated = modelAliases.filter((a) => a.alias !== alias);
    setModelAliases(updated);
    await (window as any).api?.saveModelAliases?.(updated);
    toast.success(`Model alias "${alias}" removed`);
  };

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

  const handleRegenerateKey = async () => {
    try {
      const key = await (window as any).api.regenerateLocalApiKey();
      if (key) {
        setApiKey(key);
        toast.success("New API key generated");
      }
    } catch {
      toast.error("Failed to generate API key");
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
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleRegenerateKey}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Generate
            </Button>
          </div>
          <div className="relative">
            <Input
              value={apiKey}
              readOnly
              type={showApiKey ? "text" : "password"}
              className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base font-mono pr-10"
              placeholder="Start the server to generate an API key"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Model ID Configuration
          </Label>
          <p className="text-xs text-muted-foreground">
            Map custom model IDs for Copilot, Codex, or IDE tools.
          </p>
          {configuredProviders.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No providers configured. Add API keys in Service Providers first.
            </p>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">Alias</Label>
                <Input
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="e.g. gpt-4o"
                  className="w-40 h-10 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">Provider</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={(v) => {
                    setSelectedProvider(v);
                    setSelectedModel("");
                  }}
                >
                  <SelectTrigger className="w-48 h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {configuredProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        <div className="flex items-center gap-2">
                          <img
                            src={BRAND_ASSETS[provider]}
                            className="w-4 h-4 rounded bg-white object-contain"
                          />
                          <span>{getProviderDisplayName(provider)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">Model</Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={!selectedProvider}
                >
                  <SelectTrigger className="w-64 h-10 rounded-lg text-sm">
                    <SelectValue
                      placeholder={selectedProvider ? "Select model" : "Pick provider first"}
                    >
                      {selectedModel && selectedProvider && (
                        <div className="flex items-center gap-2">
                          <img
                            src={BRAND_ASSETS[selectedProvider]}
                            className="w-4 h-4 rounded bg-white object-contain"
                          />
                          <span>{selectedModel}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider &&
                      PROVIDER_MODELS[selectedProvider]?.map((m) => (
                        <SelectItem key={m.model} value={m.model}>
                          <div className="flex items-center gap-2">
                            <img
                              src={BRAND_ASSETS[selectedProvider]}
                              className="w-4 h-4 rounded bg-white object-contain"
                            />
                            <span>{m.model}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="h-10 px-3" onClick={handleAddAlias}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          {modelAliases.length > 0 && (
            <div className="space-y-2">
              {modelAliases.map((a) => (
                <div
                  key={a.alias}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                      {a.alias}
                    </code>
                    <span className="text-muted-foreground">&rarr;</span>
                    <code className="font-mono text-xs text-muted-foreground">
                      {a.provider}/{a.model}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemoveAlias(a.alias)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
