import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { discordauth } from "../api/api";
import { discordauthstore } from "../store/store";
import { useDiscordAccount } from "../hooks/useDiscordAccount";
import { useQueryClient } from "@tanstack/react-query";

export const DiscordConnectionPanel = () => {
  const { isChecking, setIsChecking } = discordauthstore();
  const { data: discordAccount } = useDiscordAccount();
  const queryClient = useQueryClient();
  const guildName = (discordAccount as any)?.guildName ?? "";

  const connectDiscord = async () => {
    const response = await discordauth.discordstate();
    const stateId = response.stateId;
    const clientid = import.meta.env.VITE_DISCORD_CLIENT_ID;
    if (!clientid) {
      toast.error("Discord Client ID not configured.");
      return;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
    const redirecturi = encodeURIComponent(`${backendUrl}/discord/api/callback`);
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientid}&scope=bot&permissions=68608&redirect_uri=${redirecturi}&response_type=code&state=${stateId}`;
    (window.ipcRenderer as any).openInBrowser(url);
    setIsChecking(true);
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    let fallbackTimeout: string | number | NodeJS.Timeout | undefined;
    let pollingDelay = 1000;

    const checkStatus = async () => {
      try {
        const response = await discordauth.discordcheckstatus();
        if (response.success) {
          setIsChecking(false);
          await queryClient.invalidateQueries({ queryKey: ["discord"] });
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
        const response = await discordauth.discordcheckstatus();
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ["discord"] });
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
      <h1 className="text-3xl">Discord Agenting</h1>
      <p className="text-sm text-muted-foreground">Send Message To Get Started Discord Agenting.</p>
      {guildName ? (
        ""
      ) : (
        <Button disabled={isChecking} className="bg-[#5865F2] text-white" onClick={connectDiscord}>
          {isChecking ? <Spinner /> : "Connect Discord"}
        </Button>
      )}
    </div>
  );
};
