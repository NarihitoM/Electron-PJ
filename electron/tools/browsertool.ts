import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BrowserManager } from "../lib/browsermanager.ts";

function getElementInfo(page: any, x: number, y: number) {
    return page.evaluate((px: number, py: number) => {
        const el = document.elementFromPoint(px, py);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        const text = (el as HTMLElement).innerText?.slice(0, 100) || "";
        const attrs: Record<string, string> = {};
        for (const attr of el.attributes) {
            if (["id", "class", "type", "name", "placeholder", "href", "role", "aria-label", "value", "src", "alt"].includes(attr.name)) {
                attrs[attr.name] = attr.value;
            }
        }
        return { tag, text, attrs, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
    }, x, y);
}

function elSummary(info: any) {
    if (!info) return "no element";
    let s = `<${info.tag}>`;
    if (info.text) s += ` "${info.text.slice(0, 50)}"`;
    if (info.attrs.href) s += ` href="${info.attrs.href}"`;
    if (info.attrs.placeholder) s += ` placeholder="${info.attrs.placeholder}"`;
    return s;
}

async function waitForPageSettle(_page: any) {
    await new Promise(r => setTimeout(r, 1200));
}

/** Dispatch native change + blur events on the focused element to trigger
 *  framework form validation (React, Vue, Angular — many validate on blur/change). */
async function dispatchFormEvents(page: any) {
    await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 100));
}

