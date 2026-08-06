import {
  BotIcon,
  LayoutDashboard,
  SquarePen,
  SettingsIcon,
  Video,
  BarChart3,
  Brain,
} from "lucide-react";

export const mainItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/app/usage", icon: BarChart3 },
];

//Chatfeatures
export const navItems = [
  { title: "New Chat", url: null, icon: SquarePen, type: "create", loading: false },
  { title: "Ai Video Analysics", url: "/app/videoanalysis", icon: Video },
];

//Agent
export const Agent = [
  {
    title: "Slack",
    url: "/app/slack",
    icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
  },
  {
    title: "Notion",
    url: "/app/notion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  },
  {
    title: "GoogleSheet",
    url: "/app/googlesheet",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
  },
  {
    title: "GoogleDocs",
    url: "/app/googledocs",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg",
  },
  {
    title: "GoogleCalendar",
    url: "/app/googlecalendar",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
  },
  {
    title: "GoogleGmail",
    url: "/app/googlegmail",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
  },
  {
    title: "Telegram",
    url: "/app/telegram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  },
  {
    title: "n8n",
    url: "/app/n8n",
    icon: "https://n8n.io/favicon.ico",
  },
  {
    title: "Github",
    url: "/app/github",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    invertDark: true,
  },
  {
    title: "Discord",
    url: "/app/discord",
    icon: "https://cdn.worldvectorlogo.com/logos/discord-6.svg",
  },
];

//LocalAiAgent
export const Localagent = [{ title: "MultiAgents", url: "/app/localagent", icon: BotIcon }];

export const MemoryNav = [{ title: "Memory", url: "/app/memory", icon: Brain }];

export const Settings = [{ title: "Service Settings", url: "/app/settings", icon: SettingsIcon }];
