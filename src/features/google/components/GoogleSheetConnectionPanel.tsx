import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";

interface GoogleSheetConnectionPanelProps {
    opensheet: boolean;
    setopensheet: (open: boolean) => void;
    sheetinput: string;
    setsheetinput: (input: string) => void;
    loadingsheet: boolean;
    addsheetsheeturl: () => void;
    openservice: boolean;
    setopenservice: (open: boolean) => void;
    useremail: string;
    setuseremail: (email: string) => void;
    key: string;
    setkey: (key: string) => void;
    loading: boolean;
    addservice: () => void;
    serviceemail: string;
    sheet: Array<{ id: string; url: string; name: string }>;
    sheeturl: string;
    setsheeturl: (url: string) => void;
    provider: string;
    loadingfetch: boolean;
    selectedsheetTitle: string;
    sessionmessage: Array<unknown>;
    loadingsheetdelete: boolean;
    sheetmsgdelete: () => void;
    type: string | null;
}

export const GoogleSheetConnectionPanel = ({
    opensheet,
    setopensheet,
    sheetinput,
    setsheetinput,
    loadingsheet,
    addsheetsheeturl,
    openservice,
    setopenservice,
    useremail,
    setuseremail,
    key,
    setkey,
    loading,
    addservice,
    serviceemail,
    sheet,
    sheeturl,
    setsheeturl,
    provider,
    loadingfetch,
    selectedsheetTitle,
    sessionmessage,
    loadingsheetdelete,
    sheetmsgdelete,
    type,
}: GoogleSheetConnectionPanelProps) => {
    return (
        <>
            <Dialog open={opensheet} onOpenChange={setopensheet} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add GoogleSheetUrl</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="sheet">sheeturl</Label>
                        <Input id="sheet" placeholder="Enter GoogleSheetUrl" value={sheetinput} onChange={(e) => setsheetinput(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={addsheetsheeturl}
                            disabled={loadingsheet}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {loadingsheet ? <Spinner /> : "Add"}
                        </Button>
                        <Button variant="destructive" onClick={() => setopensheet(false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openservice} onOpenChange={setopenservice} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add Service Account</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Service Email</Label>
                        <Input id="email" placeholder="Enter Service Email" value={useremail} onChange={(e) => setuseremail(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="key">Service Key</Label>
                        <Input id="key" type="password" placeholder="Enter Service Key" value={key} onChange={(e) => setkey(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={addservice}
                            disabled={loading}
                            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                        > {loading ? <Spinner /> : "Create"}
                        </Button>
                        <Button variant="destructive" onClick={() => setopenservice(false)}
                        > Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
                <Button onClick={sheetmsgdelete} disabled={sessionmessage.length === 0 || loadingsheetdelete} className="bg-cyan-500 dark:bg-white">{loadingsheetdelete ? <Spinner /> : <><RefreshCw />Reset Chat</>}</Button>
                <div className="flex gap-2 items-center">
                    {serviceemail && (
                        <>
                            {sheet.length > 0 ? (
                                <Select
                                    key={`${provider}-${type}`}
                                    onValueChange={(val) => setsheeturl(val ?? "")}
                                    value={sheeturl}
                                    disabled={!provider || loadingfetch}
                                >
                                    <SelectTrigger>
                                        <span className="truncate">
                                            {sheeturl ? selectedsheetTitle : "Select sheeturl"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="p-1 w-60">
                                        {sheet.map((m) => (
                                            <SelectItem key={m.id} value={m.url}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem onClick={() => setopensheet(true)}>
                                            Add Sheeturl
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Button
                                    onClick={() => setopensheet(true)}
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
    );
};
