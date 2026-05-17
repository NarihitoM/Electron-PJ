import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

export const webscraper = tool(
    async ({ url }) => {
        try {
           const response = await axios.get(`https://r.jina.ai/${url}`, {
                headers: {
                    'Accept': 'text/plain', 
                },
                timeout: 15000
            });

            const cleanText = response.data;

            console.log("Scraped Data Length:", cleanText.length);

            if (!cleanText || cleanText.length < 50) {
                return "The page was reached, but no significant text content was found.";
            }

            return cleanText.substring(0, 8000);
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                return `Scraping error (${err.response?.status || 'Network Error'}): ${err.message}`;
            }
            return `Scraping error: ${err.message}`;
        }
    },
    {
        name: "web_scrap",
        description: "Extracts text content from a URL. Use this to read the full content of a specific webpage.",
        schema: z.object({
            url: z.string().url().describe("The URL to scrape")
        })
    }
);