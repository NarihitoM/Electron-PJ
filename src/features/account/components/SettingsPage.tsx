import { useServiceKeys } from "@/features/services/hooks/useServiceKeys";
import { AlertTriangle, Key, Plug, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Toaster } from "@/shared/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ServiceApiKeyList } from "./ServiceApiKeyList";
import { ServiceIntegrationList } from "./ServiceIntegrationList";
import { ServiceDetailPanel } from "./ServiceDetailPanel";
import { LocalApiEndpoint } from "./LocalApiEndpoint";

export const SettingsPage = () => {
  const { isLoading, isError, refetch } = useServiceKeys();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col gap-1 mb-6">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64 animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-80 animate-pulse mt-1" />
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-20 animate-pulse"
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-40 animate-pulse" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-60 animate-pulse mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 animate-pulse" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24 animate-pulse" />
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-96 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-1 mt-8 mb-4">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-72 animate-pulse mt-1" />
        </div>

        <div className="h-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full animate-pulse mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24 animate-pulse" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-40 animate-pulse" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-40px)] w-full flex-col gap-2 items-center justify-center py-16">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load providers</h2>
        <p className="text-sm text-muted-foreground">
          There was a problem connecting to the server.
        </p>
        <Button onClick={() => refetch()} className="bg-cyan-500 dark:bg-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="providers" className="flex-1 gap-1.5">
            <Key className="w-4 h-4" /> Providers
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1 gap-1.5">
            <Plug className="w-4 h-4" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="localapi" className="flex-1 gap-1.5">
            <Zap className="w-4 h-4" /> Local API
          </TabsTrigger>
        </TabsList>
        <TabsContent value="providers">
          <ServiceApiKeyList />
        </TabsContent>
        <TabsContent value="integrations">
          <ServiceIntegrationList />
        </TabsContent>
        <TabsContent value="localapi">
          <LocalApiEndpoint />
        </TabsContent>
      </Tabs>
      <ServiceDetailPanel />
    </>
  );
};
