import { useState } from "react"
import { Send, Eye, EyeOff, ChevronsUpDown } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { telegramauth } from "@/features/telegram/api/api"
import { telegramauthstore } from "@/features/telegram/store/store"

const countries = [
    { label: "MM (+95)", value: "+95", code: "MM" },
    { label: "US (+1)", value: "+1", code: "US" },
    { label: "UK  (+44)", value: "+44", code: "UK" },
    { label: "SG (+65)", value: "+65", code: "SG" },
    { label: "TH (+66)", value: "+66", code: "TH" },
    { label: "JP (+81)", value: "+81", code: "JP" },
]

export const TelegramConnectionPanel = () => {
    const store = telegramauthstore()
    const queryClient = useQueryClient()
    const [showPassword, setShowPassword] = useState(false)
    const [open, setOpen] = useState(false)

    const handlecodesend = async () => {
        try {
            store.setLoading(true)
            const Country = store.countryCode.replace(/\D/g, "")
            let Local = store.phonenumber
            if (Local.startsWith("0")) {
                Local = Local.substring(1)
            }
            const formattedPhoneNumber = `${Country}${Local}`
            const response = await telegramauth.telegramservicecreate(formattedPhoneNumber, store.password)
            if (response.success) {
                toast.success(response.message || "Verification Code Has Been Send!")
                store.setOpenverify(true)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setLoading(false)
        }
    }

    const handleverifycode = async () => {
        try {
            store.setLoadingverify(true)
            const response = await telegramauth.telegramverify(store.phonecode)
            if (response.success) {
                toast.success(response.message || "Verification Successful!")
                store.setOpencreate(false)
                store.setOpenverify(false)
                store.setPhonenumber("")
                store.setPassword("")
                store.setPhonecode("")
                queryClient.invalidateQueries({ queryKey: ["telegram"] })
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any
                toast.error(Error.response?.data?.message || err.message)
                store.setOpencreate(false)
                store.setOpenverify(false)
                store.setPhonenumber("")
                store.setPassword("")
                store.setPhonecode("")
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            store.setLoadingverify(false)
        }
    }

    return (
        <Dialog open={store.opencreate} onOpenChange={store.setOpencreate} modal={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl"><Send size={30} className="text-cyan-500 dark:text-white" /> Set Up Telegram Account</DialogTitle>
                </DialogHeader>
                {!store.openverify ? (
                    <>
                        <DialogDescription className="font-semibold">Note: You need to have 2FA enable to continue the service.</DialogDescription>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex items-center space-x-2 w-full">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger className="w-27.5 justify-between shrink-0 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" role="combobox" aria-expanded={open}>
                                        {store.countryCode}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-50 p-1" align="start">
                                        <Command className="bg-transparent">
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country) => (
                                                        <CommandItem
                                                            key={country.value}
                                                            value={country.label}
                                                            onSelect={() => {
                                                                store.setCountryCode(country.value)
                                                                setOpen(false)
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            {country.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Phone number"
                                    value={store.phonenumber}
                                    onChange={(e) => {
                                        const cleaned = e.target.value.replace(/\D/g, "")
                                        store.setPhonenumber(cleaned)
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Include + and country code (e.g. +95)</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">2FA Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your 2FA account password"
                                    value={store.password}
                                    onChange={(e) => store.setPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="12345"
                            value={store.phonecode}
                            onChange={(e) => store.setPhonecode(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Enter the code sent to your Telegram app.</p>
                    </div>
                )}

                <DialogFooter>
                    {store.openverify ? (
                        <Button
                            onClick={handleverifycode}
                            disabled={store.loadingverify}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        >
                            {store.loadingverify ? <Spinner /> : "Verify & Login"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handlecodesend}
                            disabled={store.loading}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        >
                            {store.loading ? <Spinner /> : "Send Code"}
                        </Button>
                    )}
                    <Button onClick={() => {
                        store.setOpencreate(false)
                        store.setOpenverify(false)
                    }} variant="destructive">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
