import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../shared/components/ui/radio-group";
import { Spinner } from "../../../shared/components/ui/spinner";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { slackauth } from "../../slack/api/api";
import { notionauth } from "../../notion/api/api";
import { telegramauth } from "../../telegram/api/api";
import { googleauth } from "../../google/api/api";
import { n8nauth } from "../../n8n/api/api";

type ServiceType = "slack" | "notion" | "telegram" | "googlesheet" | "googledocs" | "n8n";

interface ServiceConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: ServiceType | null;
    onConnected: () => void;
}

const SERVICE_INFO: Record<ServiceType, { name: string; icon: string; description: string }> = {
    slack: { name: "Slack", icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg", description: "Connect your Slack workspace to read channels and send messages." },
    notion: { name: "Notion", icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png", description: "Connect your Notion workspace to read and write pages." },
    telegram: { name: "Telegram", icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg", description: "Connect Telegram to read chats and send messages." },
    googlesheet: { name: "Google Sheets", icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg", description: "Connect Google Sheets with a service account." },
    googledocs: { name: "Google Docs", icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg", description: "Connect Google Docs with a service account." },
    n8n: { name: "n8n", icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg", description: "Connect your n8n instance to manage workflows." },
};

const COUNTRY_CODES = [
    { code: "+1", label: "US", flag: "🇺🇸" },
    { code: "+44", label: "UK", flag: "🇬🇧" },
    { code: "+81", label: "JP", flag: "🇯🇵" },
    { code: "+82", label: "KR", flag: "🇰🇷" },
    { code: "+49", label: "DE", flag: "🇩🇪" },
    { code: "+33", label: "FR", flag: "🇫🇷" },
    { code: "+39", label: "IT", flag: "🇮🇹" },
    { code: "+34", label: "ES", flag: "🇪🇸" },
    { code: "+55", label: "BR", flag: "🇧🇷" },
    { code: "+86", label: "CN", flag: "🇨🇳" },
    { code: "+91", label: "IN", flag: "🇮🇳" },
    { code: "+61", label: "AU", flag: "🇦🇺" },
    { code: "+7", label: "RU", flag: "🇷🇺" },
    { code: "+380", label: "UA", flag: "🇺🇦" },
    { code: "+48", label: "PL", flag: "🇵🇱" },
    { code: "+351", label: "PT", flag: "🇵🇹" },
    { code: "+352", label: "LU", flag: "🇱🇺" },
    { code: "+47", label: "NO", flag: "🇳🇴" },
    { code: "+46", label: "SE", flag: "🇸🇪" },
    { code: "+45", label: "DK", flag: "🇩🇰" },
    { code: "+358", label: "FI", flag: "🇫🇮" },
    { code: "+41", label: "CH", flag: "🇨🇭" },
    { code: "+43", label: "AT", flag: "🇦🇹" },
    { code: "+31", label: "NL", flag: "🇳🇱" },
    { code: "+32", label: "BE", flag: "🇧🇪" },
    { code: "+852", label: "HK", flag: "🇭🇰" },
    { code: "+65", label: "SG", flag: "🇸🇬" },
    { code: "+60", label: "MY", flag: "🇲🇾" },
    { code: "+66", label: "TH", flag: "🇹🇭" },
    { code: "+63", label: "PH", flag: "🇵🇭" },
    { code: "+62", label: "ID", flag: "🇮🇩" },
    { code: "+84", label: "VN", flag: "🇻🇳" },
    { code: "+90", label: "TR", flag: "🇹🇷" },
    { code: "+20", label: "EG", flag: "🇪🇬" },
    { code: "+27", label: "ZA", flag: "🇿🇦" },
    { code: "+234", label: "NG", flag: "🇳🇬" },
    { code: "+254", label: "KE", flag: "🇰🇪" },
    { code: "+52", label: "MX", flag: "🇲🇽" },
    { code: "+54", label: "AR", flag: "🇦🇷" },
    { code: "+56", label: "CL", flag: "🇨🇱" },
    { code: "+57", label: "CO", flag: "🇨🇴" },
    { code: "+51", label: "PE", flag: "🇵🇪" },
];

export const ServiceConfigDialog = ({ open, onOpenChange, service, onConnected }: ServiceConfigDialogProps) => {
    const [step, setStep] = useState<"form" | "connecting" | "success">("form");
    const info = service ? SERVICE_INFO[service] : null;

    useEffect(() => {
        if (open) {
            setStep("form");
        }
    }, [open, service]);

    if (!service || !info) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <img src={info.icon} alt={info.name} className="w-8 h-8 rounded bg-white dark:bg-card object-contain" />
                        <div>
                            <DialogTitle>Connect {info.name}</DialogTitle>
                            <DialogDescription>{info.description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {step === "form" && (
                    <ServiceForm service={service} onComplete={() => {
                        setStep("success");
                        onConnected();
                    }} />
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="text-sm text-muted-foreground">Successfully connected to {info.name}!</p>
                        <Button onClick={() => onOpenChange(false)} className="bg-cyan-500 dark:bg-white">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const ServiceForm = ({ service, onComplete }: { service: ServiceType; onComplete: () => void }) => {
    switch (service) {
        case "slack":
            return <SlackForm onComplete={onComplete} />;
        case "notion":
            return <NotionForm onComplete={onComplete} />;
        case "telegram":
            return <TelegramForm onComplete={onComplete} />;
        case "googlesheet":
        case "googledocs":
            return <GoogleForm onComplete={onComplete} />;
        case "n8n":
            return <N8nForm onComplete={onComplete} />;
        default:
            return null;
    }
};

export const SlackForm = ({ onComplete }: { onComplete: () => void }) => {
    const [checking, setChecking] = useState(false);
    const [polling, setPolling] = useState(false);

    const connect = async () => {
        try {
            const response = await slackauth.slackstate();
            const stateId = response.stateId;
            const clientid = import.meta.env.VITE_SLACK_CLIENT_ID;
            if (!clientid) {
                toast.error("Slack Client ID not configured.");
                return;
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
            const redirecturi = encodeURIComponent(`${backendUrl}/slack/api/callback`);
            const scopes = [
                "channels:history", "groups:history", "im:history", "mpim:history",
                "users:read", "chat:write", "team:read", "channels:read",
                "groups:read", "mpim:read", "im:read"
            ].join(",");

            const url = `https://slack.com/oauth/v2/authorize?client_id=${clientid}&user_scope=${scopes}&redirect_uri=${redirecturi}&state=${stateId}&response_type=code`;
            (window.ipcRenderer as any).openInBrowser(url);
            setChecking(true);
            setPolling(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to initiate Slack connection.");
        }
    };

    useEffect(() => {
        if (!polling) return;
        let timeout: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        const poll = async () => {
            try {
                const status = await slackauth.slackcheckstatus();
                if (status.success) {
                    setPolling(false);
                    toast.success("Connected to Slack!");
                    onComplete();
                }
            } catch {}
        };

        interval = setInterval(poll, 2000);
        timeout = setTimeout(() => {
            setPolling(false);
            clearInterval(interval);
            toast.error("Connection timed out. Please try again.");
        }, 180000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [polling, onComplete]);

    return (
        <div className="flex flex-col gap-4 py-4">
            {checking ? (
                <div className="flex flex-col items-center gap-3 py-4">
                    <Spinner className="w-6 h-6 text-cyan-500" />
                    <p className="text-sm text-muted-foreground">Waiting for Slack authorization...</p>
                    <p className="text-xs text-muted-foreground">A browser window has opened. Complete the authorization there.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Click the button below to open Slack's authorization page. You'll be asked to grant access to your workspace.
                    </p>
                    <Button onClick={connect} className="bg-cyan-500 dark:bg-white gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Authorize with Slack
                    </Button>
                </>
            )}
        </div>
    );
};

export const NotionForm = ({ onComplete }: { onComplete: () => void }) => {
    const [checking, setChecking] = useState(false);
    const [polling, setPolling] = useState(false);

    const connect = async () => {
        try {
            const response = await notionauth.notionstate();
            const stateId = response.stateId;
            const clientid = import.meta.env.VITE_NOTION_CLIENT_ID;
            if (!clientid) {
                toast.error("Notion Client ID not configured.");
                return;
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
            const redirecturi = encodeURIComponent(`${backendUrl}/notion/api/callback`);

            const url = `https://api.notion.com/v1/oauth/authorize?client_id=${clientid}&response_type=code&owner=user&redirect_uri=${redirecturi}&state=${stateId}`;
            (window.ipcRenderer as any).openInBrowser(url);
            setChecking(true);
            setPolling(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to initiate Notion connection.");
        }
    };

    useEffect(() => {
        if (!polling) return;
        let timeout: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        const poll = async () => {
            try {
                const status = await notionauth.notioncheckstatus();
                if (status.success) {
                    setPolling(false);
                    toast.success("Connected to Notion!");
                    onComplete();
                }
            } catch {}
        };

        interval = setInterval(poll, 2000);
        timeout = setTimeout(() => {
            setPolling(false);
            clearInterval(interval);
            toast.error("Connection timed out. Please try again.");
        }, 180000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [polling, onComplete]);

    return (
        <div className="flex flex-col gap-4 py-4">
            {checking ? (
                <div className="flex flex-col items-center gap-3 py-4">
                    <Spinner className="w-6 h-6 text-cyan-500" />
                    <p className="text-sm text-muted-foreground">Waiting for Notion authorization...</p>
                    <p className="text-xs text-muted-foreground">A browser window has opened. Complete the authorization there.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Click the button below to open Notion's authorization page. You'll be asked to grant access to your workspace.
                    </p>
                    <Button onClick={connect} className="bg-cyan-500 dark:bg-white gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Authorize with Notion
                    </Button>
                </>
            )}
        </div>
    );
};

export const TelegramForm = ({ onComplete }: { onComplete: () => void }) => {
    const [countryCode, setCountryCode] = useState("+1");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [phoneCode, setPhoneCode] = useState("");
    const [step, setStep] = useState<"phone" | "code">("phone");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        try {
            const Country = countryCode.replace(/\D/g, "");
            let Local = phoneNumber;
            if (Local.startsWith("0")) Local = Local.substring(1);
            const formattedPhone = `${Country}${Local}`;

            setLoading(true);
            const response = await telegramauth.telegramservicecreate(formattedPhone, password);
            if (response.success) {
                toast.success(response.message || "Verification code sent!");
                setStep("code");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        try {
            setLoading(true);
            const response = await telegramauth.telegramverify(phoneCode);
            if (response.success) {
                toast.success(response.message || "Connected to Telegram!");
                onComplete();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to verify code.");
        } finally {
            setLoading(false);
        }
    };

    if (step === "code") {
        return (
            <div className="flex flex-col gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                    Enter the verification code sent to your Telegram.
                </p>
                <div className="flex flex-col gap-2">
                    <Label>Verification Code</Label>
                    <Input
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        placeholder="12345"
                    />
                </div>
                <Button onClick={handleVerifyCode} disabled={loading || !phoneCode} className="bg-cyan-500 dark:bg-white">
                    {loading ? <Spinner className="w-4 h-4" /> : "Verify"}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
                Enter your Telegram phone number. You'll receive a verification code.
            </p>
            <div className="flex gap-2">
                <div className="w-28">
                    <Label>Country</Label>
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full h-9 rounded-md border bg-transparent px-2 text-sm"
                    >
                        {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <Label>Phone Number</Label>
                    <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="1234567890"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>2FA Password (optional)</Label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Only if you have 2FA enabled"
                />
            </div>
            <Button onClick={handleSendCode} disabled={loading || !phoneNumber} className="bg-cyan-500 dark:bg-white">
                {loading ? <Spinner className="w-4 h-4" /> : "Send Verification Code"}
            </Button>
        </div>
    );
};

export const GoogleForm = ({ onComplete }: { onComplete: () => void }) => {
    const [serviceEmail, setServiceEmail] = useState("");
    const [serviceKey, setServiceKey] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        if (!serviceEmail.trim() || !serviceKey.trim()) {
            toast.error("Please fill in both fields.");
            return;
        }
        try {
            setLoading(true);
            const response = await googleauth.addservice(serviceEmail, serviceKey);
            if (response.success) {
                toast.success(response.message || "Connected to Google!");
                onComplete();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to connect.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
                Enter your Google Cloud service account credentials. The service email and private key are needed.
            </p>
            <div className="flex flex-col gap-2">
                <Label>Service Account Email</Label>
                <Input
                    value={serviceEmail}
                    onChange={(e) => setServiceEmail(e.target.value)}
                    placeholder="your-service@project.iam.gserviceaccount.com"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Private Key (JSON)</Label>
                <textarea
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    placeholder='Paste the entire private key JSON here...'
                    className="min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none"
                />
            </div>
            <Button onClick={handleConnect} disabled={loading || !serviceEmail || !serviceKey} className="bg-cyan-500 dark:bg-white">
                {loading ? <Spinner className="w-4 h-4" /> : "Connect"}
            </Button>
        </div>
    );
};

export const N8nForm = ({ onComplete }: { onComplete: () => void }) => {
    const [url, setUrl] = useState("");
    const [authType, setAuthType] = useState("none");
    const [authValue, setAuthValue] = useState("");
    const [testing, setTesting] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const handleTest = async () => {
        if (!url.trim()) {
            toast.error("Please enter an n8n URL.");
            return;
        }
        try {
            setTesting(true);
            const result = await n8nauth.testConnection(url.trim(), authType, authValue || undefined);
            if (result.success) {
                toast.success(`Connection successful! Mode: ${result.data.mode}`);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Connection test failed.");
        } finally {
            setTesting(false);
        }
    };

    const handleConnect = async () => {
        if (!url.trim()) {
            toast.error("Please enter an n8n URL.");
            return;
        }
        try {
            setConnecting(true);
            const authVal = authType === "none" ? undefined : authValue || undefined;
            const result = await n8nauth.connect(url.trim(), authType, authVal);
            if (result.success) {
                toast.success("Connected to n8n!");
                onComplete();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to connect.");
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
                Enter your n8n instance URL and authentication details.
            </p>
            <div className="flex flex-col gap-2">
                <Label>n8n URL</Label>
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-n8n-instance.com"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Authentication Type</Label>
                <RadioGroup value={authType} onValueChange={setAuthType}>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="none" id="n8n-none" />
                        <Label htmlFor="n8n-none" className="font-normal">None (Webhook only)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="apikey" id="n8n-apikey" />
                        <Label htmlFor="n8n-apikey" className="font-normal">API Key</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="cookie" id="n8n-cookie" />
                        <Label htmlFor="n8n-cookie" className="font-normal">Cookie</Label>
                    </div>
                </RadioGroup>
            </div>
            {authType !== "none" && (
                <div className="flex flex-col gap-2">
                    <Label>{authType === "apikey" ? "API Key" : "Cookie Value"}</Label>
                    <Input
                        type="password"
                        value={authValue}
                        onChange={(e) => setAuthValue(e.target.value)}
                        placeholder={authType === "apikey" ? "Enter your API key" : "Enter your cookie value"}
                    />
                </div>
            )}
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleTest} disabled={testing || !url} className="flex-1">
                    {testing ? <Spinner className="w-4 h-4" /> : "Test Connection"}
                </Button>
                <Button onClick={handleConnect} disabled={connecting || !url} className="flex-1 bg-cyan-500 dark:bg-white">
                    {connecting ? <Spinner className="w-4 h-4" /> : "Connect"}
                </Button>
            </div>
        </div>
    );
};