export const browser_agent = tool(
    async ({ url, action, text, x, y, direction, key }) => {
        try {
            const page = await BrowserManager.getActivePage();
            await page.bringToFront();

            if (url && action === "open") {
                await page.goto("about:blank");
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await waitForPageSettle(page);
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({ action: "open", url, pageTitle: content.title, pageContent: content });
            }

            if (action === "type" && text) {
                // If coordinates provided, click first to focus the element
                if (x !== undefined && y !== undefined) {
                    await page.mouse.move(x, y, { steps: 6 });
                    await new Promise(r => setTimeout(r, 80));
                    await page.mouse.click(x, y);
                    await new Promise(r => setTimeout(r, 200));
                }
                const activeEl = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el) return null;
                    return { tag: el.tagName.toLowerCase(), placeholder: (el as HTMLInputElement).placeholder || "", value: (el as HTMLInputElement).value || "" };
                });
                await page.keyboard.type(text, { delay: 80 });
                await new Promise(r => setTimeout(r, 300));
                // Dispatch change + blur so framework validation fires
                await dispatchFormEvents(page);
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({
                    action: "type",
                    text,
                    focusedElement: activeEl ? `<${activeEl.tag}> placeholder="${activeEl.placeholder}"` : null,
                    pageTitle: content.title
                });
            }

            if (action === "press_key" && key) {
                await page.keyboard.press(key);
                await waitForPageSettle(page);
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({ action: "press_key", key, pageTitle: content.title });
            }

            if (action === "scroll") {
                const amount = direction === "up" ? -600 : 600;
                await page.evaluate((y: number) => {
                    window.scrollBy({ top: y, behavior: 'smooth' });
                }, amount);
                await new Promise(r => setTimeout(r, 800));
                const viewport = await page.evaluate(() => ({ scrollY: window.scrollY, innerHeight: window.innerHeight }));
                return JSON.stringify({ action: "scroll", direction, viewport });
            }

            if (action === "click" && x !== undefined && y !== undefined) {
                const browser = page.browser();
                const elementInfo = await getElementInfo(page, x, y);

                await page.mouse.move(x, y, { steps: 8 });
                await new Promise(r => setTimeout(r, 100));

                let newPage: any = null;
                const onTarget = (target: any) => {
                    if (target.type() === "page") {
                        target.page().then((p: any) => { newPage = p; });
                    }
                };
                browser.on("targetcreated", onTarget);

                await page.mouse.down();
                await new Promise(r => setTimeout(r, 80));
                await page.mouse.up();
                await new Promise(r => setTimeout(r, 200));

                await Promise.race([
                    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5000 }).catch(() => { }),
                    new Promise(r => setTimeout(r, 2000))
                ]);

                browser.removeListener("targetcreated", onTarget);

                if (newPage) {
                    try { await newPage.bringToFront(); } catch {}
                }

                const activePage = (newPage && !newPage.isClosed()) ? newPage : page;
                await waitForPageSettle(activePage);

                const title = await activePage.title();
                const content = await BrowserManager.getPageContent(activePage);

                return JSON.stringify({
                    action: "click",
                    position: { x, y },
                    element: elSummary(elementInfo),
                    pageTitle: title,
                    pageContent: content,
                    newTab: !!newPage
                });
            }

            if (action === "select_option" && x !== undefined && y !== undefined && text !== undefined) {
                const elementInfo = await getElementInfo(page, x, y);

                await page.mouse.move(x, y, { steps: 6 });
                await new Promise(r => setTimeout(r, 80));
                await page.mouse.click(x, y);
                await new Promise(r => setTimeout(r, 300));

                await page.evaluate((value: string) => {
                    const el = document.activeElement as HTMLSelectElement | null;
                    if (!el || el.tagName.toLowerCase() !== "select") return;
                    for (let i = 0; i < el.options.length; i++) {
                        if (el.options[i].value === value || el.options[i].text === value) {
                            el.selectedIndex = i;
                            el.dispatchEvent(new Event("change", { bubbles: true }));
                            break;
                        }
                    }
                }, text);

                await new Promise(r => setTimeout(r, 200));
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({
                    action: "select_option",
                    value: text,
                    element: elSummary(elementInfo),
                    pageTitle: content.title,
                    pageContent: content,
                });
            }

            if (action === "fill_field" && x !== undefined && y !== undefined && text !== undefined) {
                const elementInfo = await getElementInfo(page, x, y);

                await page.mouse.move(x, y, { steps: 6 });
                await new Promise(r => setTimeout(r, 80));
                await page.mouse.click(x, y);
                await new Promise(r => setTimeout(r, 200));

                await page.keyboard.down('Control');
                await page.keyboard.press('a');
                await page.keyboard.up('Control');
                await new Promise(r => setTimeout(r, 100));
                await page.keyboard.press('Delete');
                await new Promise(r => setTimeout(r, 100));

                await page.keyboard.type(text, { delay: 50 });
                await new Promise(r => setTimeout(r, 200));

                // Dispatch change + blur so framework validation fires
                await dispatchFormEvents(page);

                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({
                    action: "fill_field",
                    position: { x, y },
                    text,
                    element: elSummary(elementInfo),
                    pageTitle: content.title,
                    pageContent: content
                });
            }

            if (action === "move_mouse" && x !== undefined && y !== undefined) {
                await page.mouse.move(x, y, { steps: 15 });
                const elementInfo = await getElementInfo(page, x, y);
                return JSON.stringify({
                    action: "move_mouse",
                    position: { x, y },
                    element: elSummary(elementInfo)
                });
            }

            if (action === "screenshot") {
                await new Promise(r => setTimeout(r, 300));
                const screenshot = await page.screenshot({ type: "jpeg", quality: 50, encoding: "base64" });
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({ action: "screenshot", screenshot, pageTitle: content.title, pageContent: content });
            }

            if (action === "get_html") {
                const html = await page.evaluate(() => document.documentElement.outerHTML.slice(0, 5000));
                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({ action: "get_html", html, pageTitle: content.title, pageContent: content });
            }

            if (action === "get_overlays") {
                const overlays = await page.evaluate(() => {
                    const results: any[] = [];
                    const candidates = document.querySelectorAll(
                        'div[class*="modal"], div[class*="overlay"], div[class*="popup"], div[class*="cookie"], ' +
                        'div[class*="banner"], div[class*="consent"], div[class*="dialog"], div[class*="notification"], ' +
                        'div[class*="signin"], div[class*="login"], div[aria-modal="true"], div[role="dialog"]'
                    );
                    candidates.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 100 && rect.height > 50) {
                            results.push({
                                tag: el.tagName.toLowerCase(),
                                id: el.id,
                                className: el.className?.slice(0, 100),
                                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                                text: (el as HTMLElement).innerText?.slice(0, 60) || ""
                            });
                        }
                    });
                    return results;
                });
                return JSON.stringify({ action: "get_overlays", overlays, count: overlays.length });
            }

            if (action === "get_elements") {
                const elements = await page.evaluate(() => {
                    const selector = [
                        'a[href]', 'button', 'input:not([type="hidden"])', 'textarea', 'select',
                        '[contenteditable]', '[role="button"]', '[role="link"]', '[role="tab"]',
                        '[role="menuitem"]', '[role="checkbox"]', '[role="switch"]', '[role="combobox"]',
                        '[onclick]', 'label'
                    ].join(',');
                    const nodes = document.querySelectorAll(selector);
                    const results: any[] = [];
                    const vw = window.innerWidth;
                    const vh = window.innerHeight;
                    const maxNodes = Math.min(nodes.length, 100);

                    for (let i = 0; i < maxNodes; i++) {
                        const el = nodes[i];
                        const rect = el.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) continue;
                        if (rect.bottom < 0 || rect.top > vh) continue;
                        if (rect.right < 0 || rect.left > vw) continue;
                        if ((el as HTMLElement).offsetParent === null) continue;

                        const tag = el.tagName.toLowerCase();
                        const inputType = (el as HTMLInputElement).type || "";
                        const text = (el as HTMLElement).innerText?.slice(0, 40) || "";
                        const placeholder = (el as HTMLInputElement).placeholder || "";
                        const href = (el as HTMLAnchorElement).href || "";

                        let role = tag;
                        if (tag === 'input' && inputType) role = `input[${inputType}]`;
                        else if (tag === 'a') role = 'link';
                        else if (tag === 'button') role = 'button';
                        else if (el.getAttribute('role')) role = el.getAttribute('role')!;

                        results.push({
                            index: results.length,
                            tag,
                            role,
                            text,
                            placeholder,
                            href,
                            rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
                            center: { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) },
                        });

                        if (results.length >= 30) break;
                    }

                    results.sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x);
                    return results;
                });

                const summaries = elements.map((el: any) => {
                    let s = `<${el.tag}>`;
                    if (el.text) s += ` "${el.text.slice(0, 40)}"`;
                    if (el.placeholder) s += ` placeholder="${el.placeholder}"`;
                    if (el.href) s += ` href="${el.href.slice(0, 60)}"`;
                    return `[${el.index}] ${s} at (${el.center.x}, ${el.center.y}) rect=${el.rect.width}x${el.rect.height}`;
                });

                const content = await BrowserManager.getPageContent(page);
                return JSON.stringify({ action: "get_elements", elements, count: elements.length, summaries, pageTitle: content.title });
            }

            const content = await BrowserManager.getPageContent(page);
            return JSON.stringify({ content, message: `Action ${action} completed.` });

        } catch (err: any) {
            return `Browser automation error: ${err.message}`;
        }
    },
    {
        name: "browser_agent",
        description: `Human-like browser control with position feedback. Actions: open, type, press_key, scroll, click, move_mouse, fill_field, select_option, screenshot, get_html, get_overlays, get_elements.

PRIMARY DISCOVERY TOOL — get_elements:
Call get_elements FIRST after opening a page. It returns a sorted list of all visible interactive elements (inputs, buttons, links, etc.) with their center coordinates and bounding rects. Use the center coordinates to target elements.

FORM FILLING — fill_field(x, y, text):
The best way to fill forms. Clicks the position, selects ALL existing text (Ctrl+A), deletes it, then types the new text. Dispatches change + blur events automatically so form validation (React/Vue/Angular) fires and the submit button enables. Use after get_elements to find input coordinates.

TYPE WITH CLICK — type(x, y, text):
Same as fill_field but APPENDS text instead of clearing existing content. Clicks at (x,y) first to focus the element, then types. Dispatches change + blur events after typing.

SELECT DROPDOWN — select_option(x, y, "Option Text"):
Selects an option from a <select> dropdown. Click coordinates + option label or value.

SEARCH WORKFLOW (e.g. YouTube / Google):
1. open a URL
2. get_overlays — dismiss any blocking modals
3. get_elements — find the search <input> by placeholder
4. fill_field(center.x, center.y, "your query") — clicks + types in one step
5. press_key("Enter") to submit

IMPORTANT NOTES:
- fill_field clears existing text first (unlike type which appends).
- type with (x,y) clicks first; type without (x,y) types into the currently focused element.
- Both fill_field and type fire change+blur events so form validation enables the submit button.
- type does NOT press Enter. Use press_key("Enter") to submit.
- get_overlays detects modals/cookie banners blocking content. Dismiss them first.`,
        schema: z.object({
            url: z.string().url().optional(),
            action: z.enum(["open", "type", "press_key", "scroll", "click", "move_mouse", "fill_field", "select_option", "screenshot", "get_html", "get_overlays", "get_elements"]),
            text: z.string().optional(),
            x: z.number().optional(),
            y: z.number().optional(),
            direction: z.enum(["up", "down"]).optional(),
            key: z.string().optional()
        })
    }
);
