---
name: electron-agent-dev
description: 'Debug Electron main process, IPC communication, and agent workflow issues in the MultimateAi desktop app. Use when: preload bridge fails, IPC messages don't arrive, agent workflow breaks, OAuth window won't open, or electron-store tokens are corrupted.'
user-invocable: true
---

# Electron Main Process & Agent Debugging

## When to Use
- `window.api` method throws or returns undefined
- IPC messages not reaching renderer or main process
- Agent workflow (deepagents) fails silently
- OAuth popup doesn't open or callback fails
- Token storage (electron-store) corrupted
- Agent tools not executing or approval flow broken

## Architecture Overview

```
Renderer (React) ──ipcRenderer──► Main Process (main.ts)
    │                                    │
    │  window.api.*                      ├── authIpc.ts (token storage)
    │  window.ipcRenderer.*              ├── agentworkflowIpc.ts (deepagents)
    │                                    ├── ollamabridge.ts
    │                                    └── shell.openExternal (OAuth)
    │
    └── preload.ts (contextBridge whitelist)
```

## IPC Channel Whitelist

Channels are strictly whitelisted in `electron/preload.ts`. If a channel isn't listed, the message won't go through.

**Allowed send channels** — `ALLOWED_SEND_CHANNELS`:
- `run-workflow`, `cancel-workflow`, `tool-approval-response`, `fetch-ollama-models`

**Allowed invoke channels** — `ALLOWED_INVOKE_CHANNELS`:
- `open-external-url`, `open-oauth-window`, `fetch-ollama-models`, `save-token`, `get-token`, `logout`, `google-login`

**Allowed on/listen channels** — `ALLOWED_ON_CHANNELS`:
- `node-start`, `node-stream`, `node-thinking`, `node-tool-call`, `node-tool-finished`, `node-chain-start`, `node-chain-end`, `node-error`, `workflow-complete`

### Adding a New Channel
Always add new channels to the whitelist arrays in `electron/preload.ts`. Missing whitelist entries are the #1 cause of "IPC not working".

## Agent Workflow Debugging

Agent execution runs entirely in the main process via `electron/Ipc/agentworkflowIpc.ts`.

### Debug Checklist
1. **Check the tool approval config** — `autoApprove` mode in the workflow request. If set to `"ask_every_time"`, the agent pauses until the renderer sends a `tool-approval-response`.
2. **Inspect the workflow request** — Verify all required fields: `nodes[]`, `edges[]`, `provider`, `model`, `checkpointer`, `autoApprove`, `intent`.
3. **Monitor event stream** — The workflow emits events via the IPC `on` channels. Missing events indicate a hang in the deepagents execution.
4. **Token usage logging** — The workflow logs usage to the backend after completion. If logging fails, the workflow still completes — the error is non-fatal.

### Common Failures
| Symptom | Cause | Fix |
|---------|-------|-----|
| `node-stream` silent | Agent waiting for tool approval | Send `tool-approval-response` via IPC |
| OAuth window blank | URL not in `shell.openExternal` | Use `shell.openExternal` or open in child `BrowserWindow` |
| `window.api.getToken()` returns null | Token not stored / safeStorage corrupted | Check `electron-store` file, re-authenticate |
| Agent tool not found | Tool not registered in `toolsregister.ts` | Add tool to the appropriate group in `toolsregister.ts` |

## Electron DevTools

### Main Process Debugging
Run with `--inspect` to attach Chrome DevTools:
```bash
npm run dev --inspect=5858
```
Then open `chrome://inspect` in Chrome to attach to the Electron main process.

### Renderer DevTools
Electron's `BrowserWindow.webContents.openDevTools()` is available. Uncomment in `electron/main.ts` during development.

## Encrypted Token Storage

Tokens are stored via `electron-store` with `safeStorage` encryption in `electron/Ipc/authIpc.ts`.

- Data location (Windows): `%APPDATA%/multimate-ai/config.json`
- If `safeStorage` is unavailable (rare on headless/WSL), tokens fall back to plaintext storage with a console warning
- To clear corrupted tokens: delete the config file or call `window.api.logout()`

## Rebuilding native modules

If you see `Error: The module '...' was compiled against a different Node.js version`, rebuild native modules:
```bash
npx electron-rebuild
```

## Preload Bridge Pattern

Reference: `electron/preload.ts`

```typescript
// Exposing a new API method:
contextBridge.exposeInMainWorld('api', {
  myNewMethod: (arg: string) => ipcRenderer.invoke('my-channel', arg),
})

// Always add 'my-channel' to ALLOWED_INVOKE_CHANNELS
```
