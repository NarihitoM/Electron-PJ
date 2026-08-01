import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import { GoogleIcon } from "@/shared/components/ui/googleicon";
import {
  TelegramForm,
  GoogleForm,
  NotionForm,
  SlackForm,
  N8nForm,
  GithubForm,
  DiscordForm,
  ViberForm,
} from "@/features/services/components/ServiceConfigDialog";
import { toast } from "sonner";
import { ServiceCardData } from "./ServiceCard";
import { useTelegramAccount } from "@/features/telegram/hooks/useTelegramAccount";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { useNotionAccount } from "@/features/notion/hooks/useNotionAccount";
import { useSlackAccount } from "@/features/slack/hooks/useSlackAccount";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { useGithubAccount } from "@/features/github/hooks/useGithubAccount";
import { useDiscordAccount } from "@/features/discord/hooks/useDiscordAccount";
import { useViberAccount } from "@/features/viber/hooks/useViberAccount";
import { telegramauth } from "@/features/telegram/api/api";
import { googleauth } from "@/features/google/api/api";
import { notionauth } from "@/features/notion/api/api";
import { slackauth } from "@/features/slack/api/api";
import { n8nauth } from "@/features/n8n/api/api";
import { githubauth } from "@/features/github/api/api";
import { discordauth } from "@/features/discord/api/api";
import { viberauth } from "@/features/viber/api/api";
import { accountstore } from "../store/store";

