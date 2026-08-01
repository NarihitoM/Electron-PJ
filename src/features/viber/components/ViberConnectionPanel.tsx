import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { viberauth } from "../api/api";
import { viberauthstore } from "../store/store";
import { useViberAccount } from "../hooks/useViberAccount";
import { useQueryClient } from "@tanstack/react-query";

export const ViberConnectionPanel = () => {
  const { isChecking, setIsChecking } = viberauthstore();
  const { data: viberAccount } = useViberAccount();
  const queryClient = useQueryClient();
  const name = (viberAccount as any)?.name ?? "";

  const connectViber = async () => {
    try {
      const response = await viberauth.viberconnectinfo();
      const botUri = response.botUri;
      if (!botUri) {
        toast.error("Viber bot link not configured.");
        return;
      }
      (window.ipcRenderer as any).openInBrowser(botUri);
      setIsChecking(true);
    } catch (err) {
      toast.error("Failed to initiate Viber connection.");
    }
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    let fallbackTimeout: string | number | NodeJS.Timeout | undefined;
    let pollingDelay = 1000;

    const checkStatus = async () => {
      try {
        const response = await viberauth.vibercheckstatus();
        if (response.success) {
          setIsChecking(false);
          await queryClient.invalidateQueries({ queryKey: ["viber"] });
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
        const response = await viberauth.vibercheckstatus();
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ["viber"] });
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
      <h1 className="text-3xl">Viber Agenting</h1>
      <p className="text-sm text-muted-foreground">Send Message To Get Started Viber Agenting.</p>
      {name ? (
        ""
      ) : (
        <Button disabled={isChecking} className="bg-[#7360F2] text-white" onClick={connectViber}>
          {isChecking ? <Spinner /> : "Connect Viber"}
        </Button>
      )}
    </div>
  );
};
