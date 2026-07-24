import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { githubauth } from "../api/api";
import { githubauthstore } from "../store/store";
import { useGithubAccount } from "../hooks/useGithubAccount";
import { useQueryClient } from "@tanstack/react-query";

export const GithubConnectionPanel = () => {
  const store = githubauthstore();
  const { data: githubAccount, isLoading } = useGithubAccount();
  const queryClient = useQueryClient();
  const username = (githubAccount as any)?.username ?? "";

  const connectGithub = async () => {
    const response = await githubauth.githubstate();
    const stateId = response.stateId;
    const clientid = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientid) {
      toast.error("GitHub Client ID not configured.");
      return;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
    const redirecturi = encodeURIComponent(`${backendUrl}/github/api/callback`);
    const url = `https://github.com/login/oauth/authorize?client_id=${clientid}&scope=repo&redirect_uri=${redirecturi}&state=${stateId}`;
    (window.ipcRenderer as any).openInBrowser(url);
    store.setIsChecking(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;

    if (store.isChecking) {
      fallbackTimeout = setTimeout(() => {
        store.setIsChecking(false);
        if (interval) clearInterval(interval);
      }, 180000);

      interval = setInterval(async () => {
        try {
          const response = await githubauth.githubcheckstatus();
          if (response.success) {
            store.setIsChecking(false);
            await queryClient.invalidateQueries({ queryKey: ["github"] });
            if (interval) clearInterval(interval);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(fallbackTimeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isChecking]);

  if (isLoading) {
    return (
      <div className="min-h-[92vh] flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (username) return null;

  return (
    <div className="min-h-[92vh] flex flex-col gap-2 justify-center items-center">
      <h1 className="text-3xl">Github Agenting</h1>
      <p className="text-sm text-muted-foreground">Send Message To Get Started Github Agenting.</p>
      <Button
        disabled={store.isChecking}
        className="bg-cyan-500 dark:bg-white"
        onClick={connectGithub}
      >
        {store.isChecking ? <Spinner /> : "Connect Github"}
      </Button>
    </div>
  );
};
