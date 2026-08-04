import {
  LogOut,
  Sun,
  Moon,
  EllipsisVertical,
  Trash,
  User2,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ui/themeprovider";
import { useUser } from "../../../features/auth/hooks/useUser";
import { accountauth } from "../../../features/account/api/api";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { chatauthstore } from "../../../features/chat/store/store";
import { chatauth } from "../../../features/chat/api/api";
import { useChats } from "../../../features/chat/hooks/useChats";
import { useCreateChat } from "../../../features/chat/hooks/useCreateChat";
import { useDeleteChat } from "../../../features/chat/hooks/useDeleteChat";
import { authservicestore } from "../../../features/services/store/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  navItems,
  Agent,
  Localagent,
  MemoryNav,
  Settings,
  mainItems,
} from "../../routes/Navigationroute";
import { telegramauthstore } from "../../../features/telegram/store/store";
import { useagentstore } from "../../../features/agent/store/store";
import Multimate from "../../assets/Multimate.png";
import { Separator } from "../ui/separator";
import { notionauthstore } from "../../../features/notion/store/store";
import { githubauthstore } from "../../../features/github/store/store";
import { discordauthstore } from "../../../features/discord/store/store";
import { googleauthstore } from "../../../features/google/store/store";
import { useSlackAccount } from "../../../features/slack/hooks/useSlackAccount";
import { useGithubAccount } from "../../../features/github/hooks/useGithubAccount";
import { useDiscordAccount } from "../../../features/discord/hooks/useDiscordAccount";
import { useGoogleService } from "../../../features/google/hooks/useGoogleService";
import { useTelegramAccount } from "../../../features/telegram/hooks/useTelegramAccount";
import { useNotionAccount } from "../../../features/notion/hooks/useNotionAccount";
import { useN8nConfig } from "../../../features/n8n/hooks/useN8nConfig";
import { usagestore } from "../../../features/usage/store/store";
import { dashboardstore } from "../../../features/dashboard/store/store";

import { datafetch } from "../../config/tanstackqueryconfig";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { CreditBadge } from "../../../features/credits/components/CreditBadge";
import { useAddServiceKey } from "../../../features/services/hooks/useAddServiceKey";
import { clearModelCache } from "../../config/providermodels";

const IconRenderer = ({ icon: Icon, invertDark }: { icon: any; invertDark?: boolean }) => {
  if (typeof Icon === "string") {
    return (
      <img
        src={Icon}
        alt="icon"
        className={`w-4 h-4 object-contain transition-all ${invertDark ? "dark:invert" : ""}`}
      />
    );
  }

  return <Icon className="w-4 h-4 text-cyan-500 dark:text-white" />;
};

