import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const datetimetool = tool(
  async ({ timezone }) => {
    try {
      const now = new Date();
      const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "long",
      };
      const formatted = new Intl.DateTimeFormat("en-US", opts).format(now);
      const utc = now.toUTCString();
      const unix = Math.floor(now.getTime() / 1000);
      return `Current time: ${formatted}\nUTC: ${utc}\nUnix timestamp: ${unix}\nTimezone: ${tz}`;
    } catch (err: any) {
      return `Date/time error: ${err.message}`;
    }
  },
  {
    name: "get_datetime",
    description:
      "Get the current date, time, timezone, and Unix timestamp. Optionally specify an IANA timezone (e.g., 'America/New_York', 'Asia/Tokyo', 'Europe/London').",
    schema: z.object({
      timezone: z
        .string()
        .optional()
        .describe(
          "IANA timezone string like 'America/New_York' or 'UTC'. Defaults to system timezone.",
        ),
    }),
  },
);
