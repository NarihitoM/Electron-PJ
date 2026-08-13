import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { BRAND_ASSETS, getProviderDisplayName } from "@/shared/config/providermodels";
import { Globe, Unlink, Wifi, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { n8nauthstore } from "../store/store";

export const N8nChatHeader = () => {
  const { data: Api = [] } = useServiceKeys();
  const { data: n8nConfig } = useN8nConfig();
  const store = n8nauthstore();
  const navigate = useNavigate();

  const connected = !!n8nConfig?.connected;
  const authType = n8nConfig?.authType ?? "";
  const loadingn8n = !n8nConfig;

  const apiWithLogos = Api.map((provider: any) => ({
    ...provider,
    imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()],
  }));

  return (
    <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <img src="https://n8n.io/favicon.ico" className="w-7 h-7" />
          n8nAgent
        </h1>
        <p className="text-muted-foreground">You can manage your n8n workflows with your agent.</p>
      </div>
      <div className="flex gap-2 items-center">
        {loadingn8n ? (
          <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
            <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </span>
        ) : connected ? (
          <span className="text-[13px] flex items-center gap-2 px-2 py-1 rounded-full border bg-card">
            {authType === "none" ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            {authType === "none" ? "Webhook" : "Connected"}
          </span>
        ) : (
          <Button variant="outline" size="sm" onClick={() => store.setSettingsOpen(true)}>
            <Unlink className="mr-2 h-3 w-3" />
            Not Connected
          </Button>
        )}
        {apiWithLogos.length > 0 ? (
          <div className="flex gap-2">
            <Select
              onValueChange={(value) => store.setProvider(value ?? "")}
              value={store.provider}
            >
              <SelectTrigger>
                {store.provider ? (
                  <>
                    <img
                      src={BRAND_ASSETS[store.provider.toLowerCase()]}
                      className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                    />
                    <span>{getProviderDisplayName(store.provider)}</span>
                  </>
                ) : (
                  "Select Provider"
                )}
              </SelectTrigger>
              <SelectContent>
                {apiWithLogos.map((item: any) => (
                  <SelectItem key={item.provider} value={item.provider}>
                    <img
                      src={item.imageUrl}
                      className="bg-white rounded-lg p-0.5 w-5 h-5 object-contain shrink-0"
                    />
                    <span>{getProviderDisplayName(item.provider)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/app/settings")}
              title="Add Provider"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>
            Add Provider
          </Button>
        )}
      </div>
    </div>
  );
};
