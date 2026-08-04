import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../shared/components/ui/radio-group";
import { Spinner } from "../../../shared/components/ui/spinner";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, ChevronsUpDown, Search } from "lucide-react";
import { slackauth } from "../../slack/api/api";
import { notionauth } from "../../notion/api/api";
import { telegramauth } from "../../telegram/api/api";
import { googleauth } from "../../google/api/api";
import { n8nauth } from "../../n8n/api/api";
import { githubauth } from "../../github/api/api";
import { discordauth } from "../../discord/api/api";

type ServiceType =
  "slack" | "notion" | "telegram" | "googlesheet" | "googledocs" | "n8n" | "github" | "discord";

interface ServiceConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceType | null;
  onConnected: () => void;
}

const SERVICE_INFO: Record<ServiceType, { name: string; icon: string; description: string }> = {
  slack: {
    name: "Slack",
    icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
    description: "Connect your Slack workspace to read channels and send messages.",
  },
  notion: {
    name: "Notion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description: "Connect your Notion workspace to read and write pages.",
  },
  telegram: {
    name: "Telegram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    description: "Connect Telegram to read chats and send messages.",
  },
  googlesheet: {
    name: "Google Sheets",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    description: "Connect your Google account to read and edit Sheets.",
  },
  googledocs: {
    name: "Google Docs",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg",
    description: "Connect your Google account to read and edit Docs.",
  },
  n8n: {
    name: "n8n",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg",
    description: "Connect your n8n instance to manage workflows.",
  },
  github: {
    name: "GitHub",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    description: "Connect your GitHub account to browse repos, issues, and pull requests.",
  },
  discord: {
    name: "Discord",
    icon: "https://cdn.worldvectorlogo.com/logos/discord-6.svg",
    description: "Install the Multimate bot into your Discord server to send and read messages.",
  },
};

