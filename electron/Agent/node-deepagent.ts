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
  const systemPrompt = buildNodeSystemPrompt(nodeConfig, tools, memoryContext);

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
