import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Gemini from "../../src/assets/gemini.png"
import Anthropic from "../../src/assets/claude.png"
import Groq from "../../src/assets/groq.png"
import OpenAi from "../../src/assets/openai.png"
import OpenRouter from "../../src/assets/openrouter.png"
import Mistral from "../../src/assets/mistralai.png"
import { Key, Save, ShieldCheck, Trash } from "lucide-react";
import { authservicestore } from "@/store/serviceauthstore";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { telegramauthstore } from "@/store/telegramauthstore";
import { useNavigate } from "react-router-dom";
import { googleauthstore } from "@/store/googleauthstore";
import { GoogleIcon } from "@/components/ui/googleicon";
import { notionauthstore } from "@/store/notionauthstore";
import { Badge } from "@/components/ui/badge";
import { useslackstore } from "@/store/slackauthstore";
import { BRAND_ASSETS } from "@/features/providermodels";

const ProviderUI = (
    {
        name,
        placeholder,
        isconfigure
    }: {
        name: string,
        placeholder: string,
        isconfigure: boolean
    }) => {

    //Store
    const {
        addservicekey,
        loading,
        deleteservicekey,
        loadingdelete,
        Api
    } = authservicestore();


    //States
    const [key, setkey] = useState<string>("");

    //Functions
    const addkey = async () => {
        try {
            const response = await addservicekey(name, key);
            if (response.success) {
                toast.success(response.message);
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
            const key = Api.find(s => s.provider.toLowerCase() === name.toLowerCase());
            const id = key?.id;
            const response = await deleteservicekey(id!);
            if (response.success) {
                toast.success(response.message);
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

    const isvalidkey = Api.find(s => s.provider.toLowerCase() === name.toLowerCase());

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
                        {isconfigure && (
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                Active
                            </Badge>
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
                            <Button disabled={loading} onClick={addkey} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
                                {loading ? <Spinner /> :
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
                            {isvalidkey && <Button disabled={loadingdelete} variant="destructive" onClick={deletekey} className="h-12 px-8 rounded-xl font-semibold transition-all">
                                {loadingdelete ? <Spinner /> :
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


export const Settings = () => {
    //Store
    const {
        fetchservicekey,
        loadingfetch,
        Api,
        hasfetch
    } = authservicestore();

    const {
        telegramfetchdata,
        loadingfetch: telegramfetch,
        userdata,
        telegramservicereset,
        loadingdeleteservice,
        hasfetch: telegramhasfetch
    } = telegramauthstore();

    const {
        fetchgoogleservice,
        loadingfetch: googlefetch,
        serviceemail,
        deletegoogleservice,
        loadinggoogleservicedelete,
        hasfetch: googlehasfetch
    } = googleauthstore();

    const {
        workspacename,
        fetchnotionacc,
        loadingnotion,
        deletenotionservice,
        loadingnotiondelete,
        hasfetch: notionhasfetch
    } = notionauthstore()

    const {
        workspace,
        fetchslackacc,
        loadingslack,
        deleteslackservice,
        loadingslackdelete,
        hasfetch: slackhasfetch,
    } = useslackstore()

    useEffect(() => {
        fetchnotionacc();
    }, [notionhasfetch])

    useEffect(() => {
        fetchgoogleservice();
    }, [googlehasfetch])

    useEffect(() => {
        telegramfetchdata();
    }, [telegramhasfetch])

    useEffect(() => {
        fetchslackacc();
    }, [slackhasfetch])

    //Fetchtheservicekey
    useEffect(() => {
        fetchservicekey();
    }, [hasfetch])

    const navigate = useNavigate();

    const getProviderData = (name: string) =>
        Api.find(s => s.provider.toLowerCase() === name.toLowerCase());

    //Telegram servicedelete
    const deletetelegram = async () => {
        try {
            const response = await telegramservicereset();
            if (response.success) {
                toast.success(response.message);
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

    //Googleservicedelete
    const deletegoogle = async () => {
        try {
            const response = await deletegoogleservice();
            if (response.success) {
                toast.success(response.message);
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

    //Notionservicedelete
    const deletenotion = async () => {
        try {
            const response = await deletenotionservice();
            if (response.success) {
                toast.success(response.message);
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


    //Slackservicedelete
    const deleteslack = async () => {
        try {
            const response = await deleteslackservice();
            if (response.success) {
                toast.success(response.message);
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
        <div className="flex h-screen w-full flex-col bg-background">
            <div className="flex-1 flex-col">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Key className="w-6 h-6 text-cyan-500 dark:text-white "/> Service Providers</h1>
                        <p className="text-muted-foreground">Configure your API providers and model preferences.</p>
                    </div>

                    {loadingfetch ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                            <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                            <p className="text-sm animate-pulse">Fetching your credentials...</p>
                        </div>
                    ) : (
                        <Tabs defaultValue="openai" className="mt-5">
                            <TabsList className="bg-muted/50 p-2">
                                <TabsTrigger value="openai" className="py-3 px-3"><img src={OpenAi} className="bg-white rounded-lg w-5 h-5 p-0.5 object-contain shrink-0" /><span className="mr-2">OpenAi</span></TabsTrigger>
                                <TabsTrigger value="groq" className="py-3 px-3"><img src={Groq} className="bg-white p-0.5 rounded-lg w-5 h-5 object-contain shrink-0" /><span className="mr-2">Groq</span></TabsTrigger>
                                <TabsTrigger value="anthropic" className="py-3 px-3"><img src={Anthropic} className="bg-white p-0.5 rounded-lg w-5 h-5 object-contain shrink-0" /><span className="mr-2">Anthropic</span></TabsTrigger>
                                <TabsTrigger value="gemini" className="py-3 px-3"><img src={Gemini} className="bg-white p-0.5 rounded-lg w-5 h-5 object-contain shrink-0" /><span className="mr-2">Gemini</span></TabsTrigger>
                                <TabsTrigger value="openrouter" className="py-3 px-3"><img src={OpenRouter} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" /><span className="mr-2">OpenRouter</span></TabsTrigger>
                                <TabsTrigger value="mistral" className="py-3 px-3"><img src={Mistral} className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0" /><span className="mr-2">Mistral</span></TabsTrigger>
                            </TabsList>

                            {["OpenAI", "Groq", "Anthropic", "Gemini", "OpenRouter", "Mistral"].map((p) => (
                                <TabsContent key={p} value={p.toLowerCase()}>
                                    <ProviderUI
                                        name={p.toLowerCase()}
                                        placeholder={`${p} API Key...`}
                                        isconfigure={!!getProviderData(p)}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>
                <Separator className="mt-5" />
                <div className="mx-auto max-w-5xl mt-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <h1 className="text-2xl font-bold flex gap-2 items-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                                    alt="icon"
                                    className="w-6 h-6"
                                />
                                Telegram Service</h1>
                            {userdata &&
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Active
                                </Badge>}
                        </div>
                        <p className="text-muted-foreground">Configure your Telegram Account.</p>
                    </div>
                    <Card className="border-none bg-card shadow-none mt-6 p-1 animate-in fade-in slide-in-from-bottom-2">
                        <CardContent className="pt-2 pb-2">
                            <div className="flex flex-col items-center justify-center text-center py-4">
                                {telegramfetch ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                                        <p className="text-sm text-muted-foreground animate-pulse">Loading Telegram...</p>
                                    </div>
                                ) : userdata ? (
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                                                alt="icon"
                                            />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <p className="text-sm font-medium">Connected Account</p>
                                            <h3 className="text-lg font-semibold">{userdata.firstName?.substring(0, 10) + "..."} {userdata.lastName?.substring(0, 10)}</h3>
                                        </div>
                                        <Button onClick={deletetelegram} disabled={loadingdeleteservice} variant="destructive" className="ml-auto">
                                            {loadingdeleteservice ? <Spinner /> : "Disconnect"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                                                alt="icon"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No Telegram Account Linked</h3>
                                            <p className="text-xs text-muted-foreground max-w-62.5">
                                                Connect to your Telegram account.
                                            </p>
                                        </div>

                                        <Button onClick={() => navigate("/app/telegram")} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
                                            Connect Telegram
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Separator className="mt-5" />
                <div className="mx-auto max-w-5xl mt-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <h1 className="text-2xl font-bold flex gap-2 items-center">
                                <GoogleIcon />
                                Google Service
                            </h1>
                            {serviceemail &&
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Active
                                </Badge>}
                        </div>
                        <p className="text-muted-foreground">Configure your google service Account.</p>
                    </div>
                    <Card className="border-none bg-card shadow-none mt-6 p-1 animate-in fade-in slide-in-from-bottom-2">
                        <CardContent className="pt-2 pb-2">
                            <div className="flex flex-col items-center justify-center text-center py-4">
                                {googlefetch ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                                        <p className="text-sm text-muted-foreground animate-pulse">Loading Google Service...</p>
                                    </div>
                                ) : serviceemail ? (
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                            <GoogleIcon />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <p className="text-sm font-medium">Connected Service Account</p>
                                            <h3 className="text-lg font-semibold">{serviceemail.substring(0, 20) + "..."}</h3>
                                        </div>
                                        <Button onClick={deletegoogle} variant="destructive" className="ml-auto">
                                            {loadinggoogleservicedelete ? <Spinner /> : "Disconnect"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <GoogleIcon />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No google service account found!</h3>
                                            <p className="text-xs text-muted-foreground max-w-62.5">
                                                Connect to your google service account.
                                            </p>
                                        </div>

                                        <Button onClick={() => navigate("/app/googlesheet")} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
                                            Connect Google Service
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Separator className="mt-5" />
                <div className="mx-auto max-w-5xl mt-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <h1 className="text-2xl font-bold flex gap-2 items-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                                    alt="icon"
                                    className="w-6 h-6"
                                />
                                Notion Service
                            </h1>
                            {workspacename &&
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Active
                                </Badge>}
                        </div>
                        <p className="text-muted-foreground">Configure your notion workspace account.</p>
                    </div>
                    <Card className="border-none bg-card shadow-none mt-6 p-1 animate-in fade-in slide-in-from-bottom-2">
                        <CardContent className="pt-2 pb-2">
                            <div className="flex flex-col items-center justify-center text-center py-4">
                                {loadingnotion ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                                        <p className="text-sm text-muted-foreground animate-pulse">Loading Notion Service...</p>
                                    </div>
                                ) : workspacename ? (
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                                                alt="icon"
                                            />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <p className="text-sm font-medium">Connected Notion Workspace Account</p>
                                            <h3 className="text-lg font-semibold">{workspacename.substring(0, 20) + "..."}</h3>
                                        </div>
                                        <Button onClick={deletenotion} variant="destructive" className="ml-auto">
                                            {loadingnotiondelete ? <Spinner /> : "Disconnect"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="mx-auto w-12 h-12 rounded-full  flex items-center justify-center">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                                                alt="icon"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No notion account found!</h3>
                                            <p className="text-xs text-muted-foreground max-w-62.5">
                                                Connect to your notion workspace account.
                                            </p>
                                        </div>

                                        <Button onClick={() => navigate("/app/notion")} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
                                            Connect Notion
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Separator className="mt-5" />
                <div className="mx-auto max-w-5xl mt-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <h1 className="text-2xl font-bold flex gap-2 items-center">
                                <img
                                    src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                                    alt="icon"
                                    className="w-6 h-6"
                                />
                                Slack Service
                            </h1>
                            {workspacename &&
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Active
                                </Badge>}
                        </div>
                        <p className="text-muted-foreground">Configure your slack workspace account.</p>
                    </div>
                    <Card className="border-none bg-card shadow-none mt-6 p-1 animate-in fade-in slide-in-from-bottom-2">
                        <CardContent className="pt-2 pb-2">
                            <div className="flex flex-col items-center justify-center text-center py-4">
                                {loadingslack ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                                        <p className="text-sm text-muted-foreground animate-pulse">Loading Slack Service...</p>
                                    </div>
                                ) : workspace ? (
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-12 w-12 rounded-full  flex items-center justify-center">
                                            <img
                                                src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                                                alt="icon"
                                            />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <p className="text-sm font-medium">Connected Slack Workspace Account</p>
                                            <h3 className="text-lg font-semibold">{workspace.substring(0, 20) + "..."}</h3>
                                        </div>
                                        <Button onClick={deleteslack} variant="destructive" className="ml-auto">
                                            {loadingslackdelete ? <Spinner /> : "Disconnect"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <img
                                                src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                                                alt="icon"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No slack account found!</h3>
                                            <p className="text-xs text-muted-foreground max-w-62.5">
                                                Connect to your slack workspace account.
                                            </p>
                                        </div>

                                        <Button onClick={() => navigate("/app/slack")} className="h-12 px-8 rounded-xl font-semibold shadow-lg bg-cyan-500 dark:bg-white shadow-primary/10 hover:shadow-primary/20 transition-all">
                                            Connect Slack
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Separator className="mt-5" />
            </div>
        </div>
    )
}