export const ServiceDetailPanel = () => {
  const dialogService = accountstore((s) => s.dialogService);
  const setDialogService = accountstore((s) => s.setDialogService);

  const {
    data: telegramData,
    isLoading: telegramfetch,
    isError: telegramError,
    refetch: telegramRefetch,
  } = useTelegramAccount();
  const {
    data: googleServiceData,
    isLoading: googlefetch,
    isError: googleError,
    refetch: googleRefetch,
  } = useGoogleService();
  const {
    data: notionAccount,
    isLoading: loadingnotion,
    isError: notionError,
    refetch: notionRefetch,
  } = useNotionAccount();
  const {
    data: slackAccount,
    isLoading: loadingslack,
    isError: slackError,
    refetch: slackRefetch,
  } = useSlackAccount();
  const {
    data: n8nConfig,
    isLoading: loadingn8n,
    isError: n8nError,
    refetch: n8nRefetch,
  } = useN8nConfig();
  const {
    data: githubAccount,
    isLoading: loadinggithub,
    isError: githubError,
    refetch: githubRefetch,
  } = useGithubAccount();
  const {
    data: discordAccount,
    isLoading: loadingdiscord,
    isError: discordError,
    refetch: discordRefetch,
  } = useDiscordAccount();
  const {
    data: viberAccount,
    isLoading: loadingviber,
    isError: viberError,
    refetch: viberRefetch,
  } = useViberAccount();

  const userdata = telegramData;
  const serviceemail = (googleServiceData as any)?.serviceemail ?? "";
  const workspacename = (notionAccount as any)?.workspacename ?? "";
  const workspace = (slackAccount as any)?.workspace ?? "";
  const n8nConnected = !!((n8nConfig as any)?.connected ?? false);
  const n8nUrl = (n8nConfig as any)?.n8nUrl ?? "";
  const githubusername = (githubAccount as any)?.username ?? "";
  const guildName = (discordAccount as any)?.guildName ?? "";
  const vibername = (viberAccount as any)?.name ?? "";

  const [deletingTelegram, setDeletingTelegram] = useState(false);
  const [deletingGoogle, setDeletingGoogle] = useState(false);
  const [deletingNotion, setDeletingNotion] = useState(false);
  const [deletingGithub, setDeletingGithub] = useState(false);
  const [deletingDiscord, setDeletingDiscord] = useState(false);
  const [deletingViber, setDeletingViber] = useState(false);

  const connectedServices: ServiceCardData[] = [
    {
      id: "telegram",
      name: "Telegram",
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      description: "Configure your Telegram Account.",
      isActive: !!userdata,
    },
    {
      id: "google",
      name: "Google Service",
      icon: null,
      description: "Configure your Google service Account.",
      isActive: !!serviceemail,
    },
    {
      id: "notion",
      name: "Notion",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
      description: "Configure your Notion workspace account.",
      isActive: !!workspacename,
    },
    {
      id: "slack",
      name: "Slack",
      icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
      description: "Configure your Slack workspace account.",
      isActive: !!workspace,
    },
    {
      id: "n8n",
      name: "n8n",
      icon: "https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg",
      description: "Configure your n8n workflow automation.",
      isActive: n8nConnected,
    },
    {
      id: "github",
      name: "GitHub",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
      description: "Configure your GitHub account.",
      isActive: !!githubusername,
    },
    {
      id: "discord",
      name: "Discord",
      icon: "https://cdn.worldvectorlogo.com/logos/discord-6.svg",
      description: "Configure your Discord bot server.",
      isActive: !!guildName,
    },
    {
      id: "viber",
      name: "Viber",
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Viber_logo.svg",
      description: "Configure your Viber bot account.",
      isActive: !!vibername,
    },
  ];

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
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingTelegram(false);
    }
  };

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
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingGoogle(false);
    }
  };

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
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingNotion(false);
    }
  };

  const deleteslack = async () => {
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
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const deleten8n = async () => {
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
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const deletegithub = async () => {
    setDeletingGithub(true);
    try {
      const response = await githubauth.githubdeleteservice();
      if (response.success) {
        toast.success(response.message);
        setDialogService(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingGithub(false);
    }
  };

  const deletediscord = async () => {
    setDeletingDiscord(true);
    try {
      const response = await discordauth.deletediscordservice();
      if (response.success) {
        toast.success(response.message);
        setDialogService(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingDiscord(false);
    }
  };

  const deleteviber = async () => {
    setDeletingViber(true);
    try {
      const response = await viberauth.deleteviberservice();
      if (response.success) {
        toast.success(response.message);
        setDialogService(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setDeletingViber(false);
    }
  };

  return (
    <Dialog
      open={!!dialogService}
      onOpenChange={(open) => {
        if (!open) setDialogService(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialogService &&
              (() => {
                const svc = connectedServices.find((s) => s.id === dialogService);
                if (!svc) return null;
                return (
                  <>
                    {svc.icon ? (
                      <img src={svc.icon} className="h-5 w-5 object-contain" alt="" />
                    ) : (
                      <GoogleIcon />
                    )}
                    {svc.name}
                  </>
                );
              })()}
          </DialogTitle>
          <DialogDescription>
            {dialogService && connectedServices.find((s) => s.id === dialogService)?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {dialogService === "telegram" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {telegramfetch ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading Telegram...</p>
                </div>
              ) : telegramError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">
                    Failed to load Telegram service
                  </p>
                  <Button
                    size="sm"
                    onClick={() => telegramRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
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
                    <h3 className="text-lg font-semibold">
                      {userdata.firstName} {userdata.lastName}
                    </h3>
                  </div>
                  <Button
                    onClick={deletetelegram}
                    disabled={deletingTelegram}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingTelegram ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                        alt="icon"
                      />
                    </div>
                    <TelegramForm
                      onComplete={async () => {
                        await telegramRefetch();
                        setDialogService(null);
                        toast.success("Telegram connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "google" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {googlefetch ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Google Service...
                  </p>
                </div>
              ) : googleError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load Google service</p>
                  <Button
                    size="sm"
                    onClick={() => googleRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : serviceemail ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <GoogleIcon />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected Service Account</p>
                    <h3 className="text-lg font-semibold">{serviceemail}</h3>
                  </div>
                  <Button
                    onClick={deletegoogle}
                    disabled={deletingGoogle}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingGoogle ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <GoogleIcon />
                    </div>
                    <GoogleForm
                      onComplete={async () => {
                        await googleRefetch();
                        setDialogService(null);
                        toast.success("Google service connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "notion" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadingnotion ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Notion Service...
                  </p>
                </div>
              ) : notionError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load Notion service</p>
                  <Button
                    size="sm"
                    onClick={() => notionRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
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
                    <h3 className="text-lg font-semibold">{workspacename}</h3>
                  </div>
                  <Button
                    onClick={deletenotion}
                    disabled={deletingNotion}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingNotion ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                        alt="icon"
                      />
                    </div>
                    <NotionForm
                      onComplete={async () => {
                        await notionRefetch();
                        setDialogService(null);
                        toast.success("Notion connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "slack" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadingslack ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Slack Service...
                  </p>
                </div>
              ) : slackError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load Slack service</p>
                  <Button
                    size="sm"
                    onClick={() => slackRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : workspace ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <img
                      src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected Slack Workspace Account</p>
                    <h3 className="text-lg font-semibold">{workspace}</h3>
                  </div>
                  <Button onClick={deleteslack} variant="destructive" className="ml-auto">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                        alt="icon"
                      />
                    </div>
                    <SlackForm
                      onComplete={async () => {
                        await slackRefetch();
                        setDialogService(null);
                        toast.success("Slack connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "n8n" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadingn8n ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading n8n Service...
                  </p>
                </div>
              ) : n8nError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load n8n service</p>
                  <Button
                    size="sm"
                    onClick={() => n8nRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : n8nConnected ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected n8n Instance</p>
                    <h3 className="text-lg font-semibold truncate">{n8nUrl}</h3>
                  </div>
                  <Button onClick={deleten8n} variant="destructive" className="ml-auto">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg"
                        alt="icon"
                      />
                    </div>
                    <N8nForm
                      onComplete={async () => {
                        await n8nRefetch();
                        setDialogService(null);
                        toast.success("n8n connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "github" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadinggithub ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading GitHub Service...
                  </p>
                </div>
              ) : githubError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load GitHub service</p>
                  <Button
                    size="sm"
                    onClick={() => githubRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : githubusername ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected GitHub Account</p>
                    <h3 className="text-lg font-semibold">{githubusername}</h3>
                  </div>
                  <Button
                    onClick={deletegithub}
                    disabled={deletingGithub}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingGithub ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                        alt="icon"
                      />
                    </div>
                    <GithubForm
                      onComplete={async () => {
                        await githubRefetch();
                        setDialogService(null);
                        toast.success("GitHub connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "discord" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadingdiscord ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Discord Service...
                  </p>
                </div>
              ) : discordError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load Discord service</p>
                  <Button
                    size="sm"
                    onClick={() => discordRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : guildName ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <img src="https://cdn.worldvectorlogo.com/logos/discord-6.svg" alt="icon" />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected Discord Server</p>
                    <h3 className="text-lg font-semibold">{guildName}</h3>
                  </div>
                  <Button
                    onClick={deletediscord}
                    disabled={deletingDiscord}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingDiscord ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img src="https://cdn.worldvectorlogo.com/logos/discord-6.svg" alt="icon" />
                    </div>
                    <DiscordForm
                      onComplete={async () => {
                        await discordRefetch();
                        setDialogService(null);
                        toast.success("Discord connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {dialogService === "viber" && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {loadingviber ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-8 h-8 animate-spin text-cyan-500 dark:text-white" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Viber Service...
                  </p>
                </div>
              ) : viberError ? (
                <div className="flex flex-col gap-2 items-center justify-center py-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500 font-medium">Failed to load Viber service</p>
                  <Button
                    size="sm"
                    onClick={() => viberRefetch()}
                    className="bg-cyan-500 dark:bg-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : vibername ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Viber_logo.svg"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">Connected Viber Account</p>
                    <h3 className="text-lg font-semibold">{vibername}</h3>
                  </div>
                  <Button
                    onClick={deleteviber}
                    disabled={deletingViber}
                    variant="destructive"
                    className="ml-auto"
                  >
                    {deletingViber ? <Spinner /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Viber_logo.svg"
                        alt="icon"
                      />
                    </div>
                    <ViberForm
                      onComplete={async () => {
                        await viberRefetch();
                        setDialogService(null);
                        toast.success("Viber connected!");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
