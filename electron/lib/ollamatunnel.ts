import localtunnel, { type Tunnel } from "localtunnel";
import Store from "electron-store";

const store = new Store({
  name: "ollama-tunnel",
  defaults: { localHost: null as string | null },
});

interface TunnelEntry {
  tunnel: Tunnel;
  url: string;
}

const LOCAL_HOST_PATTERN =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/i;

const activeTunnels = new Map<number, TunnelEntry>();

export function isLocalHost(urlString: string): boolean {
  try {
    const { hostname } = new URL(urlString);
    return LOCAL_HOST_PATTERN.test(hostname);
  } catch {
    return false;
  }
}

// Our chat backend runs on Vercel and can't reach the user's own localhost,
// so a locally-hosted Ollama needs a public tunnel URL to be reachable from there.
// Tunnel URLs die whenever the app restarts, so we remember the original local
// host and let the renderer silently re-tunnel + resync on every launch.
export async function ensureOllamaTunnel(localUrl: string): Promise<string> {
  const parsed = new URL(localUrl);
  if (!LOCAL_HOST_PATTERN.test(parsed.hostname)) {
    return localUrl;
  }

  store.set("localHost", localUrl);

  const port = Number(parsed.port) || 80;
  const existing = activeTunnels.get(port);
  if (existing) {
    return existing.url;
  }

  const tunnel = await localtunnel({ port });
  activeTunnels.set(port, { tunnel, url: tunnel.url });

  const cleanup = () => activeTunnels.delete(port);
  tunnel.on("close", cleanup);
  tunnel.on("error", cleanup);

  return tunnel.url;
}

export function getPersistedOllamaHost(): string | null {
  return store.get("localHost") as string | null;
}

export function closeAllOllamaTunnels(): void {
  for (const { tunnel } of activeTunnels.values()) {
    try {
      tunnel.close();
    } catch {
      /* already closed */
    }
  }
  activeTunnels.clear();
}
