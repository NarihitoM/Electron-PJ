import { RefreshCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select"
import { toast } from "sonner"
import { useGoogleService } from "@/features/google/hooks/useGoogleService"
import { googleauthstore } from "../store/store"
import { googleauth } from "../api/api"
import { useMemo } from "react"

export const GoogleSheetConnectionPanel = () => {
    const { data: googleService } = useGoogleService()
    const store = googleauthstore()

    const serviceemail = (googleService as any)?.email ?? ""
    const sheet = (googleService as any)?.googlesheet ?? []

    const selectedsheetTitle = useMemo(() => {
        return sheet.find((g: any) => g.url === store.sheeturl)?.name || ""
    }, [store.sheeturl, sheet])

    const addsheetsheeturl = async () => {
        try {
            const response = await googleauth.addgooglesheeturl(store.sheetinput)
            if (response.success) {
                toast.success(response.message)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setOpensheet(false)
            store.setsheetinput("")
        }
    }

    const addservice = async () => {
        try {
            const response = await googleauth.addservice(store.useremail_sheet, store.key_sheet)
            if (response.success) {
                toast.success(response.message)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setOpenservice(false)
            store.setuseremail_sheet("")
            store.setsheetinput("")
            store.setkey_sheet("")
        }
    }

    const sheetmsgdelete = async () => {
        try {
            const response = await googleauth.deletesheetmsg()
            if (response.success) {
                toast.success(response.message)
                store.setsessionmessage_sheet([])
                store.setNextCursor_sheet(null)
                store.setHasMore_sheet(false)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }

    return (
        <>
            <Dialog open={store.opensheet} onOpenChange={store.setOpensheet} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add GoogleSheetUrl</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="sheet">sheeturl</Label>
                        <Input id="sheet" placeholder="Enter GoogleSheetUrl" value={store.sheetinput} onChange={(e) => store.setsheetinput(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={addsheetsheeturl}
                            disabled={store.loadingfetch_sheet}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {store.loadingfetch_sheet ? <Spinner /> : "Add"}
                        </Button>
                        <Button variant="destructive" onClick={() => store.setOpensheet(false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={store.openservice} onOpenChange={store.setOpenservice} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add Service Account</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Service Email</Label>
                        <Input id="email" placeholder="Enter Service Email" value={store.useremail_sheet} onChange={(e) => store.setuseremail_sheet(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="key">Service Key</Label>
                        <Input id="key" type="password" placeholder="Enter Service Key" value={store.key_sheet} onChange={(e) => store.setkey_sheet(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={addservice}
                            disabled={store.loadingfetch_sheet}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {store.loadingfetch_sheet ? <Spinner /> : "Create"}
                        </Button>
                        <Button variant="destructive" onClick={() => store.setOpenservice(false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <Button onClick={sheetmsgdelete} disabled={store.sessionmessage_sheet.length === 0 || store.loadingfetch_sheet} className="bg-cyan-500 dark:bg-white">{store.loadingfetch_sheet ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                <div className="flex gap-2 items-center">
                    {serviceemail && (
                        <>
                            {sheet.length > 0 ? (
                                <Select
                                    key={`${store.provider}-${store.type_sheet}`}
                                    onValueChange={(val) => store.setsheeturl(val ?? "")}
                                    value={store.sheeturl}
                                    disabled={!store.provider || store.loadingfetch_sheet}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {store.sheeturl ? selectedsheetTitle : "Select sheeturl"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60">
                                        {sheet.map((m: any) => (
                                            <SelectItem key={m.id} value={m.url}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem onClick={() => store.setOpensheet(true)}>
                                            Add Sheeturl
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Button
                                    onClick={() => store.setOpensheet(true)}
                                    className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                                >
                                    Add Sheeturl
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
