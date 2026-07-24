import { GithubChat, GithubConnectionPanel } from "@/features/github";
import { useGithubAccount } from "@/features/github/hooks/useGithubAccount";

export const Github = () => {
  const { data: githubAccount, isLoading } = useGithubAccount();

  if (isLoading) return null;

  if (!githubAccount?.username) return <GithubConnectionPanel />;

  return <GithubChat />;
};