const COUNTRY_CODES = [
  { code: "+93", label: "AF", flag: "🇦🇫" },
  { code: "+355", label: "AL", flag: "🇦🇱" },
  { code: "+213", label: "DZ", flag: "🇩🇿" },
  { code: "+376", label: "AD", flag: "🇦🇩" },
  { code: "+244", label: "AO", flag: "🇦🇴" },
  { code: "+54", label: "AR", flag: "🇦🇷" },
  { code: "+374", label: "AM", flag: "🇦🇲" },
  { code: "+297", label: "AW", flag: "🇦🇼" },
  { code: "+61", label: "AU", flag: "🇦🇺" },
  { code: "+43", label: "AT", flag: "🇦🇹" },
  { code: "+994", label: "AZ", flag: "🇦🇿" },
  { code: "+973", label: "BH", flag: "🇧🇭" },
  { code: "+880", label: "BD", flag: "🇧🇩" },
  { code: "+375", label: "BY", flag: "🇧🇾" },
  { code: "+32", label: "BE", flag: "🇧🇪" },
  { code: "+501", label: "BZ", flag: "🇧🇿" },
  { code: "+229", label: "BJ", flag: "🇧🇯" },
  { code: "+975", label: "BT", flag: "🇧🇹" },
  { code: "+591", label: "BO", flag: "🇧🇴" },
  { code: "+387", label: "BA", flag: "🇧🇦" },
  { code: "+267", label: "BW", flag: "🇧🇼" },
  { code: "+55", label: "BR", flag: "🇧🇷" },
  { code: "+673", label: "BN", flag: "🇧🇳" },
  { code: "+359", label: "BG", flag: "🇧🇬" },
  { code: "+226", label: "BF", flag: "🇧🇫" },
  { code: "+257", label: "BI", flag: "🇧🇮" },
  { code: "+855", label: "KH", flag: "🇰🇭" },
  { code: "+237", label: "CM", flag: "🇨🇲" },
  { code: "+1", label: "CA", flag: "🇨🇦" },
  { code: "+238", label: "CV", flag: "🇨🇻" },
  { code: "+236", label: "CF", flag: "🇨🇫" },
  { code: "+235", label: "TD", flag: "🇹🇩" },
  { code: "+56", label: "CL", flag: "🇨🇱" },
  { code: "+86", label: "CN", flag: "🇨🇳" },
  { code: "+57", label: "CO", flag: "🇨🇴" },
  { code: "+269", label: "KM", flag: "🇰🇲" },
  { code: "+242", label: "CG", flag: "🇨🇬" },
  { code: "+243", label: "CD", flag: "🇨🇩" },
  { code: "+506", label: "CR", flag: "🇨🇷" },
  { code: "+225", label: "CI", flag: "🇨🇮" },
  { code: "+385", label: "HR", flag: "🇭🇷" },
  { code: "+53", label: "CU", flag: "🇨🇺" },
  { code: "+357", label: "CY", flag: "🇨🇾" },
  { code: "+420", label: "CZ", flag: "🇨🇿" },
  { code: "+45", label: "DK", flag: "🇩🇰" },
  { code: "+253", label: "DJ", flag: "🇩🇯" },
  { code: "+593", label: "EC", flag: "🇪🇨" },
  { code: "+20", label: "EG", flag: "🇪🇬" },
  { code: "+503", label: "SV", flag: "🇸🇻" },
  { code: "+240", label: "GQ", flag: "🇬🇶" },
  { code: "+372", label: "EE", flag: "🇪🇪" },
  { code: "+251", label: "ET", flag: "🇪🇹" },
  { code: "+679", label: "FJ", flag: "🇫🇯" },
  { code: "+358", label: "FI", flag: "🇫🇮" },
  { code: "+33", label: "FR", flag: "🇫🇷" },
  { code: "+241", label: "GA", flag: "🇬🇦" },
  { code: "+220", label: "GM", flag: "🇬🇲" },
  { code: "+995", label: "GE", flag: "🇬🇪" },
  { code: "+49", label: "DE", flag: "🇩🇪" },
  { code: "+233", label: "GH", flag: "🇬🇭" },
  { code: "+30", label: "GR", flag: "🇬🇷" },
  { code: "+502", label: "GT", flag: "🇬🇹" },
  { code: "+224", label: "GN", flag: "🇬🇳" },
  { code: "+245", label: "GW", flag: "🇬🇼" },
  { code: "+592", label: "GY", flag: "🇬🇾" },
  { code: "+509", label: "HT", flag: "🇭🇹" },
  { code: "+504", label: "HN", flag: "🇭🇳" },
  { code: "+852", label: "HK", flag: "🇭🇰" },
  { code: "+36", label: "HU", flag: "🇭🇺" },
  { code: "+354", label: "IS", flag: "🇮🇸" },
  { code: "+91", label: "IN", flag: "🇮🇳" },
  { code: "+62", label: "ID", flag: "🇮🇩" },
  { code: "+98", label: "IR", flag: "🇮🇷" },
  { code: "+964", label: "IQ", flag: "🇮🇶" },
  { code: "+353", label: "IE", flag: "🇮🇪" },
  { code: "+972", label: "IL", flag: "🇮🇱" },
  { code: "+39", label: "IT", flag: "🇮🇹" },
  { code: "+81", label: "JP", flag: "🇯🇵" },
  { code: "+962", label: "JO", flag: "🇯🇴" },
  { code: "+7", label: "KZ", flag: "🇰🇿" },
  { code: "+254", label: "KE", flag: "🇰🇪" },
  { code: "+383", label: "XK", flag: "🇽🇰" },
  { code: "+965", label: "KW", flag: "🇰🇼" },
  { code: "+996", label: "KG", flag: "🇰🇬" },
  { code: "+856", label: "LA", flag: "🇱🇦" },
  { code: "+371", label: "LV", flag: "🇱🇻" },
  { code: "+961", label: "LB", flag: "🇱🇧" },
  { code: "+266", label: "LS", flag: "🇱🇸" },
  { code: "+231", label: "LR", flag: "🇱🇷" },
  { code: "+218", label: "LY", flag: "🇱🇾" },
  { code: "+423", label: "LI", flag: "🇱🇮" },
  { code: "+370", label: "LT", flag: "🇱🇹" },
  { code: "+352", label: "LU", flag: "🇱🇺" },
  { code: "+853", label: "MO", flag: "🇲🇴" },
  { code: "+389", label: "MK", flag: "🇲🇰" },
  { code: "+261", label: "MG", flag: "🇲🇬" },
  { code: "+265", label: "MW", flag: "🇲🇼" },
  { code: "+60", label: "MY", flag: "🇲🇾" },
  { code: "+960", label: "MV", flag: "🇲🇻" },
  { code: "+223", label: "ML", flag: "🇲🇱" },
  { code: "+356", label: "MT", flag: "🇲🇹" },
  { code: "+222", label: "MR", flag: "🇲🇷" },
  { code: "+230", label: "MU", flag: "🇲🇺" },
  { code: "+52", label: "MX", flag: "🇲🇽" },
  { code: "+373", label: "MD", flag: "🇲🇩" },
  { code: "+377", label: "MC", flag: "🇲🇨" },
  { code: "+976", label: "MN", flag: "🇲🇳" },
  { code: "+382", label: "ME", flag: "🇲🇪" },
  { code: "+212", label: "MA", flag: "🇲🇦" },
  { code: "+258", label: "MZ", flag: "🇲🇿" },
  { code: "+95", label: "MM", flag: "🇲🇲" },
  { code: "+264", label: "NA", flag: "🇳🇦" },
  { code: "+977", label: "NP", flag: "🇳🇵" },
  { code: "+31", label: "NL", flag: "🇳🇱" },
  { code: "+64", label: "NZ", flag: "🇳🇿" },
  { code: "+505", label: "NI", flag: "🇳🇮" },
  { code: "+227", label: "NE", flag: "🇳🇪" },
  { code: "+234", label: "NG", flag: "🇳🇬" },
  { code: "+47", label: "NO", flag: "🇳🇴" },
  { code: "+968", label: "OM", flag: "🇴🇲" },
  { code: "+92", label: "PK", flag: "🇵🇰" },
  { code: "+970", label: "PS", flag: "🇵🇸" },
  { code: "+507", label: "PA", flag: "🇵🇦" },
  { code: "+675", label: "PG", flag: "🇵🇬" },
  { code: "+595", label: "PY", flag: "🇵🇾" },
  { code: "+51", label: "PE", flag: "🇵🇪" },
  { code: "+63", label: "PH", flag: "🇵🇭" },
  { code: "+48", label: "PL", flag: "🇵🇱" },
  { code: "+351", label: "PT", flag: "🇵🇹" },
  { code: "+974", label: "QA", flag: "🇶🇦" },
  { code: "+40", label: "RO", flag: "🇷🇴" },
  { code: "+7", label: "RU", flag: "🇷🇺" },
  { code: "+250", label: "RW", flag: "🇷🇼" },
  { code: "+966", label: "SA", flag: "🇸🇦" },
  { code: "+221", label: "SN", flag: "🇸🇳" },
  { code: "+381", label: "RS", flag: "🇷🇸" },
  { code: "+248", label: "SC", flag: "🇸🇨" },
  { code: "+232", label: "SL", flag: "🇸🇱" },
  { code: "+65", label: "SG", flag: "🇸🇬" },
  { code: "+421", label: "SK", flag: "🇸🇰" },
  { code: "+386", label: "SI", flag: "🇸🇮" },
  { code: "+677", label: "SB", flag: "🇸🇧" },
  { code: "+252", label: "SO", flag: "🇸🇴" },
  { code: "+27", label: "ZA", flag: "🇿🇦" },
  { code: "+82", label: "KR", flag: "🇰🇷" },
  { code: "+211", label: "SS", flag: "🇸🇸" },
  { code: "+34", label: "ES", flag: "🇪🇸" },
  { code: "+94", label: "LK", flag: "🇱🇰" },
  { code: "+249", label: "SD", flag: "🇸🇩" },
  { code: "+597", label: "SR", flag: "🇸🇷" },
  { code: "+268", label: "SZ", flag: "🇸🇿" },
  { code: "+46", label: "SE", flag: "🇸🇪" },
  { code: "+41", label: "CH", flag: "🇨🇭" },
  { code: "+963", label: "SY", flag: "🇸🇾" },
  { code: "+886", label: "TW", flag: "🇹🇼" },
  { code: "+992", label: "TJ", flag: "🇹🇯" },
  { code: "+255", label: "TZ", flag: "🇹🇿" },
  { code: "+66", label: "TH", flag: "🇹🇭" },
  { code: "+670", label: "TL", flag: "🇹🇱" },
  { code: "+228", label: "TG", flag: "🇹🇬" },
  { code: "+676", label: "TO", flag: "🇹🇴" },
  { code: "+216", label: "TN", flag: "🇹🇳" },
  { code: "+90", label: "TR", flag: "🇹🇷" },
  { code: "+993", label: "TM", flag: "🇹🇲" },
  { code: "+256", label: "UG", flag: "🇺🇬" },
  { code: "+380", label: "UA", flag: "🇺🇦" },
  { code: "+971", label: "AE", flag: "🇦🇪" },
  { code: "+44", label: "GB", flag: "🇬🇧" },
  { code: "+1", label: "US", flag: "🇺🇸" },
  { code: "+598", label: "UY", flag: "🇺🇾" },
  { code: "+998", label: "UZ", flag: "🇺🇿" },
  { code: "+678", label: "VU", flag: "🇻🇺" },
  { code: "+379", label: "VA", flag: "🇻🇦" },
  { code: "+58", label: "VE", flag: "🇻🇪" },
  { code: "+84", label: "VN", flag: "🇻🇳" },
  { code: "+967", label: "YE", flag: "🇾🇪" },
  { code: "+260", label: "ZM", flag: "🇿🇲" },
  { code: "+263", label: "ZW", flag: "🇿🇼" },
];

