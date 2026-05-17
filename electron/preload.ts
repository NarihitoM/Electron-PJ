import { ipcRenderer, contextBridge } from 'electron'
// preload.ts

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  openInBrowser: (url: string) => ipcRenderer.send('open-external-url', url), 
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld("api", {
  savetoken: (token: string) => ipcRenderer.send("savetoken", token),
  getToken: () => ipcRenderer.invoke("gettoken"),
  logout: () => ipcRenderer.send("logout"),
})
