---
name: agent-workflow-builder
description: "Build or debug multi-agent workflows in the MultimateAi desktop app. Use when: creating agent nodes, wiring up sequential/simultaneous execution, configuring tool approval, or working with the local agent system."
user-invocable: true
---

# Agent Workflow Builder

## When to Use

- Building a multi-agent workflow in the UI (`/app/localagent`)
- Understanding the Electron main process agent execution engine
- Configuring tool approval modes (auto-approve, ask every time, ask once)
- Debugging agent node execution failures

## Architecture

```
Layer 1: React UI (src/features/agent/)
  → Node graph with provider/model/tools per node
  → Sequential & simultaneous execution modes

Layer 2: IPC Bridge (electron/preload.ts → electron/Ipc/agentworkflowIpc.ts)
  → Sends workflow config to main process
  → Streams events back: node-start, node-stream, node-thinking, etc.

Layer 3: Agent Engine (electron/Agent/)
  → node-deepagent.ts — wraps deepagents package
  → provider.ts — LLM provider factory (10 providers)
  → workflow.ts — orchestrates multi-node execution
```

## Agent UI Structure

The agent feature lives in `src/features/agent/` and has its own store, components, and types:

```
features/agent/
├── api/api.ts              # Workflow execution via IPC
├── components/
│   ├── AgentBuilder.tsx     # Main workflow builder
│   ├── NodeEditor.tsx       # Configure individual nodes
│   └── WorkflowRunner.tsx   # Run & monitor execution
├── hooks/
├── store/store.ts          # Agent workflow state
├── types/type.ts           # Node, Edge, Workflow types
└── index.ts
```

## Node Configuration

Each agent node has:

```typescript
interface AgentNodeConfig {
  name: string;
  actor: string; // System prompt persona
  provider: string; // LLM provider (openai, anthropic, etc.)
  model: string; // Model name
  systemPrompt: string; // Custom system prompt override
  tools: string[]; // Tool group names to enable
  intent: string; // What the agent should accomplish
  autoApprove: "auto" | "ask_every_time" | "ask_once_per_session";
}
```

## Execution Modes

### 1. Specific Node (Single)

Execute one node in isolation. All other nodes are ignored.

### 2. Linear Sequence (Range)

Nodes execute in order from first to last. Each node's output feeds into the next.

```typescript
// workflow.ts handles this as sequential execution
for (const node of nodesInRange) {
  const agent = createDeepAgent({ ...node.config });
  const result = await agent.invoke({ messages });
  messages = result.messages; // Pass to next node
}
```

### 3. Simultaneous

Independent nodes execute in parallel. Results are merged.

```typescript
// workflow.ts handles this with Promise.all
const results = await Promise.all(
  independentNodes.map((node) => agent.invoke({ messages: node.input })),
);
```

## Tool Approval System

Defined in `electron/Ipc/agentworkflowIpc.ts`:

| Mode                   | Behavior                                                                      |
| ---------------------- | ----------------------------------------------------------------------------- |
| `auto`                 | Tool calls execute without user intervention                                  |
| `ask_every_time`       | Every tool call pauses and sends `tool-approval-response` request to renderer |
| `ask_once_per_session` | First tool call asks; subsequent calls auto-approved within same session      |

The approval flow:

1. Agent hits a write tool → workflow pauses via `interruptOn`
2. Renderer shows `ToolApprovalDialog`
3. User approves/rejects → `tool-approval-response` sent via IPC
4. Workflow resumes with `new Command({ resume: ... })`

## Provider Factory

Defined in `electron/Agent/provider.ts`. Supports 10 providers:

| Provider         | Package                   | Model Prefix                                   |
| ---------------- | ------------------------- | ---------------------------------------------- |
| OpenAI           | `@langchain/openai`       | `gpt-4o`, `gpt-4o-mini`, `o1`, `o3`, `o4-mini` |
| Anthropic        | `@langchain/anthropic`    | `claude-3.5-sonnet`, `claude-3-opus`           |
| Google Gemini    | `@langchain/google-genai` | `gemini-*`                                     |
| Groq             | `@langchain/groq`         | `llama-*`, `mixtral-*`                         |
| OpenRouter       | `@langchain/openrouter`   | Any                                            |
| Mistral          | `@langchain/mistralai`    | `mistral-*`, `codestral-*`                     |
| DeepSeek         | `@langchain/deepseek`     | `deepseek-*`                                   |
| Ollama           | `@langchain/ollama`       | Any local                                      |
| Z.AI             | Custom                    | Custom base URL                                |
| Multimate (Free) | Backend proxy             | Free tier models                               |

## Tool Registry

Defined in `electron/tools/toolsregister.ts`. Tools are grouped:

| Group        | Tools                                             |
| ------------ | ------------------------------------------------- |
| Web Search   | web_search, web_scrape                            |
| Command Line | command_line                                      |
| Web Scraper  | web_scraper                                       |
| Browser      | browser_navigate, browser_click, browser_type     |
| Utility      | calculator, datetime, json, text, http            |
| Real World   | read_file, write_file, email, crypto, system_info |

**Write tools** (trigger approval): `write_file`, `email`, `command_line`

## Debugging Agent Workflows

See the [electron-agent-dev skill](../skills/electron-agent-dev/SKILL.md) for detailed debugging steps.

Common issues:

| Issue                                   | Likely Cause                                                    |
| --------------------------------------- | --------------------------------------------------------------- |
| Agent hangs on first message            | Tool approval mode is `ask_every_time` — send approval response |
| `node-stream` events stop mid-execution | Agent hit a write tool and is waiting for approval              |
| Provider not found                      | Missing in `provider.ts` switch statement                       |
| Tool not available                      | Not included in `nodeConfig.tools` array                        |

## Key Files to Reference

- `electron/Agent/workflow.ts` — orchestration engine
- `electron/Agent/node-deepagent.ts` — DeepAgent wrapper
- `electron/Agent/provider.ts` — LLM provider factory
- `electron/Ipc/agentworkflowIpc.ts` — IPC handler + tool approval
- `src/features/agent/store/store.ts` — agent workflow Zustand store
