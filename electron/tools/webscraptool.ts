import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { agentauth } from "../../src/features/agent/api/api";

export const webscraper = tool(
  async ({ url }) => {
    try {
      const res = await agentauth.FirecrawlScrape(url);
      const markdown = res.data?.markdown || "";

      if (!markdown || markdown.length < 50) {
        return "The page was reached, but no significant text content was found.";
      }

      return markdown.substring(0, 8000);
    } catch (err: any) {
      return `Scraping error: ${err.message}`;
    }
  },
  {
    name: "web_scrap",
    description:
      "Extracts text content from a URL using Firecrawl. Use this to read the full content of a specific webpage.",
    schema: z.object({
      url: z.string().url().describe("The URL to scrape"),
    }),
  },
);
