import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { slackauth } from "../api/api";
import { slackauthstore } from "../store/store";
import { useSlackAccount } from "../hooks/useSlackAccount";
import { useConnectSlack } from "../hooks/useConnectSlack";
import { useQueryClient } from "@tanstack/react-query";

export const SlackConnectionPanel = () => {
  const { isChecking, setIsChecking } = slackauthstore();
  const { data: slackAccount } = useSlackAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: connectSlackState } = useConnectSlack();
  const workspace = (slackAccount as any)?.workspace ?? "";

  const connectSlack = async () => {
    const response = await connectSlackState();
    const stateId = response.stateId;
    const clientid = import.meta.env.VITE_SLACK_CLIENT_ID;
    if (!clientid) {
      toast.error("Slack Client ID not configured.");
      return;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
    const redirecturi = encodeURIComponent(`${backendUrl}/slack/api/callback`);
    const scopes = [
      "channels:history",
      "groups:history",
      "im:history",
      "mpim:history",
      "users:read",
      "chat:write",
      "team:read",
      "channels:read",
      "groups:read",
      "mpim:read",
      "im:read",
    ].join(",");
    const url = `https://slack.com/oauth/v2/authorize?client_id=${clientid}&user_scope=${scopes}&redirect_uri=${redirecturi}&state=${stateId}&response_type=code`;
    (window.ipcRenderer as any).openInBrowser(url);
    setIsChecking(true);
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    let fallbackTimeout: string | number | NodeJS.Timeout | undefined;
    let pollingDelay = 1000;

    const checkStatus = async () => {
      try {
        const response = await slackauth.slackcheckstatus();
        if (response.success) {
          setIsChecking(false);
          await queryClient.invalidateQueries({ queryKey: ["slack"] });
          if (interval) clearInterval(interval);
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    const stopPolling = async () => {
      if (interval) clearInterval(interval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      try {
        const response = await slackauth.slackcheckstatus();
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ["slack"] });
        }
      } catch (err) {
        console.error("Final check error", err);
      }
      setIsChecking(false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkStatus();
        if (interval) clearInterval(interval);
        pollingDelay = 1000;
        interval = setInterval(checkStatus, pollingDelay);
      } else {
        pollingDelay = 5000;
        if (interval) clearInterval(interval);
        interval = setInterval(checkStatus, pollingDelay);
      }
    };

    if (isChecking) {
      document.addEventListener("visibilitychange", onVisibilityChange);
      fallbackTimeout = setTimeout(stopPolling, 180000);
      interval = setInterval(checkStatus, pollingDelay);
      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (interval) clearInterval(interval);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
      };
    }
    return () => {
      if (interval) clearInterval(interval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  return (
    <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
      <h1 className="text-3xl">Slack Agenting</h1>
      <p className="text-sm text-muted-foreground">Send Message To Get Started Slack Agenting.</p>
      {workspace ? (
        ""
      ) : (
        <Button disabled={isChecking} className="bg-cyan-500 dark:bg-white" onClick={connectSlack}>
          {isChecking ? <Spinner /> : "Connect Slack"}
        </Button>
      )}
    </div>
  );
};
