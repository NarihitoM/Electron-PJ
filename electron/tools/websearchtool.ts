import { agentauth } from "../../src/features/agent/api/api";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const websearch = tool(
  async ({ query }) => {
    try {
      const response = await agentauth.Websearch(query);
      return response.data || "No results found.";
    } catch (err: unknown) {
      return `Search error: ${err}`;
    }
  },
  {
    name: "web_search",
    description: "Search Google for real-time info like weather, news, or tech specs and etc...",
    schema: z.object({
      query: z.string().describe("The search query to search for real time info"),
    }),
  },
);
