import puppeteer from "puppeteer";
import fs from "node:fs";

export class BrowserManager {
    private static browser: any = null;
    private static activePage: any = null;

    private static getDynamicChromePath(): string | undefined {
        const platform = process.platform;
        if (platform !== 'win32') return undefined; 

        const commonPaths = [
            `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
        ];

        for (const path of commonPaths) {
            if (fs.existsSync(path)) return path;
        }

        return undefined;
    }

    private static async patchPage(page: any) {
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });
    }

    private static async getBrowser() {
        if (!this.browser) {
            const chromePath = this.getDynamicChromePath();

            // Build Chrome launch args — no --user-data-dir so Chrome
            // automatically uses the user's default profile (with all logins).
            const args = [
                '--window-size=1200,900',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=ChromeWhatsNewUI',
                '--no-first-run'
            ];

            // KEY FIX: ignoreDefaultArgs removes "--enable-automation" which is
            // the single flag that makes Chrome show "controlled by automated
            // software" and blocks Google sign-in.  Puppeteer still gets full
            // CDP control so keyboard / mouse / evaluate all work normally.
            this.browser = await puppeteer.launch({
                headless: false,
                executablePath: chromePath || undefined,
                ignoreDefaultArgs: ['--enable-automation'],
                defaultViewport: { width: 1200, height: 900 },
                args,
            });

            this.browser.on('disconnected', () => {
                this.browser = null;
                this.activePage = null;
            });
            this.browser.on('targetcreated', async (target: any) => {
                if (target.type() === 'page') {
                    try {
                        const page = await target.page();
                        if (page) {
                            await this.patchPage(page);
                            this.activePage = page;
                            await page.bringToFront();
                        }
                    } catch {}
                }
            });
        }
        return this.browser;
    }

    static async getActivePage() {
        const browser = await this.getBrowser();

        if (this.activePage) {
            try {
                if (!this.activePage.isClosed()) return this.activePage;
            } catch { this.activePage = null; }
        }

        try {
            const pages = await browser.pages();
            if (pages.length > 0) {
                this.activePage = pages[pages.length - 1];
                await this.activePage.bringToFront();
                return this.activePage;
            }
        } catch {}

        this.activePage = await browser.newPage();
        await this.activePage.bringToFront();
        return this.activePage;
    }

    static async getPageContent(page: any) {
        return await page.evaluate(() => ({
            title: document.title,
            text: document.body.innerText.slice(0, 1000)
        }));
    }
}
