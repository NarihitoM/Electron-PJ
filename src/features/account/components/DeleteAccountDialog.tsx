import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Spinner } from "@/shared/components/ui/spinner"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { userauthapi } from "@/features/auth/api/api"
import { useNavigate } from "react-router-dom"
import { accountstore } from "../store/store"

export const DeleteAccountDialog = () => {
    const { deleteDialogOpen, setDeleteDialogOpen, deleteloading, setDeleteloading } = accountstore()
    const [confirmText, setConfirmText] = useState("")
    const navigate = useNavigate()

    const handleDelete = async () => {
        if (confirmText !== "DELETE") return
        setDeleteloading(true)
        try {
            const response = await userauthapi.deleteaccount()
            if (response.success) {
                toast.success(response.message)
                setDeleteDialogOpen(false)
                setConfirmText("")
                await userauthapi.logout()
                navigate("/", { state: { logoutSuccess: true }, replace: true })
            } else {
                toast.error(response.message)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const error = (err as any).response?.data?.message || err.message
                toast.error(error)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setDeleteloading(false)
        }
    }

    const handleClose = () => {
        setDeleteDialogOpen(false)
        setConfirmText("")
    }

    return (
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <DialogTitle>Delete Account</DialogTitle>
                    </div>
                    <DialogDescription className="space-y-2 text-left">
                        <p>This action will schedule your account for <b>permanent deletion</b>.</p>
                        <p>Your account and all associated data (chats, messages, service connections) will be permanently deleted after <b>30 days</b>.</p>
                        <p className="text-sm text-muted-foreground">You can cancel this at any time by logging back in before the 30-day period ends.</p>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="confirm-delete">Type <b>DELETE</b> to confirm</Label>
                    <Input
                        id="confirm-delete"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="destructive"
                        disabled={confirmText !== "DELETE" || deleteloading}
                        onClick={handleDelete}
                    >
                        {deleteloading ? <Spinner /> : "Delete Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
