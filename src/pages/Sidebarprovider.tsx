import {
    LogOut,
    Sun,
    Moon,
    EllipsisVertical,
    Trash,
    User2,
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
    SidebarHeader
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ui/themeprovider";
import { userauthstore } from "@/store/userauthstore";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { chatauthstore } from "@/store/chatauthstore";
import { authservicestore } from "@/store/serviceauthstore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"
import { navItems, Agent, Localagent, Settings } from "@/routes/Navigationroute";
import { telegramauthstore } from "@/store/telegramauthstore";
import { useagentstore } from "@/store/agentauthstore";
import { webscrapstore } from "@/store/webscrapstore";
import Multimate from "../assets/Multimate.png";
import { Separator } from "@/components/ui/separator";
import { notionauthstore } from "@/store/notionauthstore";
import { googleauthstore } from "@/store/googleauthstore";
import { useslackstore } from "@/store/slackauthstore";

const IconRenderer = ({ icon: Icon }: { icon: any }) => {
    if (typeof Icon === 'string') {
        return (
            <img
                src={Icon}
                alt="icon"
                className="w-4 h-4 object-contain transition-all"
            />
        );
    }

    return <Icon className="w-4 h-4 text-cyan-500 dark:text-white" />;
};

export const Sidebarprovider = () => {

    //Store
    const {
        userdata,
        userlogout,
        resetuser,
    } = userauthstore();
    const {
        Chat,
        createchat,
        fetchchat,
        resetchat,
        deletechat,
    } = chatauthstore();
    const {
        resetservice
    } = authservicestore()

    const {
        resetgoogle
    } = googleauthstore()

    const {
        resettelegram
    } = telegramauthstore();

    const {
        resetnotion
    } = notionauthstore();

    const {
        resetagent
    } = useagentstore();

    const {
        resetweb
    } = webscrapstore()

    const {
        resetslack
    } = useslackstore();



    //Theme
    const { theme, setTheme } = useTheme();
    const toggletheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    //Navigation
    const navigate = useNavigate();
    const location = useLocation();

    //States
    const [hasfetch, sethasfetch] = useState<boolean>(false);


    //Functions
    const handleLogout = async () => {
        try {
            await userlogout();

            //Clear all the states
            resetchat()
            resetservice()
            resetuser()
            resetweb()
            resetagent()
            resettelegram()
            resetnotion()
            resetgoogle()
            resetslack()


            navigate("/", {
                replace: true
            })
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    };

    const handlenewchat = async () => {
        try {
            const response = await createchat();
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
                toast.error("An unexpected error occurred.")
            }
        } finally {
            sethasfetch(prev => !prev);
        }
    };

    const handledeletechat = async (
        chatid: string
    ) => {
        try {
            const response = await deletechat(chatid);
            if (response.success) {
                toast.success(response.message);
                navigate("/app/dashboard")
            }
        }
        catch (err) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
        finally {
            sethasfetch(prev => !prev);
        }
    }

    useEffect(() => {
        fetchchat();
    }, [hasfetch])

    //Data
    const chathistory = Chat.map((element) => (
        {
            id: element.id,
            title: element.title,
            url: `/app/chat/${element.id}`
        }
    ))

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
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarGroupLabel>Features</SidebarGroupLabel>
                                {navItems.map((element) => (
                                    <SidebarMenu key={element.title}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                className={element.url && location.pathname.startsWith(element.url) ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20" : ""}
                                                onClick={() => {
                                                    if (element.type === "create") {
                                                        handlenewchat();
                                                    }
                                                    else if (element.url) {
                                                        navigate(element.url);
                                                    }
                                                }}
                                            >
                                                <IconRenderer icon={element.icon} />
                                                {element.title}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                ))}
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarGroupLabel>Agent Features</SidebarGroupLabel>
                                {Agent.map((element) => (
                                    <SidebarMenu key={element.title}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton className={location.pathname.startsWith(`${element.url}`) ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20" : ""} onClick={() => navigate(`${element.url}`)}><IconRenderer icon={element.icon} />{element.title}</SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                ))}
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarGroupLabel>Workflow Agent</SidebarGroupLabel>
                                {Localagent.map((element) => (
                                    <SidebarMenu key={element.title}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton className={location.pathname.startsWith(`${element.url}`) ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20" : ""} onClick={() => navigate(`${element.url}`)}><element.icon className="text-cyan-500 dark:text-white" />{element.title}</SidebarMenuButton>
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
                                            <SidebarMenuButton className={location.pathname.startsWith(`${element.url}`) ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20" : ""} onClick={() => navigate(`${element.url}`)}><element.icon className="text-cyan-500 dark:text-white" />{element.title}</SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                ))}
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarGroupLabel>Recents</SidebarGroupLabel>
                                {chathistory.map((element) => (
                                    <SidebarMenu key={element.id}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton className={location.pathname.startsWith(`${element.url}`) ? "bg-linear-to-r from-card hover:text-cyan-500 active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20 justify-between flex" : "justify-between flex"} onClick={() => navigate(`${element.url}`)}><AnimatePresence mode="wait">
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <button onClick={(e) => e.stopPropagation()} className="dark:hover:bg-zinc-700 hover:bg-black/10 p-1 rounded-full">
                                                            <EllipsisVertical size={15} className="text-muted-foreground dark:text-white" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent side="right" align="end" className="w-50">
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handledeletechat(element.id)
                                                        }}>
                                                            <Trash className="text-red-500" />
                                                            <span className="text-red-500">
                                                                Delete
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                ))}
                            </SidebarGroupContent>
                        </SidebarGroup>

                    </SidebarContent>
                    <Separator />
                    <SidebarFooter>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition">
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
                            </DropdownMenuTrigger >
                            <DropdownMenuContent side="top" align="center" className="w-50">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{userdata?.username}</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuItem className={location.pathname.startsWith(`/app/account`) ? "bg-linear-to-r from-card active:text-cyan-500 from-30% to-cyan-300 text-cyan-500 dark:text-white/70 dark:to-white/20" : ""} onClick={() => navigate("/app/account")}>
                                    <User2 className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toggletheme}>
                                    {theme === "light" ? (<> <Sun className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" /><span>Light</span> </>) : (<> <Moon className="mr-2 h-4 w-4 text-cyan-500 dark:text-white" /><span>Dark</span> </>)}
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
                    <main className="w-full max-w-5xl mx-auto p-5 min-w-0">
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}