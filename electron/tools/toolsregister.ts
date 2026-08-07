import { browser_agent } from "./browsertool";
import { commandtool } from "./comandlinetool";
import { webscraper } from "./webscraptool";
import { websearch } from "./websearchtool";
import { readfiletool } from "./readfiletool";
import { writefiletool } from "./writefiletool";
import { httptool } from "./httptool";
import {
  gmailTools,
  slackTools,
  discordTools,
  notionTools,
  githubTools,
  telegramTools,
  n8nTools,
  googleSheetTools,
  googleDocsTools,
  googleCalendarTools,
} from "./servicetools";
import { SERVICE_TOOL_MAP } from "../../src/shared/config/toolsselection";

export const toolRegistry: Record<string, any> = {
  "Web Search Agent": [websearch],
  "Command Line Agent": [commandtool],
  "Web Scraper Agent": [webscraper],
  "Browser Agent": [browser_agent],
  "Utility Agent": [readfiletool, writefiletool],
  "HTTP Agent": [httptool],
  "Gmail Agent": gmailTools,
  "Slack Agent": slackTools,
  "Discord Agent": discordTools,
  "Notion Agent": notionTools,
  "GitHub Agent": githubTools,
  "Telegram Agent": telegramTools,
  "n8n Agent": n8nTools,
  "Google Sheets Agent": googleSheetTools,
  "Google Docs Agent": googleDocsTools,
  "Google Calendar Agent": googleCalendarTools,
};

const SERVICE_REGISTRY_KEY: Record<string, string> = {
  gmail: "Gmail Agent",
  slack: "Slack Agent",
  discord: "Discord Agent",
  notion: "Notion Agent",
  github: "GitHub Agent",
  telegram: "Telegram Agent",
  n8n: "n8n Agent",
  googlesheet: "Google Sheets Agent",
  googledocs: "Google Docs Agent",
  googlecalendar: "Google Calendar Agent",
};

export function getRegistryKey(toolId: string): string | undefined {
  const service = SERVICE_TOOL_MAP[toolId];
  if (service) return SERVICE_REGISTRY_KEY[service];

  const map: Record<string, string> = {
    web_search: "Web Search Agent",
    run_command: "Command Line Agent",
    web_scrap: "Web Scraper Agent",
    browser_agent: "Browser Agent",
    read_file: "Utility Agent",
    write_file: "Utility Agent",
    http_request: "HTTP Agent",
  };
  return map[toolId];
}
