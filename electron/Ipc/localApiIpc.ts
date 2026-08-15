import { ipcMain } from "electron";
import Store from "electron-store";
import crypto from "crypto";
import { startLocalApiServer, stopLocalApiServer, getLocalApiStatus } from "../lib/localApiServer";
import { getusertoken } from "./authIpc";

const store = new Store({
  name: "user-preferences",
  defaults: {
    localApiKey: null,
  },
});

const getOrCreateLocalApiKey = (): string => {
  let key = store.get("localApiKey") as string | null;
  if (!key) {
    key = crypto.randomBytes(32).toString("hex");
    store.set("localApiKey", key);
  }
  return key;
};

export const LocalApi = () => {
  ipcMain.handle("ensure-local-api-key", () => {
    return getOrCreateLocalApiKey();
  });

  ipcMain.handle("get-local-api-status", () => {
    return getLocalApiStatus();
  });

  ipcMain.handle("start-local-api", async (_event, config) => {
    const { encryptkey, useremail, hostmap, models, port } = config || {};

    if (!encryptkey || !useremail) {
      throw new Error(
        "Provider configuration missing. Please log in and configure providers first.",
      );
    }

    const token = getusertoken();
    if (!token) {
      throw new Error("No Auth Token Found. Please log in first.");
    }
    process.env.CURRENT_AUTH_TOKEN = token;

    const apiKey = getOrCreateLocalApiKey();

    return startLocalApiServer({
      encryptkey,
      useremail,
      hostmap: hostmap || {},
      models: models || {},
      port,
      apiKey,
      token,
    });
  });

  ipcMain.handle("stop-local-api", async () => {
    stopLocalApiServer();
    return getLocalApiStatus();
  });

  ipcMain.handle("get-local-api-url", () => {
    const status = getLocalApiStatus();
    return {
      url: status.running ? status.url : `http://127.0.0.1:${status.port}/v1`,
      running: status.running,
    };
  });
};
