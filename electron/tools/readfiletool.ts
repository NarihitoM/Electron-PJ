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

export const readfiletool = tool(
  async ({ filepath, encoding }) => {
    try {
      const resolved = path.resolve(filepath);
      if (!isPathSafe(resolved)) {
        return `Error: Access denied. File must be within the project directory.`;
      }
      const enc = encoding === "binary" ? null : encoding || "utf-8";
      const content = await fs.readFile(resolved, enc ?? undefined);
      if (content instanceof Buffer) {
        return `Binary file (${content.length} bytes) - cannot display as text.`;
      }
      const lines = (content as string).split("\n");
      const totalLines = lines.length;
      const truncated =
        totalLines > 500
          ? lines.slice(0, 500).join("\n") + `\n\n... (${totalLines - 500} more lines omitted)`
          : (content as string);
      return truncated;
    } catch (err: any) {
      return `Read file error: ${err.message}`;
    }
  },
  {
    name: "read_file",
    description:
      "Read the contents of a text file from the project directory. Supports utf-8, latin1, base64, hex, and binary encodings. Truncates output to 500 lines.",
    schema: z.object({
      filepath: z
        .string()
        .describe("Relative or absolute path to the file within the project directory"),
      encoding: z
        .enum(["utf-8", "latin1", "base64", "hex", "binary"])
        .optional()
        .describe("File encoding (default: utf-8)"),
    }),
  },
);
