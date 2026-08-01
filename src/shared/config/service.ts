import { GoogleIcon } from "../components/ui/googleicon";

export const BRAND_SERVICE: Record<string, any> = {
  slack: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  google: GoogleIcon,
  telegram: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  n8n: "https://upload.wikimedia.org/wikipedia/commons/5/53/N8n-logo-new.svg",
  github: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
  discord: "https://cdn.worldvectorlogo.com/logos/discord-6.svg",
  viber: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Viber_logo.svg",
};

export const SERVICES = [
  {
    name: "Telegram",
    image: BRAND_SERVICE["telegram"],
    description: "Connect Telegram to read chats and send messages via AI agents.",
  },
  {
    name: "Slack",
    image: BRAND_SERVICE["slack"],
    description: "Connect Slack workspace to interact with channels and send messages.",
  },
  {
    name: "Notion",
    image: BRAND_SERVICE["notion"],
    description: "Connect Notion to read and write pages in your workspace.",
  },
  {
    name: "Google Service",
    image: typeof BRAND_SERVICE["google"] === "string" ? BRAND_SERVICE["google"] : undefined,
    isComponent: true,
    description: "Connect Google Sheets and Docs with a service account.",
  },
  {
    name: "n8n",
    image: BRAND_SERVICE["n8n"],
    description: "Connect n8n to manage and trigger workflows automatically.",
  },
  {
    name: "GitHub",
    image: BRAND_SERVICE["github"],
    description: "Connect GitHub to browse repositories, file issues, and review pull requests.",
  },
  {
    name: "Discord",
    image: BRAND_SERVICE["discord"],
    description: "Connect Discord to send messages and read channels through a bot.",
  },
  {
    name: "Viber",
    image: BRAND_SERVICE["viber"],
    description: "Connect Viber to send and read messages through a bot.",
  },
];
