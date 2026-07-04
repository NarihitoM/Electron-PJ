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
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            (window as any).chrome = { runtime: {} };
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });
    }

    private static async getBrowser() {
        if (!this.browser) {
            const path = this.getDynamicChromePath();

            this.browser = await puppeteer.launch({
                headless: false,
                executablePath: path || undefined,
                defaultViewport: { width: 1200, height: 900 },
                args: [
                    '--window-size=1200,900',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=ChromeWhatsNewUI',
                    '--disable-sync',
                    '--no-first-run'
                ]
            });
            this.browser.on('disconnected', () => {
                this.browser = null;
                this.activePage = null;
            });
            this.browser.on('targetcreated', async (target: any) => {
                if (target.type() === 'page') {
                    const page = await target.page();
                    if (page) {
                        await this.patchPage(page);
                        this.activePage = page;
                        await page.bringToFront();
                    }
                }
            });
        }
        return this.browser;
    }

    static async getActivePage() {
        const browser = await this.getBrowser();

        if (this.activePage && !this.activePage.isClosed()) {
            await this.patchPage(this.activePage);
            return this.activePage;
        }

        const pages = await browser.pages();

        if (pages.length > 0) {
            this.activePage = pages[pages.length - 1];
        } else {
            this.activePage = await browser.newPage();
        }

        await this.patchPage(this.activePage);
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
