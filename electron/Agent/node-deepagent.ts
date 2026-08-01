import { createDeepAgent } from "deepagents";
import { type MemorySaver } from "@langchain/langgraph";
import { createModel } from "./provider";
import { toolRegistry, getRegistryKey } from "../tools/toolsregister";
import { WRITE_TOOLS } from "../../src/shared/config/toolsselection";
import { nodes } from "../../src/shared/types/globaltype";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILTIN_TOOL_NAMES = new Set([
  "ls",
  "read_file",
  "write_file",
  "edit_file",
  "glob",
  "grep",
  "execute",
  "start_async_task",
  "check_async_task",
  "update_async_task",
  "cancel_async_task",
  "list_async_tasks",
  "task",
  "write_todos",
]);

export const resolveNodeTools = (nodeConfig: nodes) => {
  const registryKey = getRegistryKey(nodeConfig.tool);
  const allTools = registryKey ? [...(toolRegistry[registryKey] || [])] : [];
  return allTools.filter((t: any) => !BUILTIN_TOOL_NAMES.has(t.name));
};

const buildNodeSystemPrompt = (nodeConfig: nodes, tools: any[], memoryContext?: string) => {
  const masterTask = fs.readFileSync(
    path.join(__dirname, "..", "skills", "agentskill.md"),
    "utf-8",
  );

  const toolLabelsString = tools.map((t: any) => t.name).join(", ") || "No tools assigned";

  const memoryBlock = memoryContext
    ? `\n\n# What you remember about this user\n${memoryContext}`
    : "";

  return (
    masterTask
      .replace("{nodeConfig.actor}", nodeConfig.actor)
      .replace("{nodeConfig.tool}", toolLabelsString)
      .replace("{nodeConfig.systemPrompt}", nodeConfig.systemPrompt || "") + memoryBlock
  );
};

// Orchestrator nodes have no tools of their own — the shared prompt's "you
// have shell execution capability, take direct action" instructions would
// otherwise mislead the model into fabricating the work instead of calling
// the task tool to delegate to a sub-agent.
const buildOrchestratorSystemPrompt = (
  nodeConfig: nodes,
  subagents: ReturnType<typeof buildSubAgentSpec>[],
  memoryContext?: string,
) => {
  const roster = subagents.map((s) => `- "${s.name}": ${s.description}`).join("\n");
  const memoryBlock = memoryContext
    ? `\n\n# What you remember about this user\n${memoryContext}`
    : "";

  return (
    `You are ${nodeConfig.actor}.\n\n` +
    (nodeConfig.systemPrompt ? `${nodeConfig.systemPrompt}\n\n` : "") +
    `You have NO tools of your own. You cannot browse, run commands, read files, or take any direct action yourself. Your only job is to delegate to the sub-agents below using the "task" tool, with subagent_type set to the exact name of the sub-agent to use. Never claim you performed an action yourself — always call "task" first, then report back what the sub-agent returned.\n\n` +
    `Available sub-agents:\n${roster}` +
    memoryBlock
  );
};

const buildInterruptOn = (tools: any[]) => {
  const interruptOn: Record<string, { allowedDecisions: ("edit" | "approve" | "reject")[] }> = {};
  for (const tool of tools) {
    if (WRITE_TOOLS.has(tool.name)) {
      interruptOn[tool.name] = { allowedDecisions: ["approve", "reject"] };
    }
  }
  return Object.keys(interruptOn).length > 0 ? interruptOn : undefined;
};

// A sub-agent spec for deepagents' built-in `task` delegation tool — used
// so an "Orchestrator" node can call other nodes as specialists instead of
// them running as separate steps in the workflow.
export const buildSubAgentSpec = (nodeConfig: nodes, memoryContext?: string) => {
  const tools = resolveNodeTools(nodeConfig);
  return {
    name: nodeConfig.name,
    description: `Specialist agent for: ${nodeConfig.actor}`,
    systemPrompt: buildNodeSystemPrompt(nodeConfig, tools, memoryContext),
    tools,
    interruptOn: buildInterruptOn(tools),
  };
};

export const createNodeDeepAgent = async (
  nodeConfig: nodes,
  keyMap: Record<string, string>,
  useremail: string,
  checkpointer: MemorySaver,
  hostMap?: Record<string, string>,
  memoryContext?: string,
  subagents?: ReturnType<typeof buildSubAgentSpec>[],
) => {
  const llm = await createModel(
    { provider: nodeConfig.provider, model: nodeConfig.model },
    keyMap,
    useremail,
    hostMap,
  );

  // Running as an orchestrator (has sub-agents) means pure delegation — its
  // own directly-assigned tool must not be attached, or it'll just do the
  // work itself instead of delegating to the matching sub-agent.
  const isOrchestrating = !!subagents && subagents.length > 0;
  const tools = isOrchestrating ? [] : resolveNodeTools(nodeConfig);
  const systemPrompt = isOrchestrating
    ? buildOrchestratorSystemPrompt(nodeConfig, subagents, memoryContext)
    : buildNodeSystemPrompt(nodeConfig, tools, memoryContext);

  return createDeepAgent({
    model: llm,
    tools,
    systemPrompt,
    interruptOn: buildInterruptOn(tools),
    checkpointer,
    name: nodeConfig.name,
    subagents: subagents && subagents.length > 0 ? subagents : undefined,
  });
};