export const ServiceConfigDialog = ({
  open,
  onOpenChange,
  service,
  onConnected,
}: ServiceConfigDialogProps) => {
  const [step, setStep] = useState<"form" | "connecting" | "success">("form");
  const info = service ? SERVICE_INFO[service] : null;

  useEffect(() => {
    if (open) {
      setStep("form");
    }
  }, [open, service]);

  if (!service || !info) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={info.icon}
              alt={info.name}
              className="w-8 h-8 rounded bg-white dark:bg-card object-contain"
            />
            <div>
              <DialogTitle>Connect {info.name}</DialogTitle>
              <DialogDescription>{info.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "form" && (
          <ServiceForm
            service={service}
            onComplete={() => {
              setStep("success");
              onConnected();
            }}
          />
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
    case "github":
      return <GithubForm onComplete={onComplete} />;
    case "discord":
      return <DiscordForm onComplete={onComplete} />;
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
        "channels:history",
        "groups:history",
        "im:history",
        "mpim:history",
        "users:read",
        "chat:write",
        "team:read",
        "channels:read",
        "groups:read",
        "mpim:read",
        "im:read",
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
    const poll = async () => {
      try {
        const status = await slackauth.slackcheckstatus();
        if (status.success) {
          setPolling(false);
          toast.success("Connected to Slack!");
          onComplete();
        }
      } catch (err) {
        console.error("Slack status poll failed:", err);
      }
    };

    const interval = setInterval(poll, 2000);
    const timeout = setTimeout(() => {
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
          <p className="text-xs text-muted-foreground">
            A browser window has opened. Complete the authorization there.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Click the button below to open Slack's authorization page. You'll be asked to grant
            access to your workspace.
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

export const GithubForm = ({ onComplete }: { onComplete: () => void }) => {
  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);

  const connect = async () => {
    try {
      const response = await githubauth.githubstate();
      const stateId = response.stateId;
      const clientid = import.meta.env.VITE_GITHUB_CLIENT_ID;
      if (!clientid) {
        toast.error("GitHub Client ID not configured.");
        return;
      }
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
      const redirecturi = encodeURIComponent(`${backendUrl}/github/api/callback`);
      const scopes = encodeURIComponent("repo read:user user:email notifications");

      const url = `https://github.com/login/oauth/authorize?client_id=${clientid}&scope=${scopes}&redirect_uri=${redirecturi}&state=${stateId}`;
      (window.ipcRenderer as any).openInBrowser(url);
      setChecking(true);
      setPolling(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate GitHub connection.");
    }
  };

  useEffect(() => {
    if (!polling) return;
    const poll = async () => {
      try {
        const status = await githubauth.githubcheckstatus();
        if (status.success) {
          setPolling(false);
          toast.success("Connected to GitHub!");
          onComplete();
        }
      } catch (err) {
        console.error("GitHub status poll failed:", err);
      }
    };

    const interval = setInterval(poll, 2000);
    const timeout = setTimeout(() => {
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
          <p className="text-sm text-muted-foreground">Waiting for GitHub authorization...</p>
          <p className="text-xs text-muted-foreground">
            A browser window has opened. Complete the authorization there.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Click the button below to open GitHub's authorization page. You'll be asked to grant
            access to your account.
          </p>
          <Button onClick={connect} className="bg-cyan-500 dark:bg-white gap-2">
            <ExternalLink className="w-4 h-4" />
            Authorize with GitHub
          </Button>
        </>
      )}
    </div>
  );
};

export const DiscordForm = ({ onComplete }: { onComplete: () => void }) => {
  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);

  const connect = async () => {
    try {
      const response = await discordauth.discordstate();
      const stateId = response.stateId;
      const clientid = import.meta.env.VITE_DISCORD_CLIENT_ID;
      if (!clientid) {
        toast.error("Discord Client ID not configured.");
        return;
      }
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
      const redirecturi = encodeURIComponent(`${backendUrl}/discord/api/callback`);

      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientid}&scope=bot&permissions=68608&redirect_uri=${redirecturi}&response_type=code&state=${stateId}`;
      (window.ipcRenderer as any).openInBrowser(url);
      setChecking(true);
      setPolling(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate Discord connection.");
    }
  };

  useEffect(() => {
    if (!polling) return;
    const poll = async () => {
      try {
        const status = await discordauth.discordcheckstatus();
        if (status.success) {
          setPolling(false);
          toast.success("Connected to Discord!");
          onComplete();
        }
      } catch (err) {
        console.error("Discord status poll failed:", err);
      }
    };

    const interval = setInterval(poll, 2000);
    const timeout = setTimeout(() => {
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
          <p className="text-sm text-muted-foreground">Waiting for Discord authorization...</p>
          <p className="text-xs text-muted-foreground">
            A browser window has opened. Choose the server to install the bot into.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Click the button below to open Discord's authorization page. You'll be asked to install
            the Multimate bot into one of your servers.
          </p>
          <Button onClick={connect} className="bg-cyan-500 dark:bg-white gap-2">
            <ExternalLink className="w-4 h-4" />
            Authorize with Discord
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
    const poll = async () => {
      try {
        const status = await notionauth.notioncheckstatus();
        if (status.success) {
          setPolling(false);
          toast.success("Connected to Notion!");
          onComplete();
        }
      } catch (err) {
        console.error("Notion status poll failed:", err);
      }
    };

    const interval = setInterval(poll, 2000);
    const timeout = setTimeout(() => {
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
          <p className="text-xs text-muted-foreground">
            A browser window has opened. Complete the authorization there.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Click the button below to open Notion's authorization page. You'll be asked to grant
            access to your workspace.
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
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");
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
        <Button
          onClick={handleVerifyCode}
          disabled={loading || !phoneCode}
          className="bg-cyan-500 dark:bg-white"
        >
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
        <div className="relative w-32">
          <Label>Country</Label>
          <Button
            variant="outline"
            onClick={() => setCountryOpen(!countryOpen)}
            className="w-full justify-between"
          >
            {(() => {
              const c = COUNTRY_CODES.find((c) => c.code === countryCode);
              return c ? (
                <>
                  {c.flag} {c.label} {c.code}
                </>
              ) : (
                "Select country"
              );
            })()}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
          {countryOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-1 z-100 rounded-lg border bg-popover text-popover-foreground shadow-md">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <input
                  autoFocus
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {COUNTRY_CODES.filter((c) =>
                  `${c.label} ${c.code} ${c.flag}`.toLowerCase().includes(search.toLowerCase()),
                ).length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No country found.
                  </p>
                ) : (
                  COUNTRY_CODES.filter((c) =>
                    `${c.label} ${c.code} ${c.flag}`.toLowerCase().includes(search.toLowerCase()),
                  ).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountryCode(c.code);
                        setCountryOpen(false);
                        setSearch("");
                      }}
                      className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                    >
                      <span>
                        {c.flag} {c.label} {c.code}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
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
      <Button
        onClick={handleSendCode}
        disabled={loading || !phoneNumber}
        className="bg-cyan-500 dark:bg-white"
      >
        {loading ? <Spinner className="w-4 h-4" /> : "Send Verification Code"}
      </Button>
    </div>
  );
};

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
].join(" ");

export const GoogleForm = ({ onComplete }: { onComplete: () => void }) => {
  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);

  const connect = async () => {
    try {
      const response = await googleauth.googlestate();
      const stateId = response.stateId;
      const clientid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientid) {
        toast.error("Google Client ID not configured.");
        return;
      }
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
      const redirecturi = encodeURIComponent(`${backendUrl}/google/api/callback`);
      const scopes = encodeURIComponent(GOOGLE_SCOPES);

      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientid}&scope=${scopes}&redirect_uri=${redirecturi}&response_type=code&access_type=offline&prompt=consent&state=${stateId}`;
      (window.ipcRenderer as any).openInBrowser(url);
      setChecking(true);
      setPolling(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate Google connection.");
    }
  };

  useEffect(() => {
    if (!polling) return;
    const poll = async () => {
      try {
        const status = await googleauth.googlecheckstatus();
        if (status.success) {
          setPolling(false);
          toast.success("Connected to Google!");
          onComplete();
        }
      } catch (err) {
        console.error("Google status poll failed:", err);
      }
    };

    const interval = setInterval(poll, 2000);
    const timeout = setTimeout(() => {
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
          <p className="text-sm text-muted-foreground">Waiting for Google authorization...</p>
          <p className="text-xs text-muted-foreground">
            A browser window has opened. Complete the authorization there.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Click the button below to open Google's authorization page. You'll be asked to grant
            access to Sheets, Docs, and Drive.
          </p>
          <Button onClick={connect} className="bg-cyan-500 dark:bg-white gap-2">
            <ExternalLink className="w-4 h-4" />
            Authorize with Google
          </Button>
        </>
      )}
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
            <Label htmlFor="n8n-none" className="font-normal">
              None (Webhook only)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="apikey" id="n8n-apikey" />
            <Label htmlFor="n8n-apikey" className="font-normal">
              API Key
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="cookie" id="n8n-cookie" />
            <Label htmlFor="n8n-cookie" className="font-normal">
              Cookie
            </Label>
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
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testing || !url}
          className="flex-1"
        >
          {testing ? <Spinner className="w-4 h-4" /> : "Test Connection"}
        </Button>
        <Button
          onClick={handleConnect}
          disabled={connecting || !url}
          className="flex-1 bg-cyan-500 dark:bg-white"
        >
          {connecting ? <Spinner className="w-4 h-4" /> : "Connect"}
        </Button>
      </div>
    </div>
  );
};
