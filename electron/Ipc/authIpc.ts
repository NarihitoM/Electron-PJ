import { ipcMain, safeStorage, BrowserWindow } from "electron";
import Store from "electron-store";
import crypto from "crypto";

const store = new Store({
    name: 'user-preferences',
    defaults: {
        encryptedToken: null
    }
});

const CLIENT_ID = process.env.VITE_CLIENTID || '799629617070-qtaj2v5253jegipqmurpborktrhd0blo.apps.googleusercontent.com';

export const getusertoken = (): string | null => {
    try {
        const hexToken = store.get('encryptedToken') as string | null;
        if (!hexToken) return null;

        const buffer = Buffer.from(hexToken, 'hex');
        return safeStorage.decryptString(buffer);
    } catch (error) {
        console.error("Internal Token Read Error:", error);
        return null;
    }
};

export const Auth = () => {
    ipcMain.on('savetoken', (_, token) => {
        try {
            if (!safeStorage.isEncryptionAvailable()) return;
            const encryptedBuffer = safeStorage.encryptString(token);
            store.set('encryptedToken', encryptedBuffer.toString('hex'));
        } catch (error) {
            console.error("Save Error:", error);
        }
    });

    ipcMain.handle('gettoken', () => {
        try {
            const hexToken = store.get('encryptedToken') as string | null;
            if (!hexToken) return null;

            const buffer = Buffer.from(hexToken, 'hex');
            return safeStorage.decryptString(buffer);
        } catch (error) {
            console.error("Read Error:", error);
            return null;
        }
    });

    ipcMain.on('logout', () => {
        try {
            store.delete('encryptedToken');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });

    ipcMain.handle('trigger-google-login', async () => {
        return new Promise((resolve) => {
            const TIMEOUT_MS = 120000;
            let settled = false;

            const settle = (result: any) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                resolve(result);
            };

            const timeout = setTimeout(() => {
                if (!authWindow.isDestroyed()) authWindow.close();
                settle({ success: false, error: "Login timed out. Please try again." });
            }, TIMEOUT_MS);

            const authWindow = new BrowserWindow({
                width: 800,
                height: 700,
                show: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            authWindow.on('closed', () => {
                settle({ success: false, error: "Login window was closed." });
            });

            const backendUrl = process.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
            const backendRedirect = `${backendUrl}/auth/api/googlecallback`;
            const oauthState = crypto.randomBytes(16).toString("hex");
            const nativeAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(backendRedirect)}` +
                `&response_type=token` +
                `&state=${oauthState}` +
                `&scope=${encodeURIComponent('openid email profile')}`;

            authWindow.webContents.on('did-navigate', (_event, url) => {
                try {
                    const parsed = new URL(url);
                    if (parsed.origin === backendUrl && parsed.pathname === '/auth/api/googlecallback') {
                        const hash = parsed.hash || '';
                        if (hash.startsWith('#')) {
                            const params = new URLSearchParams(hash.substring(1));
                            const accessToken = params.get('access_token');
                            if (accessToken) {
                                if (!authWindow.isDestroyed()) authWindow.close();
                                settle({ success: true, access_token: accessToken });
                            }
                        }
                    }
                } catch {}
            });

            authWindow.loadURL(nativeAuthUrl);
        });
    });
};
