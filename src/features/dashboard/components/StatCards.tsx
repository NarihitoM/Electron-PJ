import { Avatar, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { BRAND_ASSETS } from "@/shared/config/providermodels";
import { BRAND_SERVICE } from "@/shared/config/service";
import { Bot, Key, MessageCircle, SettingsIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useDashboardStats } from "../hooks/useDashboardStats";

const ServiceIcon = ({ provider }: { provider: string }) => {
  const Icon = BRAND_SERVICE[provider];
  if (!Icon) return null;
  if (typeof Icon === "string") {
    return <img src={Icon} alt={provider} className="rounded-full" />;
  }
  const IconComponent = Icon;
  return <IconComponent />;
};

export const StatCards = () => {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <div className="col-span-2 flex flex-col gap-3 justify-center items-center py-16">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <h1 className="text-2xl font-semibold">Failed To Load Dashboard</h1>
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
      <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Total Agent Nodes</CardTitle>
          <CardDescription>The number of agent node you created.</CardDescription>
          <CardAction>
            <Bot className="w-6 h-6 text-cyan-500 dark:text-white" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
            {stats?.totalAgentNodes ?? 0}
          </h1>
        </CardContent>
      </Card>
      <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Total Chat</CardTitle>
          <CardDescription>The number of chats you created.</CardDescription>
          <CardAction>
            <MessageCircle className="w-6 h-6 text-cyan-500 dark:text-white" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
            {stats?.totalChats ?? 0}
          </h1>
        </CardContent>
      </Card>
      <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Active Ai Providers</CardTitle>
          <CardDescription>The number of Ai providers you connect.</CardDescription>
          <CardAction>
            <Key className="w-6 h-6 text-cyan-500 dark:text-white" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
            {stats?.activeProviders?.length ?? 0}
          </h1>
          <div className="flex">
            <AvatarGroup>
              {(stats?.activeProviders ?? []).slice(0, 3).map((provider) => (
                <Avatar className="w-6 h-6" key={provider}>
                  <AvatarImage src={BRAND_ASSETS[provider]} className="bg-white" />
                </Avatar>
              ))}
              {(stats?.activeProviders ?? []).length > 3 && (
                <AvatarGroupCount className="w-6 h-6 text-foreground border">
                  +{(stats?.activeProviders ?? []).length - 3}
                </AvatarGroupCount>
              )}
            </AvatarGroup>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Total Services Connected</CardTitle>
          <CardDescription>The number of service accounts you connect.</CardDescription>
          <CardAction>
            <SettingsIcon className="w-6 h-6 text-cyan-500 dark:text-white" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
            {stats?.connectedServices?.length ?? 0}
          </h1>
          <div className="flex">
            <AvatarGroup>
              {(stats?.connectedServices ?? []).slice(0, 3).map((service) => (
                <Avatar className="w-6 h-6" key={service}>
                  <ServiceIcon provider={service} />
                </Avatar>
              ))}
              {(stats?.connectedServices ?? []).length > 3 && (
                <AvatarGroupCount className="w-6 h-6 text-foreground border">
                  +{(stats?.connectedServices ?? []).length - 3}
                </AvatarGroupCount>
              )}
            </AvatarGroup>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
