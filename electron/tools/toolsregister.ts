import { browser_agent } from "./browsertool";
import { commandtool } from "./comandlinetool";
import { webscraper } from "./webscraptool";
import { websearch } from "./websearchtool";
import { calculatortool } from "./calculatortool";
import { datetimetool } from "./datetimetool";
import { readfiletool } from "./readfiletool";
import { writefiletool } from "./writefiletool";
import { systeminfotool } from "./systeminfotool";
import { emailtool } from "./emailtool";
import { httptool } from "./httptool";
import { jsontool } from "./jsontool";
import { cryptotool } from "./cryptotool";
import { texttool } from "./texttool";
import { githubtool } from "./githubtool";
import { discordtool } from "./discordtool";

export const toolRegistry: Record<string, any> = {
  "Web Search Agent": [websearch],
  "Command Line Agent": [commandtool],
  "Web Scraper Agent": [webscraper],
  "Browser Agent": [browser_agent],
  "Utility Agent": [calculatortool, datetimetool, readfiletool, writefiletool, systeminfotool],
  "Real World Agent": [emailtool, httptool, jsontool, cryptotool, texttool],
  "GitHub Agent": [githubtool],
  "Discord Agent": [discordtool],
};

export function getRegistryKey(toolId: string): string | undefined {
  const map: Record<string, string> = {
    web_search: "Web Search Agent",
    run_command: "Command Line Agent",
    web_scrap: "Web Scraper Agent",
    browser_agent: "Browser Agent",
    calculate: "Utility Agent",
    get_datetime: "Utility Agent",
    read_file: "Utility Agent",
    write_file: "Utility Agent",
    get_system_info: "Utility Agent",
    send_email: "Real World Agent",
    http_request: "Real World Agent",
    json_tool: "Real World Agent",
    crypto_tool: "Real World Agent",
    text_tool: "Real World Agent",
    github_action: "GitHub Agent",
    discord_action: "Discord Agent",
  };
  return map[toolId];
}
