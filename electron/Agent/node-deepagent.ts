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

export const createNodeDeepAgent = async (
    nodeConfig: nodes,
    keyMap: Record<string, string>,
    useremail: string,
    checkpointer: MemorySaver,
    hostMap?: Record<string, string>,
) => {
    const llm = await createModel(
        { provider: nodeConfig.provider, model: nodeConfig.model },
        keyMap,
        useremail,
        hostMap,
    );

    const BUILTIN_TOOL_NAMES = new Set([
        "ls", "read_file", "write_file", "edit_file", "glob", "grep", "execute",
        "start_async_task", "check_async_task", "update_async_task", "cancel_async_task", "list_async_tasks",
        "task", "write_todos",
    ]);

    const registryKey = getRegistryKey(nodeConfig.tool);
    const allTools = registryKey ? [...(toolRegistry[registryKey] || [])] : [];
    const tools = allTools.filter((t: any) => !BUILTIN_TOOL_NAMES.has(t.name));

    const masterTask = fs.readFileSync(
        path.join(__dirname, "..", "skills", "agentskill.md"),
        "utf-8",
    );

    const toolLabelsString = tools.map((t: any) => t.name).join(", ") || "No tools assigned";

    const systemPrompt = masterTask
        .replace("{nodeConfig.actor}", nodeConfig.actor)
        .replace("{nodeConfig.tool}", toolLabelsString)
        .replace("{nodeConfig.systemPrompt}", nodeConfig.systemPrompt || "");

    const interruptOn: Record<string, { allowedDecisions: ("edit" | "approve" | "reject")[] }> = {};
    for (const tool of tools) {
        if (WRITE_TOOLS.has(tool.name)) {
            interruptOn[tool.name] = { allowedDecisions: ["approve", "reject"] };
        }
    }

    return createDeepAgent({
        model: llm,
        tools,
        systemPrompt,
        interruptOn: Object.keys(interruptOn).length > 0 ? interruptOn : undefined,
        checkpointer,
        name: nodeConfig.name,
    });
};
