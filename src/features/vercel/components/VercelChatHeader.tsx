import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { BRAND_ASSETS, getProviderDisplayName } from "@/shared/config/providermodels";
import { useNavigate } from "react-router-dom";
import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { useVercelAccount } from "../hooks/useVercelAccount";
import { useVercelProjects } from "../hooks/useVercelProjects";
import { vercelauthstore } from "../store/store";
import type { vercelserviceprovider } from "../types/type";

export const VercelChatHeader = () => {
  const store = vercelauthstore();
  const { data: Api = [] } = useServiceKeys();
  const { data: vercelAccount } = useVercelAccount();
  const { data: vercelProjects = [] } = useVercelProjects();
  const navigate = useNavigate();

  const username = vercelAccount?.username ?? "";
  const loadingvercel = !vercelAccount;
  const selectedProject = vercelProjects.find((project) => project.id === store.projectId);

  const apiWithLogos = Api.map((provider: vercelserviceprovider) => ({
    ...provider,
    imageUrl: BRAND_ASSETS[provider.provider.toLowerCase()],
  }));

  return (
    <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <img
            src="https://cdn.worldvectorlogo.com/logos/vercel.svg"
            className="w-7 h-7 dark:invert"
          />
          VercelAgent
        </h1>
        <p className="text-muted-foreground">
          You can manage your Vercel projects and deployments with your agent.
        </p>
      </div>
      <div className="flex gap-2 items-center">
        {loadingvercel ? (
          <span className="flex items-center gap-2 px-1 py-1 rounded-full border border-transparent">
            <Skeleton className="w-4 h-4 rounded-sm bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <Skeleton className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </span>
        ) : username ? (
          <span className="text-[13px] flex items-center gap-2 px-2 py-1 rounded-full border bg-card">
            <img
              src="https://cdn.worldvectorlogo.com/logos/vercel.svg"
              className="w-4 h-4 dark:invert"
            />
            {username.substring(0, 10)}
          </span>
        ) : null}
        <div className="flex gap-2">
          {vercelProjects.length > 0 && (
            <Select
              onValueChange={(value) => store.setProjectId(value ?? "")}
              value={store.projectId}
            >
              <SelectTrigger>
                {store.projectId ? (
                  <>
                    <span className="truncate">{selectedProject?.name ?? "Select Project"}</span>
                  </>
                ) : (
                  "Select Project"
                )}
              </SelectTrigger>
              <SelectContent>
                {vercelProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <span>{project.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {apiWithLogos.length > 0 ? (
            <>
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
                  {apiWithLogos.map((item) => (
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
            </>
          ) : (
            <Button className="bg-cyan-500 dark:bg-white" onClick={() => navigate("/app/settings")}>
              Add Provider
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
