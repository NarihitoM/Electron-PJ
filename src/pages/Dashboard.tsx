import { Avatar, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { BRAND_ASSETS, PROVIDER } from "@/features/providermodels"
import { BRAND_SERVICE } from "@/features/serviceaccount"
import { useagentstore } from "@/store/agentauthstore"
import { chatauthstore } from "@/store/chatauthstore"
import { googleauthstore } from "@/store/googleauthstore"
import { notionauthstore } from "@/store/notionauthstore"
import { authservicestore } from "@/store/serviceauthstore"
import { useslackstore } from "@/store/slackauthstore"
import { telegramauthstore } from "@/store/telegramauthstore"
import { userauthstore } from "@/store/userauthstore"
import { Bot, Key, LayoutDashboard, MessageCircle, SettingsIcon, Sparkles } from "lucide-react"
import { useEffect } from "react"

const ServiceIcon = ({ provider }: { provider: string }) => {
    const Icon = BRAND_SERVICE[provider];

    if (!Icon) return null;

    if (typeof Icon === "string") {
        return <img src={Icon} alt={provider} className="rounded-full" />;
    }

    const IconComponent = Icon;
    return <IconComponent />;
};

export const Dashboard = () => {

    const {
        userdata
    } = userauthstore()

    const {
        Node,
        loadingfetch,
        fetchnode
    } = useagentstore()

    const {
        Chat,
        loadingchat,
        fetchchat
    } = chatauthstore()

    const {
        Api,
        fetchservicekey,
        loadingfetch: servicefetch
    } = authservicestore()

    const {
        workspacename,
        fetchnotionacc,
        loadingnotion
    } = notionauthstore()

    const {
        userdata: telegramuserdata,
        telegramfetchdata,
        loadingfetch: telegramfetch
    } = telegramauthstore()

    const {
        workspace,
        fetchslackacc,
        loadingslack,
    } = useslackstore()

    const {
        serviceemail,
        fetchgoogleservice,
        loadingfetch: googlefetch,
    } = googleauthstore()


    const allServices = [
        ...(workspace ? [{ provider: 'slack', name: workspace }] : []),
        ...(workspacename ? [{ provider: 'notion', name: workspacename }] : []),
        ...(serviceemail ? [{ provider: 'google', name: serviceemail }] : []),
        ...(telegramuserdata ? [{ provider: 'telegram', name: telegramuserdata.username }] : []),
    ];


    useEffect(() => {
        fetchnode();
        fetchchat();
        fetchservicekey();
        fetchgoogleservice();
        fetchnotionacc();
        fetchslackacc();
        telegramfetchdata();
    }, [])


    return (
        <div className="flex h-[92vh] w-full flex-col bg-background">
            <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold flex items-center gap-3"><LayoutDashboard className="w-7 h-7 text-cyan-500 dark:text-white" />Dashboard Overview</h1>
                    <p className="text-muted-foreground">Welcome Back {userdata?.username}!</p>
                </div>
            </div>
            <div className="mx-auto w-full max-w-5xl grid grid-cols-2 mt-4 gap-3">
                {(loadingfetch || loadingchat || servicefetch || (telegramfetch || loadingnotion || loadingslack || googlefetch)) ?
                    [1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-5 w-2/3 " />
                                    <Skeleton className="h-3 w-1/2 " />
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-16 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))
                    :
                    <>
                        <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium">Total Agent Nodes</CardTitle>
                                <CardDescription>The number of agent node you created.</CardDescription>
                                <CardAction><Bot className="w-6 h-6 text-cyan-500 dark:text-white" /></CardAction>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">{Node.length >= 0 ? Node.length : <h1 className="text-red-400">Fail to load</h1>}</h1>
                            </CardContent>
                        </Card>
                        <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium">Total Chat</CardTitle>
                                <CardDescription>The number of chats you created.</CardDescription>
                                <CardAction><MessageCircle className="w-6 h-6 text-cyan-500 dark:text-white" /></CardAction>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">{Chat.length >= 0 ? Chat.length : <h1 className="text-red-400">Fail to load</h1>}</h1>
                            </CardContent>
                        </Card>
                        <Card className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium">Active Ai Providers</CardTitle>
                                <CardDescription>The number of Ai providers you connect.</CardDescription>
                                <CardAction><Key className="w-6 h-6 text-cyan-500 dark:text-white" /></CardAction>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
                                    {Api.length >= 0 ? Api.length : <h1 className="text-red-400">Fail to load</h1>}
                                </h1>
                                <div className="flex">
                                    <AvatarGroup>
                                        {Api.slice(0, 3).map((element) => (
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={BRAND_ASSETS[element.provider]} className="bg-white" />
                                            </Avatar>
                                        )) ?? []}
                                        {Api.length > 3 && (
                                            <AvatarGroupCount className="w-6 h-6 text-black dark:text-white border">
                                                +{Api.length - 3}
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
                                <CardAction><SettingsIcon className="w-6 h-6 text-cyan-500 dark:text-white" /></CardAction>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-zinc-700 dark:text-white">
                                    {allServices.length >= 0 ? allServices.length : <h1 className="text-red-400">Fail to load</h1>}
                                </h1>
                                <div className="flex">
                                    <AvatarGroup>
                                        {allServices.slice(0, 3).map((element) => (
                                            <Avatar className="w-6 h-6">
                                                <ServiceIcon provider={element.provider} />
                                            </Avatar>
                                        )) ?? []}
                                        {allServices.length > 3 && (
                                            <AvatarGroupCount className="w-6 h-6 text-black dark:text-white border">
                                                +{allServices.length - 3}
                                            </AvatarGroupCount>
                                        )}
                                    </AvatarGroup>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                }
            </div>
            <Separator className="mt-5" />
            <div className="mx-auto w-full max-w-5xl mt-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold flex items-center gap-3"><Sparkles className="w-7 h-7 text-cyan-500 dark:text-white" />Ai Providers Support</h1>
                </div>
                <div className="mx-auto w-full max-w-5xl mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(loadingfetch || loadingchat || servicefetch || (telegramfetch || loadingnotion || loadingslack || googlefetch)) ?
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="overflow-hidden">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                                            <div className="flex flex-col gap-2 w-full">
                                                <Skeleton className="h-4 w-28 rounded-md" />
                                                <Skeleton className="h-3 w-20 rounded-md" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-3 w-full rounded-md mb-2" />
                                        <Skeleton className="h-3 w-[85%] rounded-md" />
                                    </CardContent>
                                </Card>
                            ))
                            :
                            PROVIDER.map((provider) => (
                                <Card
                                    key={provider.name}
                                    className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer"
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={provider.image}
                                                alt={provider.name}
                                                className="w-10 h-10 rounded-lg bg-white p-1 object-contain"
                                            />

                                            <div>
                                                <CardTitle className="text-base">
                                                    {provider.name}
                                                </CardTitle>

                                                <CardDescription>
                                                    {provider.model}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {provider.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                </div>
                <Separator className="mt-5" />
            </div>
        </div>
    )
}