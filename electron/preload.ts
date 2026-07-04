import { ipcRenderer, contextBridge } from 'electron'

const ALLOWED_SEND_CHANNELS = [
    'savetoken', 'logout', 'open-external-url', 'open-oauth-window',
    'run-workflow', 'cancel-workflow', 'tool-approval-response',
];
const ALLOWED_INVOKE_CHANNELS = [
    'gettoken', 'trigger-google-login', 'fetch-ollama-models',
];
const ALLOWED_ON_CHANNELS = [
    'oauth-window-closed', 'tool-approval-request',
    'node-start', 'node-finished', 'node-stream', 'node-thinking',
    'node-tool-call', 'node-tool-finished', 'node-chain-start', 'node-chain-end',
    'node-error',
];

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(channel: string, listener: (...args: any[]) => void) {
        if (!ALLOWED_ON_CHANNELS.includes(channel)) {
            console.warn(`Blocked ipcRenderer.on for unauthorized channel: ${channel}`);
            return { off: () => {} };
        }
        const handler = (_event: any, ...args: any[]) => listener(_event, ...args);
        ipcRenderer.on(channel, handler);
        return { off: () => ipcRenderer.removeListener(channel, handler) };
    },
    send(channel: string, ...args: any[]) {
        if (!ALLOWED_SEND_CHANNELS.includes(channel)) {
            console.warn(`Blocked ipcRenderer.send for unauthorized channel: ${channel}`);
            return;
        }
        ipcRenderer.send(channel, ...args);
    },
    invoke(channel: string, ...args: any[]) {
        if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
            console.warn(`Blocked ipcRenderer.invoke for unauthorized channel: ${channel}`);
            return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
        }
        return ipcRenderer.invoke(channel, ...args);
    },
    openInBrowser: (url: string) => ipcRenderer.send('open-external-url', url),
    openOAuthWindow: (url: string) => ipcRenderer.send('open-oauth-window', url),
    onOAuthWindowClosed: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('oauth-window-closed', handler);
        return () => ipcRenderer.removeListener('oauth-window-closed', handler);
    },
    removeAllListeners: (channel: string) => {
        if (ALLOWED_ON_CHANNELS.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    },
})

contextBridge.exposeInMainWorld("api", {
    savetoken: (token: string) => ipcRenderer.send("savetoken", token),
    getToken: () => ipcRenderer.invoke("gettoken"),
    logout: () => ipcRenderer.send("logout"),
    googlelogin: () => ipcRenderer.invoke("trigger-google-login"),
    fetchOllamaModels: (baseUrl?: string, apiKey?: string) => ipcRenderer.invoke("fetch-ollama-models", baseUrl, apiKey)
})
