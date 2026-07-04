import { Separator } from "@/shared/components/ui/separator"
import { useUser } from "@/features/auth/hooks/useUser"
import { StatCards } from "./StatCards"
import { ProviderGrid } from "./ProviderGrid"
import { ServiceGrid } from "./ServiceGrid"
import { useQueryClient } from "@tanstack/react-query"
import { LayoutDashboard, Sparkles } from "lucide-react"
import { useEffect } from "react"

export const DashboardView = () => {
    const { data: userdata } = useUser()
    const queryClient = useQueryClient()

    useEffect(() => {
        const handleUsageUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        };
        (window as any).ipcRenderer?.on('usage-updated', handleUsageUpdated);
        return () => {
            (window as any).ipcRenderer?.removeAllListeners('usage-updated');
        };
    }, [queryClient])

    return (
        <div className="flex h-[92vh] w-full flex-col bg-background">
            <div className="mx-auto w-full max-w-5xl flex justify-between gap-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold flex items-center gap-3"><LayoutDashboard className="w-7 h-7 text-cyan-500 dark:text-white" />Dashboard Overview</h1>
                    <p className="text-muted-foreground">Welcome Back {userdata?.username}!</p>
                </div>
            </div>
            <div className="mx-auto w-full max-w-5xl grid grid-cols-2 mt-4 gap-3">
                <StatCards />
            </div>
            <Separator className="mt-5" />
            <div className="mx-auto w-full max-w-5xl mt-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold flex items-center gap-3"><Sparkles className="w-7 h-7 text-cyan-500 dark:text-white" />Ai Providers Support</h1>
                </div>
                <div className="mx-auto w-full max-w-5xl mt-4">
                    <ProviderGrid />
                </div>
                <Separator className="mt-5" />
                <div className="flex flex-col gap-1 mt-5">
                    <h1 className="text-xl font-bold flex items-center gap-3"><Sparkles className="w-7 h-7 text-cyan-500 dark:text-white" />Services Support</h1>
                </div>
                <div className="mx-auto w-full max-w-5xl mt-4">
                    <ServiceGrid />
                </div>
                <Separator className="mt-5" />
            </div>
        </div>
    )
}
