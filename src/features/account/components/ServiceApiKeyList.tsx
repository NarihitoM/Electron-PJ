import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Key, Save, ShieldCheck, Trash } from "lucide-react";
import { toast } from "sonner";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAddServiceKey } from "@/features/services/hooks/useAddServiceKey";
import { useDeleteServiceKey } from "@/features/services/hooks/useDeleteServiceKey";
import { clearModelCache } from "@/shared/config/providermodels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import Gemini from "@/shared/assets/gemini.png"
import Anthropic from "@/shared/assets/claude.png"
import Groq from "@/shared/assets/groq.png"
import OpenAi from "@/shared/assets/openai.png"
import OpenRouter from "@/shared/assets/openrouter.png"
import Mistral from "@/shared/assets/mistralai.png"
import Deepseek from "@/shared/assets/deepseek.png"
import OllamaAsset from "@/shared/assets/ollama.png"
import ZAI from "@/shared/assets/zai.svg"
import MultimateLogo from "@/shared/assets/Multimate.png"

const BRAND_ASSETS: Record<string, string> = {
  openai: OpenAi,
  groq: Groq,
  anthropic: Anthropic,
  gemini: Gemini,
  openrouter: OpenRouter,
  mistral: Mistral,
  deepseek: Deepseek,
  ollama: OllamaAsset,
  zai: ZAI,
  zen: MultimateLogo,
};

const API_KEY_PROVIDERS = [
  { name: "openai", displayName: "OpenAi", icon: OpenAi },
  { name: "groq", displayName: "Groq", icon: Groq },
  { name: "anthropic", displayName: "Anthropic", icon: Anthropic },
  { name: "gemini", displayName: "Gemini", icon: Gemini },
  { name: "openrouter", displayName: "OpenRouter", icon: OpenRouter },
  { name: "mistral", displayName: "Mistral", icon: Mistral },
  { name: "deepseek", displayName: "Deepseek", icon: Deepseek },
  { name: "ollama", displayName: "Ollama", icon: OllamaAsset },
  { name: "zai", displayName: "Z.AI", icon: ZAI },
  { name: "zen", displayName: "MultimateAi (Free)", icon: MultimateLogo },
];

