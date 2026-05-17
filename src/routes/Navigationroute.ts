import { BotIcon, Globe, LayoutDashboard, SquarePen, SettingsIcon } from "lucide-react";


//Chatfeatures
export const navItems = [
    { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
    { title: "New Chat", url: null, icon: SquarePen, type: "create" },
    { title: "Web-Scraping", url: "/app/webscrap", icon: Globe },
];


//Agent
export const Agent = [
    {
        title: "Slack",
        url: "/app/slack",
        icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
    },
    {
        title: "Notion",
        url: "/app/notion",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
    },
    {
        title: "GoogleSheet",
        url: "/app/googlesheet",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg"
    },
    {
        title: "GoogleDocs",
        url: "/app/googledocs",
        icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg"
    },
    {
        title: "Telegram",
        url: "/app/telegram",
        icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
    },
];


//LocalAiAgent
export const Localagent = [
    { title: "MultiAgents", url: "/app/localagent", icon: BotIcon },
]

export const Settings = [
    { title: "Service Settings", url: "/app/settings", icon: SettingsIcon },
]