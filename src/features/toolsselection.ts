const Tools = [
    "Web Search Agent",
    "Command Line Agent",
    "Web Scrapping Agent",
    "Browser Agent"
] as const

export type ToolType = typeof Tools[number];

export const ToolRecord: Record<ToolType, string> = {
    "Web Search Agent": "Web Searching Tools",
    "Command Line Agent": "Commandline Tools",
    "Web Scrapping Agent": "Web Scrapping Tools",
    "Browser Agent": "Browser Tools"
};

export const Googlesheettool: Record<string, string> = {
    "google_sheets_read": "Reading Google Sheet",
    "google_sheets_edit": "Editing Google Sheet",
    "google_sheets_append": "Adding New Datas To Googlesheet",
    "google_sheets_delete": "Deleting Data In Googlesheet",
    "web_search": "Searching The Web"
}

export const Googledocstool: Record<string, string> = {
    "google_docs_read": "Reading Google Docs",
    "google_docs_edit": "Editing Google Docs",
    "google_docs_delete_file": "Deleting Google Docs",
    "web_search": "Searching The Web"
}

export const Telegramtool: Record<string, string> = {
    "send_message": "Sending Telegram Message",
    "fetch_message": "Reading The Telegram Message",
    "fetch_chat_user": "Looking At The Members In Telegram",
    "get_info" : "Reading info",
    "web_search": "Searching The Web"
}

export const Notiontool: Record<string, string> = {
    "read_notion_page": "Reading The Notion Page",
    "update_notion_page": "Editing The Notion Page",
    "append_notion_blocks": "Adding Datas To Notion Page",
    "create_new_page": "Creating A New Page",
    "web_search": "Searching The Web"
}

export const Slacktool: Record<string, string> = {
    "send_slack_message": "Sending Slack Message",
    "read_slack_history": "Reading the Slack Message",
    "list_conversations": "Retrieving Channels Lists",
    "get_user_info": "Getting User Info",
    "get_team_info": "Getting Workspace Info",
    "web_search": "Searching The Web"
}