export const Sidebarprovider = () => {
  //Store
  const { data: userdata } = useUser();
  const { data: Chat = [], refetch: fetchchat, isLoading: loadingchat } = useChats();
  const createChatMutation = useCreateChat();
  const deleteChatMutation = useDeleteChat();
  const store = chatauthstore();
  const { resetchat, chatNextCursor, chatHasMore, chatLoadingMore, Chat: ChatFromStore } = store;
  const { resetservice } = authservicestore();

  const { data: googleService } = useGoogleService();
  const serviceemail = (googleService as any)?.serviceemail ?? "";
  const { resetgoogle } = googleauthstore();

  const { data: telegramAccount } = useTelegramAccount();
  const telegramUserdata = telegramAccount;
  const { resettelegram } = telegramauthstore();

  const { data: notionAccount } = useNotionAccount();
  const workspacename = (notionAccount as any)?.workspacename ?? "";
  const { resetnotion } = notionauthstore();
  const { resetgithub } = githubauthstore();
  const { resetdiscord } = discordauthstore();

  const { resetagent } = useagentstore();

  const { data: slackAccount } = useSlackAccount();
  const workspace = (slackAccount as any)?.workspace ?? "";

  const { data: githubAccount } = useGithubAccount();
  const githubusername = (githubAccount as any)?.username ?? "";

  const { data: discordAccount } = useDiscordAccount();
  const guildName = (discordAccount as any)?.guildName ?? "";

  const { resetUsage } = usagestore();

  const { resetDashboard } = dashboardstore();

  const { data: n8nConfig } = useN8nConfig();
  const n8nConnected = !!(n8nConfig as any)?.connected;

  const ollamaResyncMutation = useAddServiceKey();

  //Theme
  const { theme, setTheme } = useTheme();
  const toggletheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  //Navigation
  const navigate = useNavigate();
  const location = useLocation();

  //States
  const [navitems, setNavItems] = useState(navItems);

  const handleItemClick = (type: string, isLoading: boolean) => {
    setNavItems((prevItems) =>
      prevItems.map((item) => (item.type === type ? { ...item, loading: isLoading } : item)),
    );
  };

  //Functions
  const handleLogout = async () => {
    try {
      await accountauth.logout();

      //Clear all the states
      resetchat();
      resetservice();
      resetagent();
      resettelegram();
      resetnotion();
      resetgithub();
      resetdiscord();
      resetgoogle();
      resetUsage();
      resetDashboard();
      datafetch.clear();

      navigate("/", {
        state: { logoutSuccess: true },
        replace: true,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handlenewchat = async () => {
    handleItemClick("create", true);

    try {
      const response = await createChatMutation.mutateAsync();

      if (response.success) {
        toast.success(response.message);
        navigate(`/app/chat/${response.data?.id}`);
      }
    } catch (err: any) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      handleItemClick("create", false);
    }
  };

  const handledeletechat = async (chatid: string) => {
    setdeletingIds((prev) => new Set(prev).add(chatid));
    try {
      const response = await deleteChatMutation.mutateAsync(chatid);
      if (response.success) {
        toast.success(response.message);
        navigate("/app/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setdeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(chatid);
        return next;
      });
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        setchaterror(false);
        fetchchat();
      } catch {
        setchaterror(true);
      }
    };
    loadChats();

    // Services are fetched automatically by hooks
    setLoadingServices(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A local Ollama tunnel dies whenever the app restarts, so silently
  // re-open it and resync the new URL with the backend on every launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const persistedHost = await (window as any).api?.getOllamaLocalHost?.();
        if (!persistedHost || cancelled) return;
        const tunnelUrl = await (window as any).api.ensureOllamaTunnel(persistedHost);
        if (cancelled) return;
        await ollamaResyncMutation.mutateAsync({ provider: "ollama", key: "", host: tunnelUrl });
        clearModelCache("ollama");
      } catch (err) {
        console.error("Ollama tunnel resync failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const chathistory = useMemo(() => {
    return Chat.map((element) => ({
      id: element.id,
      title: element.title,
      url: `/app/chat/${element.id}`,
    }));
  }, [Chat]);

  const loadMoreChats = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!chatHasMore || chatLoadingMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        if (chatNextCursor) {
          store.setChatLoadingMore(true);
          try {
            const response = await chatauth.fetchchat(chatNextCursor);
            if (response.success && response.data) {
              const { messages, nextCursor, hasMore } = response.data;
              store.setChats([...ChatFromStore, ...messages], nextCursor, hasMore);
            }
          } catch (err: unknown) {
            if (err instanceof Error) {
              const errorObj = err as any;
              toast.error(errorObj.response?.data?.message || err.message);
            }
          } finally {
            store.setChatLoadingMore(false);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatHasMore, chatLoadingMore, chatNextCursor, ChatFromStore],
  );

  const [chaterror, setchaterror] = useState<boolean>(false);
  const [deletingIds, setdeletingIds] = useState<Set<string>>(new Set());
  const [agentSearch, setAgentSearch] = useState<string>("");
  const [loadingServices, setLoadingServices] = useState<boolean>(true);

  const connectedAgentItems = useMemo(() => {
    return Agent.filter((item) => {
      switch (item.title) {
        case "Slack":
          return !!workspace;
        case "Notion":
          return !!workspacename;
        case "GoogleSheet":
        case "GoogleDocs":
          return !!serviceemail;
        case "Telegram":
          return !!telegramUserdata;
        case "n8n":
          return n8nConnected;
        case "Github":
          return !!githubusername;
        case "Discord":
          return !!guildName;
        default:
          return false;
      }
    });
  }, [
    telegramUserdata,
    workspace,
    workspacename,
    serviceemail,
    n8nConnected,
    githubusername,
    guildName,
  ]);

  const filteredAgentItems = useMemo(() => {
    if (!agentSearch) return connectedAgentItems;
    return connectedAgentItems.filter((item) =>
      item.title.toLowerCase().includes(agentSearch.toLowerCase()),
    );
  }, [connectedAgentItems, agentSearch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="py-2 px-2 flex flex-row items-center">
            <img src={Multimate} className="w-12 h-10" />
            <h1 className="text-xl mt-1 font-semibold dark:text-white">MultimateAi</h1>
          </SidebarHeader>
          <Separator />
          <SidebarContent onScroll={loadMoreChats}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Main</SidebarGroupLabel>
                {mainItems.map((element) => (
                  <SidebarMenu key={element.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={
                          location.pathname.startsWith(`${element.url}`)
                            ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                            : ""
                        }
                        onClick={() => navigate(`${element.url}`)}
                      >
                        <IconRenderer
                          icon={element.icon}
                          invertDark={(element as any).invertDark}
                        />
                        {element.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Features</SidebarGroupLabel>
                {navitems.map((element) => (
                  <SidebarMenu key={element.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={
                          element.url && location.pathname.startsWith(element.url)
                            ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                            : ""
                        }
                        onClick={() => {
                          if (element.type === "create") {
                            handlenewchat();
                          } else if (element.url) {
                            navigate(element.url);
                          }
                        }}
                      >
                        {element.loading ? (
                          <>
                            <Spinner />
                            Creating New Chat
                          </>
                        ) : (
                          <>
                            <IconRenderer
                              icon={element.icon}
                              invertDark={(element as any).invertDark}
                            />
                            {element.title}
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Agent Features</SidebarGroupLabel>
                {loadingServices ? (
                  [1, 2, 3].map((_, index) => (
                    <SidebarMenu key={`skeleton-${index}`}>
                      <SidebarMenuItem>
                        <div className="flex items-center gap-2 w-full p-2 rounded-md animate-pulse">
                          <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                        </div>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  ))
                ) : connectedAgentItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4 px-4 text-center">
                    <p className="text-xs text-muted-foreground">No services connected</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/app/settings")}
                      className="text-cyan-500 dark:text-white"
                    >
                      Connect a Service
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="px-2 pb-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          placeholder="Search services..."
                          className="pl-7 h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                    {filteredAgentItems.length === 0 ? (
                      <div className="flex flex-col items-center gap-1 py-3 px-4 text-center">
                        <p className="text-xs text-muted-foreground">No matching services</p>
                      </div>
                    ) : (
                      filteredAgentItems.map((element) => (
                        <SidebarMenu key={element.title}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              className={
                                location.pathname.startsWith(`${element.url}`)
                                  ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                                  : ""
                              }
                              onClick={() => navigate(`${element.url}`)}
                            >
                              <IconRenderer
                                icon={element.icon}
                                invertDark={(element as any).invertDark}
                              />
                              {element.title}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      ))
                    )}
                  </>
                )}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Workflow Agent</SidebarGroupLabel>
                {Localagent.map((element) => (
                  <SidebarMenu key={element.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={
                          location.pathname.startsWith(`${element.url}`)
                            ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                            : ""
                        }
                        onClick={() => navigate(`${element.url}`)}
                      >
                        <element.icon className="text-cyan-500 dark:text-white" />
                        {element.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Memory</SidebarGroupLabel>
                {MemoryNav.map((element) => (
                  <SidebarMenu key={element.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={
                          location.pathname.startsWith(`${element.url}`)
                            ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                            : ""
                        }
                        onClick={() => navigate(`${element.url}`)}
                      >
                        <element.icon className="text-cyan-500 dark:text-white" />
                        {element.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                {Settings.map((element) => (
                  <SidebarMenu key={element.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={
                          location.pathname.startsWith(`${element.url}`)
                            ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                            : ""
                        }
                        onClick={() => navigate(`${element.url}`)}
                      >
                        <element.icon className="text-cyan-500 dark:text-white" />
                        {element.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Recents</SidebarGroupLabel>
                {loadingchat ? (
                  [1, 2, 3, 4].map((_, index) => (
                    <SidebarMenu key={`skeleton-${index}`}>
                      <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full p-2 rounded-md animate-pulse">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                        </div>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  ))
                ) : chaterror ? (
                  <div className="flex flex-col gap-2 items-center justify-center py-6 px-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <p className="text-sm text-muted-foreground">Failed to load chats</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setchaterror(false);
                        try {
                          fetchchat();
                        } catch {
                          setchaterror(true);
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  chathistory.map((element) => (
                    <SidebarMenu key={element.id}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          className={
                            location.pathname.startsWith(`${element.url}`)
                              ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20 justify-between flex"
                              : "justify-between flex"
                          }
                          onClick={() => navigate(`${element.url}`)}
                        >
                          {deletingIds.has(element.id) ? (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Spinner className="h-4 w-4" />
                              Deleting...
                            </span>
                          ) : (
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={element.title}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              >
                                {element.title}
                              </motion.span>
                            </AnimatePresence>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="dark:hover:bg-zinc-700 hover:bg-black/10 p-1 rounded-full"
                              >
                                <EllipsisVertical
                                  size={15}
                                  className="text-muted-foreground dark:text-white"
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="end" className="w-50">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handledeletechat(element.id);
                                }}
                              >
                                <Trash className="text-red-500" />
                                <span className="text-red-500">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  ))
                )}
                {chatLoadingMore &&
                  [1, 2].map((_, index) => (
                    <SidebarMenu key={`loadmore-skeleton-${index}`}>
                      <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full p-2 rounded-md animate-pulse">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                        </div>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <Separator />
          <SidebarFooter>
            <div className="px-2 pb-1">
              <CreditBadge />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      userdata?.profileurl
                        ? `${userdata.profileurl}?v=${userdata?.useremail}`
                        : undefined
                    }
                    alt={userdata?.username}
                  />
                  <AvatarFallback className="bg-cyan-500 dark:bg-white border text-white dark:text-black">
                    {userdata?.username.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-sm font-medium truncate">{userdata?.username}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {userdata?.useremail}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" className="w-50">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{userdata?.username}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuItem
                  className={
                    location.pathname.startsWith(`/app/account`)
                      ? "bg-linear-to-r from-card active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20"
                      : ""
                  }
                  onClick={() => navigate("/app/account")}
                >
                  <User2 className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggletheme}>
                  {theme === "light" ? (
                    <>
                      {" "}
                      <Sun className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" />
                      <span>Light</span>{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Moon className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" />
                      <span>Dark</span>{" "}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0 flex-1">
          <main className="w-full max-w-5xl mx-auto py-5 px-12 min-w-0">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};
