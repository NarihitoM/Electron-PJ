import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import Gemini from "@/shared/assets/gemini.png"
import Anthropic from "@/shared/assets/claude.png"
import Groq from "@/shared/assets/groq.png"
import OpenAi from "@/shared/assets/openai.png"
import OpenRouter from "@/shared/assets/openrouter.png"
import Mistral from "@/shared/assets/mistralai.png"
import Deepseek from "@/shared/assets/deepseek.png"
import Ollama from "@/shared/assets/ollama.png"
import { Key, Save, ShieldCheck, Trash, AlertTriangle } from "lucide-react";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useAddServiceKey } from "@/features/services/hooks/useAddServiceKey";
import { useDeleteServiceKey } from "@/features/services/hooks/useDeleteServiceKey";
import { useState } from "react";
import { Spinner } from "@/shared/components/ui/spinner";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { useTelegramAccount } from "@/features/telegram/hooks/useTelegramAccount";
import { telegramauth } from "@/features/telegram/api/api";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { googleauth } from "@/features/google/api/api";
import { useNotionAccount } from "@/features/notion/hooks/useNotionAccount";
import { notionauth } from "@/features/notion/api/api";
import { useSlackAccount } from "@/features/slack/hooks/useSlackAccount";
import { slackauth } from "@/features/slack/api/api";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { n8nauth } from "@/features/n8n/api/api";
import { clearModelCache } from "@/shared/config/providermodels";
import { ServiceApiKeyList } from "@/features/account/components/ServiceApiKeyList";
import { ServiceIntegrationList } from "@/features/account/components/ServiceIntegrationList";
import { ServiceDetailPanel } from "@/features/account/components/ServiceDetailPanel";
import { ServiceCardData } from "@/features/account/components/ServiceCard";

