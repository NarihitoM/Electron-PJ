

export const Googlesheettool: Record<string, string> = {
    "google_sheets_read": "Reading Google Sheet",
    "google_sheets_edit": "Editing Google Sheet",
    "google_sheets_append": "Adding New Datas To Googlesheet",
    "google_sheets_delete": "Deleting Data In Googlesheet",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const Googledocstool: Record<string, string> = {
    "google_docs_read": "Reading Google Docs",
    "google_docs_edit": "Editing Google Docs",
    "google_docs_delete_file": "Deleting Google Docs",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const Telegramtool: Record<string, string> = {
    "send_message": "Sending Telegram Message",
    "fetch_message": "Reading The Telegram Message",
    "fetch_chat_user": "Looking At The Members In Telegram",
    "get_info" : "Reading info",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const Notiontool: Record<string, string> = {
    "read_notion_page": "Reading The Notion Page",
    "update_notion_page": "Editing The Notion Page",
    "append_notion_blocks": "Adding Datas To Notion Page",
    "create_new_page": "Creating A New Page",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const Slacktool: Record<string, string> = {
    "send_slack_message": "Sending Slack Message",
    "read_slack_history": "Reading the Slack Message",
    "list_conversations": "Retrieving Channels Lists",
    "get_user_info": "Getting User Info",
    "get_team_info": "Getting Workspace Info",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const N8ntool: Record<string, string> = {
    "n8n_list_workflows": "Listing Workflows",
    "n8n_get_workflow": "Getting Workflow Details",
    "n8n_create_workflow": "Creating Workflow",
    "n8n_update_workflow": "Updating Workflow",
    "n8n_delete_workflow": "Deleting Workflow",
    "n8n_activate_workflow": "Activating Workflow",
    "n8n_deactivate_workflow": "Deactivating Workflow",
    "n8n_trigger_workflow": "Triggering Workflow",
    "n8n_list_executions": "Listing Executions",
    "n8n_get_execution": "Getting Execution Details",
    "n8n_retry_execution": "Retrying Execution",
    "n8n_list_credentials": "Listing Credentials",
    "n8n_trigger_webhook": "Triggering Webhook",
    "web_search": "Searching The Web",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image"
}

export const Designtool: Record<string, string> = {
    "design_tool" : "Designing Layout",
    "create_new_file_tool" : "Creating A New File",
    "web_search": "Searching The Web"
}

export const Chattool: Record<string, string> = {
    "web_search": "Searching The Web",
    "web_scrape": "Scraping Web Page",
    "image_generation": "Generating Image",
    "image_generator": "Generating Image",
    "image_review": "Reviewing Image",
    "image_analyzer": "Reviewing Image"
}

export const ToolLabels: Record<string, string> = {
    web_search: "Web Search",
    run_command: "Command Line",
    web_scrap: "Web Scraper",
    browser_agent: "Browser",
    calculate: "Calculator",
    get_datetime: "Date & Time",
    read_file: "Read File",
    write_file: "Write File",
    get_system_info: "System Info",
    send_email: "Send Email",
    http_request: "HTTP Request",
    json_tool: "JSON Tool",
    crypto_tool: "Crypto Tool",
    text_tool: "Text Tool",
};

export const toolToRole = (toolId: string): string =>
    ToolLabels[toolId] ? `${ToolLabels[toolId]} Agent` : "";

export const WRITE_TOOLS = new Set([
    // Telegram
    "send_message",
    // Slack
    "send_slack_message",
    // Notion
    "update_notion_page",
    "append_notion_blocks",
    "create_new_page",
    "create_notion_database",
    "add_notion_database_row",
    // Google Sheets
    "google_sheets_edit",
    "google_sheets_delete",
    "google_sheets_create",
    "google_sheets_add_sheet",
    "google_sheets_append",
    // Google Docs
    "google_docs_create",
    "google_docs_edit",
    "google_docs_delete_file",
    // n8n
    "n8n_create_workflow",
    "n8n_update_workflow",
    "n8n_delete_workflow",
    "n8n_trigger_workflow",
    // LocalAgent
    "run_command",
    "write_file",
    "send_email",
    "http_request",
]);

export const WRITE_TOOLS_LABELS: Record<string, string> = {
    send_message: "Sends a message via Telegram",
    send_slack_message: "Sends a message to a Slack channel",
    update_notion_page: "Updates a Notion page",
    append_notion_blocks: "Appends content to a Notion page",
    create_new_page: "Creates a new Notion page",
    create_notion_database: "Creates a new Notion database",
    add_notion_database_row: "Adds a row to a Notion database",
    google_sheets_edit: "Edits data in a Google Sheet",
    google_sheets_delete: "Deletes data from a Google Sheet",
    google_sheets_create: "Creates a new Google Sheet",
    google_sheets_add_sheet: "Adds a new sheet tab to a Google Sheet",
    google_sheets_append: "Appends data to a Google Sheet",
    google_docs_create: "Creates a new Google Doc",
    google_docs_edit: "Edits content in a Google Doc",
    google_docs_delete_file: "Deletes a Google Doc permanently",
    n8n_create_workflow: "Creates a new n8n workflow",
    n8n_update_workflow: "Updates an existing n8n workflow",
    n8n_delete_workflow: "Deletes an n8n workflow",
    n8n_trigger_workflow: "Triggers an n8n workflow execution",
    run_command: "Runs a shell command on your system",
    write_file: "Writes content to a file on your system",
    send_email: "Sends an email",
    http_request: "Makes an HTTP request to an external URL",
};