const ProviderUI = ({ name, placeholder }: { name: string; placeholder: string }) => {
  const { data: Api } = useServiceKeys();
  const addMutation = useAddServiceKey();
  const deleteMutation = useDeleteServiceKey();
  const [key, setkey] = useState("");

  const addkey = async () => {
    try {
      const response = await addMutation.mutateAsync({ provider: name, key });
      if (response.success) {
        toast.success(response.message);
        clearModelCache(name);
        setkey("");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  const deletekey = async () => {
    try {
      const entry = Api?.find(s => s.provider.toLowerCase() === name.toLowerCase());
      const id = entry?.id;
      const response = await deleteMutation.mutateAsync(id!);
      if (response.success) {
        toast.success(response.message);
        clearModelCache(name);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  const isvalidkey = Api?.find(s => s.provider.toLowerCase() === name.toLowerCase());

  return (
    <Card className="border-none bg-card shadow-none mt-6 p-4 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 dark:bg-white rounded-lg">
            <img src={BRAND_ASSETS[name]} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">{name.charAt(0).toUpperCase() + name.slice(1)} API</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure your provider credential.
            </CardDescription>
          </div>
          {isvalidkey && (
            <span className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
              Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Secret API Key
            </Label>
            <span className="text-[11px] text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="w-5 h-5" /> Encrypted
            </span>
          </div>
          <Input
            value={key}
            onChange={(e) => setkey(e.target.value)}
            type="password"
            placeholder={placeholder}
            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base"
          />
          <div className="flex flex-row gap-3">
            <Button disabled={addMutation.isPending} onClick={addkey} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
              {addMutation.isPending ? <Spinner /> :
                isvalidkey ?
                  (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Change Key
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Key
                    </>
                  )
              }
            </Button>
            {isvalidkey && <Button disabled={deleteMutation.isPending} variant="destructive" onClick={deletekey} className="h-12 px-8 rounded-xl font-semibold transition-all">
              {deleteMutation.isPending ? <Spinner /> :
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </>
              }
            </Button>
            }
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-xs dark:text-muted-foreground text-cyan-500 leading-relaxed">
            <strong>Tip:</strong> You can find your {name} keys in your developer dashboard. We also encrypt for security purpose.
            Never share these keys with anyone.
          </p>
        </div>
      </CardContent>
    </Card >
  )
};

const OllamaUI = () => {
  const { data: Api } = useServiceKeys();
  const addMutation = useAddServiceKey();
  const deleteMutation = useDeleteServiceKey();
  const [host, setHost] = useState("");
  const [apiKey, setApiKey] = useState("");
  const savedConfig = Api?.find(s => s.provider.toLowerCase() === "ollama");

  const addkey = async () => {
    try {
      const response = await addMutation.mutateAsync({ provider: "ollama", key: apiKey, host: host || undefined });
      if (response.success) {
        toast.success(response.message);
        clearModelCache("ollama");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  const deletekey = async () => {
    try {
      const entry = Api?.find(s => s.provider.toLowerCase() === "ollama");
      const id = entry?.id;
      const response = await deleteMutation.mutateAsync(id!);
      if (response.success) {
        toast.success(response.message);
        clearModelCache("ollama");
        setHost("");
        setApiKey("");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.")
      }
    }
  }

  return (
    <Card className="border-none bg-card shadow-none mt-6 p-4 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 dark:bg-white rounded-lg">
            <img src={BRAND_ASSETS["ollama"]} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Ollama</CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect to Ollama locally or via cloud.
            </CardDescription>
          </div>
          {savedConfig && (
            <span className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
              Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Ollama Host URL
            </Label>
          </div>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            type="url"
            placeholder="http://localhost:11434"
            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              API Key <span className="text-muted-foreground">(optional - for cloud)</span>
            </Label>
          </div>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            placeholder="Ollama API Key..."
            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30 text-base"
          />
        </div>

        <div className="flex flex-row gap-3">
          <Button disabled={addMutation.isPending} onClick={addkey} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
            {addMutation.isPending ? <Spinner /> :
              savedConfig ?
                (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Change Key
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )
            }
          </Button>
          {savedConfig && <Button disabled={deleteMutation.isPending} variant="destructive" onClick={deletekey} className="h-12 px-8 rounded-xl font-semibold transition-all">
            {deleteMutation.isPending ? <Spinner /> :
              <>
                <Trash className="w-4 h-4 mr-2" />
                Disconnect
              </>
            }
          </Button>
          }
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-xs dark:text-muted-foreground text-cyan-500 leading-relaxed">
            <strong>Tip:</strong> For local Ollama, use <code className="bg-cyan-500/10 px-1 rounded">http://localhost:11434</code> and leave API key empty.
            For Ollama Cloud, use <code className="bg-cyan-500/10 px-1 rounded">https://ollama.com</code> and provide your API key from <a className="underline" href="https://ollama.com/settings/keys" target="_blank" rel="noreferrer">ollama.com/settings/keys</a>.
          </p>
        </div>
      </CardContent>
    </Card >
  )
};

const ZenUI = () => {
  return (
    <Card className="border-none bg-card shadow-none mt-6 p-4 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 dark:bg-white rounded-lg">
            <img src={MultimateLogo} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">MultimateAi (Free)</CardTitle>
            <CardDescription className="text-muted-foreground">
              Server-side free AI models — no API key needed.
            </CardDescription>
          </div>
          <span className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
            Active
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 space-y-6">
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-xs dark:text-muted-foreground text-cyan-500 leading-relaxed">
            <strong>MultimateAi (Free)</strong> is a pre-configured free AI provider.
            You get <strong>50 free credits every month</strong>, and each AI call
            uses 1 credit. Select <strong>MultimateAi (Free)</strong> as your provider
            in the chat dropdown, pick a free model, and start chatting — credits
            are deducted automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const ServiceApiKeyList = () => {
    const [selectedProvider, setSelectedProvider] = useState("openai");
    return (
        <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-1 mb-2">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Key className="w-6 h-6 text-cyan-500 dark:text-white " /> Service Providers
                </h1>
                <p className="text-muted-foreground">Configure your API providers and model preferences.</p>
            </div>

            <div className="mt-5">
                <Select value={selectedProvider} onValueChange={(value: string | null) => {
                    if (value) setSelectedProvider(value);
                }}>
                    <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select provider">
                            {selectedProvider && (
                                <div className="flex items-center gap-2">
                                    <img
                                        src={API_KEY_PROVIDERS.find(p => p.name === selectedProvider)?.icon}
                                        className="bg-white rounded-lg w-5 h-5 p-0.5 object-contain shrink-0"
                                    />
                                    <span>{API_KEY_PROVIDERS.find(p => p.name === selectedProvider)?.displayName}</span>
                                </div>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {API_KEY_PROVIDERS.map((provider) => (
                            <SelectItem key={provider.name} value={provider.name}>
                                <div className="flex items-center gap-2">
                                    <img src={provider.icon} className="bg-white rounded-lg w-5 h-5 p-0.5 object-contain shrink-0" />
                                    <span>{provider.displayName}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedProvider === "ollama" ? <OllamaUI /> : selectedProvider === "zen" ? <ZenUI /> : <ProviderUI name={selectedProvider} placeholder={`${API_KEY_PROVIDERS.find(p => p.name === selectedProvider)?.displayName || selectedProvider} API Key...`} />}
        </div>
    );
};
