import { tool } from "@langchain/core/tools";
import { z } from "zod";

const GITHUB_API = "https://api.github.com";

async function githubRequest(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MultimateAgent/1.0",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

export const githubtool = tool(
  async ({ action, token, owner, repo, state, title, body, issue_number, per_page }) => {
    const authToken = token || process.env.VITE_GITHUB_TOKEN || "";
    if (!authToken) {
      return "Error: No GitHub token available. Pass a token or configure VITE_GITHUB_TOKEN.";
    }
    if (!owner || !repo) {
      return "Error: owner and repo are required.";
    }

    try {
      switch (action) {
        case "get_repo": {
          const { ok, status, data } = await githubRequest(authToken, `/repos/${owner}/${repo}`);
          if (!ok) return `GitHub error (${status}): ${JSON.stringify(data)}`;
          return JSON.stringify(
            {
              full_name: data.full_name,
              description: data.description,
              stars: data.stargazers_count,
              open_issues: data.open_issues_count,
              default_branch: data.default_branch,
              url: data.html_url,
            },
            null,
            2,
          );
        }

        case "list_issues": {
          const params = new URLSearchParams({
            state: state || "open",
            per_page: String(per_page || 20),
          });
          const { ok, status, data } = await githubRequest(
            authToken,
            `/repos/${owner}/${repo}/issues?${params}`,
          );
          if (!ok) return `GitHub error (${status}): ${JSON.stringify(data)}`;
          const issues = (data as any[])
            .filter((i) => !i.pull_request)
            .map((i) => ({ number: i.number, title: i.title, state: i.state, url: i.html_url }));
          return JSON.stringify(issues, null, 2);
        }

        case "create_issue": {
          if (!title) return "Error: title is required to create an issue.";
          const { ok, status, data } = await githubRequest(
            authToken,
            `/repos/${owner}/${repo}/issues`,
            { method: "POST", body: JSON.stringify({ title, body }) },
          );
          if (!ok) return `GitHub error (${status}): ${JSON.stringify(data)}`;
          return `Created issue #${data.number}: ${data.html_url}`;
        }

        case "comment_issue": {
          if (!issue_number) return "Error: issue_number is required to comment.";
          if (!body) return "Error: body is required to comment.";
          const { ok, status, data } = await githubRequest(
            authToken,
            `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
            { method: "POST", body: JSON.stringify({ body }) },
          );
          if (!ok) return `GitHub error (${status}): ${JSON.stringify(data)}`;
          return `Comment added to issue #${issue_number}: ${data.html_url}`;
        }

        case "list_pull_requests": {
          const params = new URLSearchParams({
            state: state || "open",
            per_page: String(per_page || 20),
          });
          const { ok, status, data } = await githubRequest(
            authToken,
            `/repos/${owner}/${repo}/pulls?${params}`,
          );
          if (!ok) return `GitHub error (${status}): ${JSON.stringify(data)}`;
          const prs = (data as any[]).map((p) => ({
            number: p.number,
            title: p.title,
            state: p.state,
            url: p.html_url,
          }));
          return JSON.stringify(prs, null, 2);
        }

        default:
          return `Unknown action: ${action}`;
      }
    } catch (err: any) {
      return `GitHub error: ${err.message}`;
    }
  },
  {
    name: "github_action",
    description:
      "Interact with GitHub repositories. Actions: get_repo (repo info), list_issues, create_issue, comment_issue, list_pull_requests. Requires a GitHub personal access token.",
    schema: z.object({
      action: z
        .enum(["get_repo", "list_issues", "create_issue", "comment_issue", "list_pull_requests"])
        .describe("Operation to perform"),
      token: z
        .string()
        .optional()
        .describe("GitHub personal access token (overrides VITE_GITHUB_TOKEN env var)"),
      owner: z.string().describe("Repository owner/organization name"),
      repo: z.string().describe("Repository name"),
      state: z
        .enum(["open", "closed", "all"])
        .optional()
        .describe("Filter by state for list_issues/list_pull_requests (default: open)"),
      title: z.string().optional().describe("Title for create_issue"),
      body: z.string().optional().describe("Body text for create_issue or comment_issue"),
      issue_number: z.number().optional().describe("Issue number for comment_issue"),
      per_page: z.number().optional().describe("Max results to return (default: 20)"),
    }),
  },
);
