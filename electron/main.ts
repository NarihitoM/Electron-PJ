import { app, BrowserWindow, Menu, shell, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import path from "node:path";
import { Auth } from "./Ipc/authIpc";
import { RunAgent } from "./Ipc/agentworkflowIpc";
import { fetchOllamaModels } from "./lib/ollamabridge";
import {
  ensureOllamaTunnel,
  closeAllOllamaTunnels,
  getPersistedOllamaHost,
} from "./lib/ollamatunnel";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;

const isAllowedUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

function createWindow() {
  win = new BrowserWindow({
    title: "Multimate",
    width: 1100,
    height: 700,
    minWidth: 1000,
    minHeight: 500,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    minimizable: true,
    icon: path.join(process.env.VITE_PUBLIC, "Multimate.png"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}`);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  Auth();
  RunAgent();
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("before-quit", () => {
  closeAllOllamaTunnels();
});

ipcMain.on("open-external-url", (_, url) => {
  if (typeof url === "string" && isAllowedUrl(url)) {
    shell.openExternal(url);
  }
});

ipcMain.handle("fetch-ollama-models", async (_event, baseUrl?: string, apiKey?: string) => {
  return fetchOllamaModels(baseUrl, apiKey);
});

ipcMain.handle("ensure-ollama-tunnel", async (_event, localUrl: string) => {
  return ensureOllamaTunnel(localUrl);
});

ipcMain.handle("get-ollama-local-host", () => {
  return getPersistedOllamaHost();
});

ipcMain.on("open-oauth-window", (event, url) => {
  if (typeof url !== "string") return;
  const oauthWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: "persist:oauth",
    },
  });
  const chromeUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  oauthWindow.webContents.setUserAgent(chromeUA);
  oauthWindow.webContents.setWindowOpenHandler(({ url: popupUrl }) => {
    const popup = new BrowserWindow({
      width: 800,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:oauth",
      },
    });
    popup.webContents.setUserAgent(chromeUA);
    popup.loadURL(popupUrl);
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        webPreferences: { partition: "persist:oauth" },
      },
    };
  });
  oauthWindow.webContents.on("did-navigate", (_, url) => {
    if (url.includes("/slack/api/callback") || url.includes("/notion/api/notioncallback")) {
      setTimeout(() => {
        if (!oauthWindow.isDestroyed()) oauthWindow.close();
      }, 2000);
    }
  });
  oauthWindow.loadURL(url);
  oauthWindow.on("closed", () => {
    event.sender.send("oauth-window-closed");
  });
});

app.whenReady().then(async () => {
  createWindow();
});
