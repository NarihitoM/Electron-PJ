import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { app } from "electron";

function getAppRoots(): string[] {
    const roots: string[] = [];
    try {
        roots.push(path.resolve(app.getPath("home")));
    } catch {}
    try {
        roots.push(path.resolve(app.getPath("userData")));
    } catch {}
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
        roots.push(path.resolve(process.env.PORTABLE_EXECUTABLE_DIR));
    }
    return roots;
}

function isPathSafe(target: string): boolean {
    const resolved = path.resolve(target);
    const roots = getAppRoots();
    for (const root of roots) {
        const relative = path.relative(root, resolved);
        if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
            return true;
        }
    }
    return false;
}

export const writefiletool = tool(
    async ({ filepath, content, append }) => {
        try {
            const resolved = path.resolve(filepath);
            if (!isPathSafe(resolved)) {
                return `Error: Access denied. File must be within the project directory.`;
            }
            await fs.mkdir(path.dirname(resolved), { recursive: true });
            if (append) {
                await fs.appendFile(resolved, content, "utf-8");
                return `Appended to file: ${path.basename(resolved)}`;
            }
            await fs.writeFile(resolved, content, "utf-8");
            return `File written: ${path.basename(resolved)} (${content.length} bytes)`;
        } catch (err: any) {
            return `Write file error: ${err.message}`;
        }
    },
    {
        name: "write_file",
        description: "Write or append text content to a file within the project directory. Creates parent directories if needed. Can overwrite or append.",
        schema: z.object({
            filepath: z.string().describe("Relative or absolute path to the file within the project directory"),
            content: z.string().describe("Text content to write to the file"),
            append: z.boolean().optional().describe("If true, append to existing file instead of overwriting (default: false)")
        })
    }
);
