import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BrowserManager } from "../lib/browsermanager.ts";

export const browser_agent = tool(
    async ({ url, action, text, x, y, direction }) => {
        try {
            const page = await BrowserManager.getActivePage();
            await page.bringToFront();

            if (url && action === "open") {
                await page.goto("about:blank");
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                return `Opened ${url} successfully.`;
            }

            if (action === "type" && text) {
                await page.keyboard.type(text, { delay: 100 });
                await Promise.all([
                    page.keyboard.press('Enter'),
                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => { })
                ]);
                return `Typed and submitted "${text}".`;
            }

            if (action === "scroll") {
                const amount = direction === "up" ? -600 : 600;
                await page.evaluate((y: number) => {
                    window.scrollBy({ top: y, behavior: 'smooth' });
                }, amount);
                await new Promise(r => setTimeout(r, 800));
                return `Scrolled ${direction}.`;
            }

            if (action === "click" && x !== undefined && y !== undefined) {
                const browser = page.browser();

                const [newPage] = await Promise.all([
                    new Promise(resolve =>
                        browser.once("targetcreated", async (target: any) => {
                            if (target.type() === "page") {
                                resolve(await target.page());
                            }
                        })
                    ),
                    (async () => {
                        await page.mouse.move(x, y, { steps: 8 });
                        await page.mouse.down();
                        await new Promise(r => setTimeout(r, 50));
                        await page.mouse.up();
                    })()
                ]).catch(() => [null]);

                const activePage = newPage || page;

                await activePage.bringToFront();

                await activePage.waitForNavigation({
                    waitUntil: "domcontentloaded",
                    timeout: 8000
                }).catch(() => { });

                const title = await activePage.title();

                return `Clicked at (${x}, ${y}). Current Page: ${title}`;
            }

            if (action === "move_mouse" && x !== undefined && y !== undefined) {
                await page.mouse.move(x, y, { steps: 15 });
                return `Moved mouse to (${x}, ${y}).`;
            }

            const content = await BrowserManager.getPageContent(page);
            return JSON.stringify({
                content,
                message: `Action ${action} completed.`
            });

        } catch (err: any) {
            return `Browser automation error: ${err.message}`;
        }
    },
    {
        name: "browser_agent",
        description: "Controls the Chrome browser with human-like movements. Can open URLs, type, click, and scroll.",
        schema: z.object({
            url: z.string().url().optional(),
            action: z.enum(["open", "type", "scroll", "click", "move_mouse"]),
            text: z.string().optional(),
            x: z.number().optional(),
            y: z.number().optional(),
            direction: z.enum(["up", "down"]).optional()
        })
    }
);