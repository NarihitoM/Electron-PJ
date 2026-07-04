import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import { GoogleIcon } from "@/shared/components/ui/googleicon";
import { TelegramForm, GoogleForm, NotionForm, SlackForm, N8nForm } from "@/features/services/components/ServiceConfigDialog";
import { toast } from "sonner";
import { ServiceCardData } from "./ServiceCard";
import type { TelegramUserData } from "@/features/telegram/types";

interface ServiceDetailPanelProps {
    dialogService: string | null;
    onOpenChange: (open: boolean) => void;
    connectedServices: ServiceCardData[];
    // Telegram
    telegramfetch: boolean;
    telegramError: boolean;
    userdata: TelegramUserData | null | undefined;
    telegramRefetch: () => void;
    deletetelegram: () => void;
    deletingTelegram: boolean;
    // Google
    googlefetch: boolean;
    googleError: boolean;
    serviceemail: string;
    googleRefetch: () => void;
    deletegoogle: () => void;
    deletingGoogle: boolean;
    // Notion
    loadingnotion: boolean;
    notionError: boolean;
    workspacename: string;
    notionRefetch: () => void;
    deletenotion: () => void;
    deletingNotion: boolean;
    // Slack
    loadingslack: boolean;
    slackError: boolean;
    workspace: string;
    slackRefetch: () => void;
    deleteslack: () => void;
    // n8n
    loadingn8n: boolean;
    n8nError: boolean;
    n8nConnected: boolean;
    n8nUrl: string;
    n8nRefetch: () => void;
    deleten8n: () => void;
    // Callbacks
    onServiceConnected: () => void;
}

export const ServiceDetailPanel = ({
    dialogService,
    onOpenChange,
    connectedServices,
    telegramfetch,
    telegramError,
    userdata,
    telegramRefetch,
    deletetelegram,
    deletingTelegram,
    googlefetch,
    googleError,
    serviceemail,
    googleRefetch,
    deletegoogle,
    deletingGoogle,
    loadingnotion,
    notionError,
    workspacename,
    notionRefetch,
    deletenotion,
    deletingNotion,
    loadingslack,
    slackError,
    workspace,
    slackRefetch,
    deleteslack,
    loadingn8n,
    n8nError,
    n8nConnected,
    n8nUrl,
    n8nRefetch,
    deleten8n,
    onServiceConnected,
}: ServiceDetailPanelProps) => {
    return (
        <Dialog open={!!dialogService} onOpenChange={(open) => { if (!open) onOpenChange(open); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {dialogService && (() => {
                            const svc = connectedServices.find(s => s.id === dialogService);
                            if (!svc) return null;
                            return (
                                <>
                                    {svc.icon ? <img src={svc.icon} className="h-5 w-5 object-contain" alt="" /> : <GoogleIcon />}
                                    {svc.name}
                                </>
                            );
                        })()}
                    </DialogTitle>
                    <DialogDescription>
                        {dialogService && connectedServices.find(s => s.id === dialogService)?.description}
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
                                    <p className="text-sm text-red-500 font-medium">Failed to load Telegram service</p>
                                    <Button size="sm" onClick={() => telegramRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
                                </div>
                            ) : userdata ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="icon" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <p className="text-sm font-medium">Connected Account</p>
                                        <h3 className="text-lg font-semibold">{userdata.firstName} {userdata.lastName}</h3>
                                    </div>
                                    <Button onClick={deletetelegram} disabled={deletingTelegram} variant="destructive" className="ml-auto">
                                        {deletingTelegram ? <Spinner /> : "Disconnect"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-4">
                                    <div className="space-y-4 w-full">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="icon" />
                                        </div>
                                        <TelegramForm onComplete={async () => {
                                            await telegramRefetch();
                                            onServiceConnected();
                                            toast.success("Telegram connected!");
                                        }} />
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
                                    <p className="text-sm text-muted-foreground animate-pulse">Loading Google Service...</p>
                                </div>
                            ) : googleError ? (
                                <div className="flex flex-col gap-2 items-center justify-center py-4">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500 font-medium">Failed to load Google service</p>
                                    <Button size="sm" onClick={() => googleRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
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
                                    <Button onClick={deletegoogle} disabled={deletingGoogle} variant="destructive" className="ml-auto">
                                        {deletingGoogle ? <Spinner /> : "Disconnect"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-4">
                                    <div className="space-y-4 w-full">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <GoogleIcon />
                                        </div>
                                        <GoogleForm onComplete={async () => {
                                            await googleRefetch();
                                            onServiceConnected();
                                            toast.success("Google service connected!");
                                        }} />
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
                                    <p className="text-sm text-muted-foreground animate-pulse">Loading Notion Service...</p>
                                </div>
                            ) : notionError ? (
                                <div className="flex flex-col gap-2 items-center justify-center py-4">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500 font-medium">Failed to load Notion service</p>
                                    <Button size="sm" onClick={() => notionRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
                                </div>
                            ) : workspacename ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="icon" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <p className="text-sm font-medium">Connected Notion Workspace Account</p>
                                        <h3 className="text-lg font-semibold">{workspacename}</h3>
                                    </div>
                                    <Button onClick={deletenotion} disabled={deletingNotion} variant="destructive" className="ml-auto">
                                        {deletingNotion ? <Spinner /> : "Disconnect"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-4">
                                    <div className="space-y-4 w-full">
                                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="icon" />
                                        </div>
                                        <NotionForm onComplete={async () => {
                                            await notionRefetch();
                                            onServiceConnected();
                                            toast.success("Notion connected!");
                                        }} />
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
                                    <p className="text-sm text-muted-foreground animate-pulse">Loading Slack Service...</p>
                                </div>
                            ) : slackError ? (
                                <div className="flex flex-col gap-2 items-center justify-center py-4">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500 font-medium">Failed to load Slack service</p>
                                    <Button size="sm" onClick={() => slackRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
                                </div>
                            ) : workspace ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                        <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="icon" />
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
                                            <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="icon" />
                                        </div>
                                        <SlackForm onComplete={async () => {
                                            await slackRefetch();
                                            onServiceConnected();
                                            toast.success("Slack connected!");
                                        }} />
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
                                    <p className="text-sm text-muted-foreground animate-pulse">Loading n8n Service...</p>
                                </div>
                            ) : n8nError ? (
                                <div className="flex flex-col gap-2 items-center justify-center py-4">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500 font-medium">Failed to load n8n service</p>
                                    <Button size="sm" onClick={() => n8nRefetch()} className="bg-cyan-500 dark:bg-white">Retry</Button>
                                </div>
                            ) : n8nConnected ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg" alt="icon" />
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
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg" alt="icon" />
                                        </div>
                                        <N8nForm onComplete={async () => {
                                            await n8nRefetch();
                                            onServiceConnected();
                                            toast.success("n8n connected!");
                                        }} />
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
