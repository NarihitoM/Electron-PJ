import { browser_agent } from "./browsertool";
import { commandtool } from "./comandlinetool";
import { webscraper } from "./webscraptool";
import { websearch } from "./websearchtool";

export const toolRegistry: Record<string, any> = {
    "Web Search Agent": [websearch],
    "Command Line Agent" : [commandtool],
    "Web Scrapping Agent" : [webscraper],
    "Browser Agent" : [browser_agent]
};
