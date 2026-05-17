import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv';
import path from 'node:path'
import { Auth } from './Ipc/authIpc';
import { RunAgent } from './Ipc/agentworkflowIpc';


dotenv.config({ path: path.join(process.cwd(), '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null


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
    icon: path.join(process.env.VITE_PUBLIC, 'Multimate.png'),
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  Menu.setApplicationMenu(null);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.openDevTools({ mode: "detach" });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}`)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}


//Functions
Auth();
RunAgent();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

ipcMain.on('open-external-url', (_, url) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow();
})
