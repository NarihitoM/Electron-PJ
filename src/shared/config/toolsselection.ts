export const Googlesheettool: Record<string, string> = {
  google_sheets_read: "Reading Google Sheet",
  google_sheets_edit: "Editing Google Sheet",
  google_sheets_append: "Adding New Datas To Googlesheet",
  google_sheets_delete: "Deleting Data In Googlesheet",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Googledocstool: Record<string, string> = {
  google_docs_read: "Reading Google Docs",
  google_docs_edit: "Editing Google Docs",
  google_docs_delete_file: "Deleting Google Docs",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Googlecalendartool: Record<string, string> = {
  google_calendar_list_events: "Reading Google Calendar",
  google_calendar_create_event: "Creating Calendar Event",
  google_calendar_update_event: "Updating Calendar Event",
  google_calendar_delete_event: "Deleting Calendar Event",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Telegramtool: Record<string, string> = {
  send_message: "Sending Telegram Message",
  fetch_message: "Reading The Telegram Message",
  fetch_chat_user: "Looking At The Members In Telegram",
  get_info: "Reading info",
  list_chats: "Listing All Telegram Chats",
  resolve_chat: "Resolving Telegram Username",
  web_search: "Searching The Web",
  web_scrape: "Scraping Web Page",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Notiontool: Record<string, string> = {
  read_notion_page: "Reading The Notion Page",
  update_notion_page: "Editing The Notion Page",
  append_notion_blocks: "Adding Datas To Notion Page",
  create_new_page: "Creating A New Page",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Slacktool: Record<string, string> = {
  send_slack_message: "Sending Slack Message",
  read_slack_history: "Reading the Slack Message",
  list_conversations: "Retrieving Channels List",
  get_user_info: "Getting User Info",
  get_team_info: "Getting Workspace Info",
  web_search: "Searching The Web",
  web_scrape: "Scraping Web Page",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Discordtool: Record<string, string> = {
  discord_send_message: "Sending Discord Message",
  discord_read_messages: "Reading The Discord Message",
  discord_list_channels: "Listing Discord Channels",
  web_search: "Searching The Web",
  web_scrape: "Scraping Web Page",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const Githubtool: Record<string, string> = {
  list_repos: "Listing Repositories",
  list_issues: "Reading Issues",
  create_issue: "Creating Issue",
  comment_issue: "Commenting On Issue",
  list_pull_requests: "Reading Pull Requests",
  get_profile: "Getting User Profile",
  commit_file: "Committing File",
  list_notifications: "Listing Notifications",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const N8ntool: Record<string, string> = {
  n8n_list_workflows: "Listing Workflows",
  n8n_get_workflow: "Getting Workflow Details",
  n8n_create_workflow: "Creating Workflow",
  n8n_update_workflow: "Updating Workflow",
  n8n_delete_workflow: "Deleting Workflow",
  n8n_activate_workflow: "Activating Workflow",
  n8n_deactivate_workflow: "Deactivating Workflow",
  n8n_trigger_workflow: "Triggering Workflow",
  n8n_list_executions: "Listing Executions",
  n8n_get_execution: "Getting Execution Details",
  n8n_retry_execution: "Retrying Execution",
  n8n_list_credentials: "Listing Credentials",
  n8n_trigger_webhook: "Triggering Webhook",
  web_search: "Searching The Web",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
};

export const Designtool: Record<string, string> = {
  design_tool: "Designing Layout",
  create_new_file_tool: "Creating A New File",
  web_search: "Searching The Web",
};

export const Chattool: Record<string, string> = {
  web_search: "Searching The Web",
  web_scrape: "Scraping Web Page",
  image_generation: "Generating Image",
  image_generator: "Generating Image",
  image_review: "Reviewing Image",
  image_analyzer: "Reviewing Image",
};

export const ToolLabels: Record<string, string> = {
  web_search: "Web Search",
  run_command: "Command Line",
  web_scrap: "Web Scraper",
  browser_agent: "Browser",
  read_file: "Read File",
  write_file: "Write File",
  send_email: "Send Email",
  http_request: "HTTP Request",
};

export const toolToRole = (toolId: string): string =>
  ToolLabels[toolId] ? `${ToolLabels[toolId]} Agent` : "";

export const WRITE_TOOLS = new Set([
  // Telegram
  "send_message",
  // Slack
  "send_slack_message",
  // Discord
  "discord_send_message",
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
  // Google Calendar
  "google_calendar_create_event",
  "google_calendar_update_event",
  "google_calendar_delete_event",
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
  discord_send_message: "Sends a message to a Discord channel",
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
  google_calendar_create_event: "Creates a new Google Calendar event",
  google_calendar_update_event: "Updates a Google Calendar event",
  google_calendar_delete_event: "Deletes a Google Calendar event",
  n8n_create_workflow: "Creates a new n8n workflow",
  n8n_update_workflow: "Updates an existing n8n workflow",
  n8n_delete_workflow: "Deletes an n8n workflow",
  n8n_trigger_workflow: "Triggers an n8n workflow execution",
  run_command: "Runs a shell command on your system",
  write_file: "Writes content to a file on your system",
  send_email: "Sends an email",
  http_request: "Makes an HTTP request to an external URL",
};
