import { useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import { toast } from "sonner"
import { notionauth } from "../api/api"
import { notionauthstore } from "../store/store"
import { useNotionAccount } from "../hooks/useNotionAccount"
import { datafetch } from "@/shared/config/tanstackqueryconfig"

export const NotionConnectionPanel = () => {
    const store = notionauthstore()
    const { data: notionAccount, isLoading } = useNotionAccount()
    const workspacename = (notionAccount as any)?.workspacename ?? ""

    const connectNotion = async () => {
        const response = await notionauth.notionstate()
        const stateId = response.stateId
        const clientid = import.meta.env.VITE_NOTION_CLIENT_ID
        if (!clientid) {
            toast.error("Notion Client ID not configured.")
            return
        }
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app"
        const redirecturi = encodeURIComponent(`${backendUrl}/notion/api/callback`)
        const url = `https://api.notion.com/v1/oauth/authorize?client_id=${clientid}&response_type=code&owner=user&redirect_uri=${redirecturi}&state=${stateId}`
        ;(window.ipcRenderer as any).openInBrowser(url)
        store.setIsChecking(true)
    }

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined
        let fallbackTimeout: ReturnType<typeof setTimeout> | undefined

        if (store.isChecking) {
            fallbackTimeout = setTimeout(() => {
                store.setIsChecking(false)
                if (interval) clearInterval(interval)
            }, 180000)

            interval = setInterval(async () => {
                try {
                    const response = await notionauth.notioncheckstatus()
                    if (response.success) {
                        store.setIsChecking(false)
                        await datafetch.invalidateQueries({ queryKey: ["notion"] })
                        if (interval) clearInterval(interval)
                        if (fallbackTimeout) clearTimeout(fallbackTimeout)
                    }
                } catch (err) {
                    console.error("Polling error", err)
                }
            }, 1000)

            return () => {
                clearInterval(interval)
                clearTimeout(fallbackTimeout)
            }
        }
    }, [store.isChecking])

    if (isLoading) {
        return (
            <div className="min-h-[92vh] flex items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        )
    }

    if (workspacename) return null

    return (
        <div className="min-h-[92vh] flex flex-col gap-2 justify-center items-center">
            <h1 className="text-3xl">Notion Agenting</h1>
            <p className="text-sm text-muted-foreground">Send Message To Get Started Notion Agenting.</p>
            <Button disabled={store.isChecking} className="bg-cyan-500 dark:bg-white" onClick={connectNotion}>
                {store.isChecking ? <Spinner /> : "Connect Notion"}
            </Button>
        </div>
    )
}
