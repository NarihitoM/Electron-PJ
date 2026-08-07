import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Server } from "../../src/shared/config/axioconfig";

// Every service tool here proxies execution to the backend, which owns the
// credentials (Gmail/Slack/etc. tokens never leave the server) and the real
// tool implementation. The schema is intentionally loose (passthrough) since
// backend already validates args against its own zod schema on invoke — the
// LLM is guided by `description` instead.
// ponytail: no per-tool arg schema mirrored here, tighten per-tool if the
// LLM starts sending malformed args often.
const argsSchema = z.object({}).passthrough();

const proxyTool = (id: string, description: string) =>
  tool(
    async (input: Record<string, unknown>) => {
      try {
        const response = await Server.post("/agent/api/executetool", { toolId: id, input });
        if (!response.data.success) {
          return `Error: ${response.data.message || "Tool execution failed."}`;
        }
        const result = response.data.result;
        return typeof result === "string" ? result : JSON.stringify(result);
      } catch (err: any) {
        return `Error: ${err.response?.data?.message || err.message}`;
      }
    },
    { name: id, description, schema: argsSchema },
  );

export const gmailTools = [
  proxyTool("gmail_list_messages", "List Gmail messages matching a search query."),
  proxyTool("gmail_read_message", "Read the full content of a single Gmail message by ID."),
  proxyTool("gmail_send_message", "Send a Gmail message."),
  proxyTool(
    "gmail_reply_message",
    "Reply to an existing Gmail message, staying in the same thread.",
  ),
];

export const slackTools = [
  proxyTool("read_slack_history", "Reads previous messages from a specific Slack channel."),
  proxyTool("send_slack_message", "Sends a new message to a specific Slack channel."),
  proxyTool(
    "list_conversations",
    "List channels, private groups, or direct messages the bot has access to.",
  ),
  proxyTool("get_user_info", "Get profile information for a specific Slack user ID."),
  proxyTool("get_team_info", "Get information about the current Slack workspace."),
];

export const discordTools = [
  proxyTool("discord_list_channels", "List channels in the connected Discord guild/server."),
  proxyTool("discord_send_message", "Sends a new message to a specific Discord channel."),
  proxyTool("discord_read_messages", "Reads previous messages from a specific Discord channel."),
];

export const notionTools = [
  proxyTool("read_notion_page", "Retrieves the title and text of a specific Notion page."),
  proxyTool(
    "update_notion_page",
    "Update the title or archive status of a specific Notion page using its ID.",
  ),
  proxyTool(
    "append_notion_blocks",
    "Appends structured blocks (headings, to-dos, callouts, etc.) to a Notion page.",
  ),
  proxyTool(
    "create_new_page",
    "Create a new sub-page inside an existing Notion page with optional initial blocks.",
  ),
  proxyTool("create_notion_database", "Create a new Notion database inside a parent page."),
  proxyTool(
    "query_notion_database",
    "Query/read a Notion database with optional filters and sorting.",
  ),
  proxyTool("add_notion_database_row", "Add a new row (page) to an existing Notion database."),
];

export const githubTools = [
  proxyTool("list_repos", "List the authenticated user's GitHub repositories."),
  proxyTool("list_issues", "List issues in a GitHub repository."),
  proxyTool("create_issue", "Create a new issue in a GitHub repository."),
  proxyTool("comment_issue", "Add a comment to an existing GitHub issue."),
  proxyTool("list_pull_requests", "List pull requests in a GitHub repository."),
  proxyTool("get_profile", "Get the authenticated GitHub user's profile information."),
  proxyTool(
    "commit_file",
    "Create or update a file in a GitHub repository and commit it directly to a branch.",
  ),
  proxyTool("list_notifications", "List the authenticated user's unread GitHub notifications."),
];

export const telegramTools = [
  proxyTool(
    "send_message",
    "Send a Telegram message to a user, contact, or group using Telegram ID.",
  ),
  proxyTool(
    "fetch_message",
    "Fetch Telegram messages of a user, contact, or group using Telegram ID.",
  ),
  proxyTool("fetch_chat_user", "Get the names and IDs of people inside a Telegram group or chat."),
  proxyTool("get_info", "Get information about a Telegram ID."),
  proxyTool("list_chats", "List all Telegram dialogs (users, groups, channels, supergroups)."),
  proxyTool("resolve_chat", "Resolve a Telegram @username to get its entity ID, title, and type."),
];

export const n8nTools = [
  proxyTool("n8n_list_workflows", "Lists all workflows in the n8n instance."),
  proxyTool("n8n_get_workflow", "Gets detailed information about a specific n8n workflow."),
  proxyTool("n8n_create_workflow", "Creates a new n8n workflow with nodes and connections."),
  proxyTool("n8n_update_workflow", "Updates an existing n8n workflow."),
  proxyTool("n8n_delete_workflow", "Permanently deletes an n8n workflow."),
  proxyTool("n8n_activate_workflow", "Activates an n8n workflow to enable its triggers."),
  proxyTool("n8n_deactivate_workflow", "Deactivates an n8n workflow to disable its triggers."),
  proxyTool("n8n_trigger_workflow", "Manually executes an n8n workflow with optional input data."),
  proxyTool("n8n_list_executions", "Lists recent n8n workflow executions."),
  proxyTool("n8n_get_execution", "Gets detailed information about a specific n8n execution."),
  proxyTool("n8n_retry_execution", "Retries a failed or canceled n8n execution."),
  proxyTool("n8n_list_credentials", "Lists available credentials in the n8n instance."),
  proxyTool("n8n_trigger_webhook", "Triggers an n8n webhook URL with optional payload."),
];

export const googleSheetTools = [
  proxyTool("google_sheets_read", "Read data from a specific Google Sheet to see current content."),
  proxyTool("google_sheets_edit", "Edit or overwrite data in a specific range of a Google Sheet."),
  proxyTool("google_sheets_delete", "Clear data from a specific range or row in a Google Sheet."),
  proxyTool(
    "google_sheets_create",
    "Create a new blank Google Spreadsheet with an optional title and initial sheet names.",
  ),
  proxyTool("google_sheets_add_sheet", "Add a new sheet/tab to an existing Google Spreadsheet."),
  proxyTool(
    "google_sheets_append",
    "Add new rows of data to the end of a sheet without overwriting current data.",
  ),
];

export const googleDocsTools = [
  proxyTool(
    "google_docs_create",
    "Create a new Google Doc with a title and optional initial text content.",
  ),
  proxyTool("google_docs_read", "Read the content of a specific Google Doc."),
  proxyTool("google_docs_delete_file", "Permanently deletes a Google Doc file from Google Drive."),
  proxyTool("google_docs_edit", "Edits a Google Doc's content, headings, and formatting."),
];

export const googleCalendarTools = [
  proxyTool(
    "google_calendar_list_events",
    "List upcoming events on a Google Calendar within a time range.",
  ),
  proxyTool("google_calendar_create_event", "Create a new event on a Google Calendar."),
  proxyTool("google_calendar_update_event", "Update an existing Google Calendar event's fields."),
  proxyTool("google_calendar_delete_event", "Permanently delete an event from a Google Calendar."),
];