const ProviderUI = (
    {
        name,
        placeholder,
    }: {
        name: string,
        placeholder: string,
    }) => {

    const { data: Api } = useServiceKeys();
    const addMutation = useAddServiceKey();
    const deleteMutation = useDeleteServiceKey();

    const [key, setkey] = useState<string>("");

    const addkey = async () => {
        try {
            const response = await addMutation.mutateAsync({ provider: name, key });
            if (response.success) {
                toast.success(response.message);
                clearModelCache(name);
                setkey("");
            }
        }
        catch (err: unknown) {
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
        }
        catch (err: unknown) {
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
        <>
            <Toaster position="top-right" richColors />
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
        </>
    )
};


const OllamaUI = () => {
    const { data: Api } = useServiceKeys();
    const addMutation = useAddServiceKey();
    const deleteMutation = useDeleteServiceKey();

    const [host, setHost] = useState<string>("");
    const [apiKey, setApiKey] = useState<string>("");
    const savedConfig = Api?.find(s => s.provider.toLowerCase() === "ollama");

    const addkey = async () => {
        try {
            const response = await addMutation.mutateAsync({ provider: "ollama", key: apiKey, host: host || undefined });
            if (response.success) {
                toast.success(response.message);
                clearModelCache("ollama");
            }
        }
        catch (err: unknown) {
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
        }
        catch (err: unknown) {
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
        <>
            <Toaster position="top-right" richColors />
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
        </>
    )
};

const BRAND_ASSETS: Record<string, string> = {
    openai: OpenAi,
    groq: Groq,
    anthropic: Anthropic,
    gemini: Gemini,
    openrouter: OpenRouter,
    mistral: Mistral,
    deepseek: Deepseek,
    ollama: Ollama,
};

const API_KEY_PROVIDERS = [
    { name: "openai", displayName: "OpenAi", icon: OpenAi },
    { name: "groq", displayName: "Groq", icon: Groq },
    { name: "anthropic", displayName: "Anthropic", icon: Anthropic },
    { name: "gemini", displayName: "Gemini", icon: Gemini },
    { name: "openrouter", displayName: "OpenRouter", icon: OpenRouter },
    { name: "mistral", displayName: "Mistral", icon: Mistral },
    { name: "deepseek", displayName: "Deepseek", icon: Deepseek },
    { name: "ollama", displayName: "Ollama", icon: Ollama },
];

export const Settings = () => {
    const { isLoading: loadingfetch, refetch: providerRefetch, isError: providerError } = useServiceKeys();

    const { data: telegramData, isLoading: telegramfetch, refetch: telegramRefetch, isError: telegramError } = useTelegramAccount();
    const userdata = telegramData;

    const { data: googleServiceData, isLoading: googlefetch, refetch: googleRefetch, isError: googleError } = useGoogleService();
    const serviceemail = (googleServiceData as any)?.serviceemail ?? "";

    const { data: notionAccount, isLoading: loadingnotion, refetch: notionRefetch, isError: notionError } = useNotionAccount();
    const workspacename = (notionAccount as any)?.workspacename ?? "";

    const { data: slackAccount, isLoading: loadingslack, refetch: slackRefetch, isError: slackError } = useSlackAccount();
    const workspace = (slackAccount as any)?.workspace ?? "";

    const { data: n8nConfig, isLoading: loadingn8n, refetch: n8nRefetch, isError: n8nError } = useN8nConfig();
    const n8nConnected = !!((n8nConfig as any)?.connected ?? false);
    const n8nUrl = (n8nConfig as any)?.n8nUrl ?? "";

    const [deletingTelegram, setDeletingTelegram] = useState(false);
    const [deletingGoogle, setDeletingGoogle] = useState(false);
    const [deletingNotion, setDeletingNotion] = useState(false);
    const [, setDeletingSlack] = useState(false);
    const [, setDeletingN8n] = useState(false);

    const [search, setSearch] = useState("");
    const [dialogService, setDialogService] = useState<string | null>(null);

    const deletetelegram = async () => {
        setDeletingTelegram(true);
        try {
            const response = await telegramauth.telegramresetservice();
            if (response.success) {
                toast.success(response.message);
                setDialogService(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeletingTelegram(false);
        }
    }

    const deletegoogle = async () => {
        setDeletingGoogle(true);
        try {
            const response = await googleauth.deleteservice();
            if (response.success) {
                toast.success(response.message);
                setDialogService(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeletingGoogle(false);
        }
    }

    const deletenotion = async () => {
        setDeletingNotion(true);
        try {
            const response = await notionauth.notiondeleteservice();
            if (response.success) {
                toast.success(response.message);
                setDialogService(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeletingNotion(false);
        }
    }

    const deleteslack = async () => {
        setDeletingSlack(true);
        try {
            const response = await slackauth.deleteslackservice();
            if (response.success) {
                toast.success(response.message);
                setDialogService(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeletingSlack(false);
        }
    }

    const deleten8n = async () => {
        setDeletingN8n(true);
        try {
            const response = await n8nauth.n8ndeleteservice();
            if (response.success) {
                toast.success(response.message);
                setDialogService(null);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                toast.error(Error.response?.data?.message || err.message);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeletingN8n(false);
        }
    }

    const connectedServices: ServiceCardData[] = [
        { id: "telegram", name: "Telegram", icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg", description: "Configure your Telegram Account.", isActive: !!userdata },
        { id: "google", name: "Google Service", icon: null, description: "Configure your Google service Account.", isActive: !!serviceemail },
        { id: "notion", name: "Notion", icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png", description: "Configure your Notion workspace account.", isActive: !!workspacename },
        { id: "slack", name: "Slack", icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg", description: "Configure your Slack workspace account.", isActive: !!workspace },
        { id: "n8n", name: "n8n", icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg", description: "Configure your n8n workflow automation.", isActive: n8nConnected },
    ];

    const filteredServices = connectedServices.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );

    if (loadingfetch) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="flex flex-col gap-1 mb-6">
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64 animate-pulse" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-80 animate-pulse mt-1" />
                </div>

                <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-20 animate-pulse" />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-40 animate-pulse" />
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-60 animate-pulse mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" />
                        <div className="flex gap-3">
                            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 animate-pulse" />
                            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24 animate-pulse" />
                        </div>
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-96 animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-1 mt-8 mb-4">
                    <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48 animate-pulse" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-72 animate-pulse mt-1" />
                </div>

                <div className="h-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full animate-pulse mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24 animate-pulse" />
                                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-40 animate-pulse" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (providerError) {
        return (
            <div className="flex h-[calc(100vh-40px)] w-full flex-col gap-2 items-center justify-center py-16">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <h2 className="text-xl font-semibold">Failed to load providers</h2>
                <p className="text-sm text-muted-foreground">There was a problem connecting to the server.</p>
                <Button onClick={() => providerRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-1 mb-2">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Key className="w-6 h-6 text-cyan-500 dark:text-white " /> Service Providers
                    </h1>
                    <p className="text-muted-foreground">Configure your API providers and model preferences.</p>
                </div>

                <ServiceApiKeyList
                    providers={API_KEY_PROVIDERS}
                    renderProviderUI={(provider) => {
                        if (provider.name === "ollama") {
                            return <OllamaUI />;
                        }
                        return (
                            <ProviderUI
                                name={provider.name}
                                placeholder={`${provider.displayName} API Key...`}
                            />
                        );
                    }}
                />
            </div>

            <ServiceIntegrationList
                search={search}
                onSearchChange={setSearch}
                services={filteredServices}
                onServiceClick={setDialogService}
            />

            <ServiceDetailPanel
                dialogService={dialogService}
                onOpenChange={(open) => { if (!open) setDialogService(null); }}
                connectedServices={connectedServices}
                telegramfetch={telegramfetch}
                telegramError={telegramError}
                userdata={userdata}
                telegramRefetch={telegramRefetch}
                deletetelegram={deletetelegram}
                deletingTelegram={deletingTelegram}
                googlefetch={googlefetch}
                googleError={googleError}
                serviceemail={serviceemail}
                googleRefetch={googleRefetch}
                deletegoogle={deletegoogle}
                deletingGoogle={deletingGoogle}
                loadingnotion={loadingnotion}
                notionError={notionError}
                workspacename={workspacename}
                notionRefetch={notionRefetch}
                deletenotion={deletenotion}
                deletingNotion={deletingNotion}
                loadingslack={loadingslack}
                slackError={slackError}
                workspace={workspace}
                slackRefetch={slackRefetch}
                deleteslack={deleteslack}
                loadingn8n={loadingn8n}
                n8nError={n8nError}
                n8nConnected={n8nConnected}
                n8nUrl={n8nUrl}
                n8nRefetch={n8nRefetch}
                deleten8n={deleten8n}
                onServiceConnected={() => { setDialogService(null); }}
            />
        </>
    )
}
