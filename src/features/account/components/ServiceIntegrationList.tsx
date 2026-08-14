import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard, ServiceCardData } from "./ServiceCard";
import { useTelegramAccount } from "@/features/telegram/hooks/useTelegramAccount";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { useNotionAccount } from "@/features/notion/hooks/useNotionAccount";
import { useSlackAccount } from "@/features/slack/hooks/useSlackAccount";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { useGithubAccount } from "@/features/github/hooks/useGithubAccount";
import { useDiscordAccount } from "@/features/discord/hooks/useDiscordAccount";
import { useVercelAccount } from "@/features/vercel/hooks/useVercelAccount";
import { accountstore } from "../store/store";

export const ServiceIntegrationList = () => {
  const search = accountstore((s) => s.search);
  const setSearch = accountstore((s) => s.setSearch);
  const setDialogService = accountstore((s) => s.setDialogService);

  const { data: telegramData } = useTelegramAccount();
  const { data: googleServiceData } = useGoogleService();
  const { data: notionAccount } = useNotionAccount();
  const { data: slackAccount } = useSlackAccount();
  const { data: n8nConfig } = useN8nConfig();
  const { data: githubAccount } = useGithubAccount();
  const { data: discordAccount } = useDiscordAccount();
  const { data: vercelAccount } = useVercelAccount();

  const userdata = telegramData;
  const serviceemail = (googleServiceData as any)?.serviceemail ?? "";
  const workspacename = (notionAccount as any)?.workspacename ?? "";
  const workspace = (slackAccount as any)?.workspace ?? "";
  const n8nConnected = !!((n8nConfig as any)?.connected ?? false);
  const githubusername = (githubAccount as any)?.username ?? "";
  const guildName = (discordAccount as any)?.guildName ?? "";
  const vercelConnected = !!vercelAccount?.connected;

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
      id: "vercel",
      name: "Vercel",
      icon: "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.svg",
      description: "Configure your Vercel account.",
      isActive: vercelConnected,
    },
  ];

  const filteredServices = connectedServices.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 mt-4 mb-6">
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl font-bold">Connected Services</h1>
        <p className="text-muted-foreground">Manage your connected third-party services.</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connected services..."
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} onClick={setDialogService} />
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No services match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
