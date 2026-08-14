import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { vercelauth } from "../api/api";
import { vercelauthstore } from "../store/store";
import { useVercelAccount } from "../hooks/useVercelAccount";
import { useConnectVercel } from "../hooks/useConnectVercel";
import { useQueryClient } from "@tanstack/react-query";

export const VercelConnectionPanel = () => {
  const store = vercelauthstore();
  const { data: vercelAccount, isLoading } = useVercelAccount();
  const queryClient = useQueryClient();
  const { mutateAsync: connectVercelState } = useConnectVercel();
  const connected = !!vercelAccount?.connected;

  const connectVercel = async () => {
    const response = await connectVercelState();
    const stateId = response.stateId;
    const slug = import.meta.env.VITE_VERCEL_INTEGRATION_SLUG;
    if (!slug) {
      toast.error("Vercel Integration slug not configured.");
      return;
    }
    const url = `https://vercel.com/integrations/${slug}/new?state=${stateId}`;
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
          const response = await vercelauth.getConfig();
          if (response.data?.connected) {
            store.setIsChecking(false);
            await queryClient.invalidateQueries({ queryKey: ["vercel"] });
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

  if (connected) return null;

  return (
    <div className="min-h-[92vh] flex flex-col gap-2 justify-center items-center">
      <h1 className="text-3xl">Vercel Agenting</h1>
      <p className="text-sm text-muted-foreground">Send Message To Get Started Vercel Agenting.</p>
      <Button
        disabled={store.isChecking}
        className="bg-cyan-500 dark:bg-white"
        onClick={connectVercel}
      >
        {store.isChecking ? <Spinner /> : "Connect Vercel"}
      </Button>
    </div>
  );
};
