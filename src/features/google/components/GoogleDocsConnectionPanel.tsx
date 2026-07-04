import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { RefreshCw } from "lucide-react";

interface GoogleDocsConnectionPanelProps {
    sessionmessage: any[];
    loadingdocsdelete: boolean;
    docsurl: string | null;
    docs: Array<{ id: string; url: string; name: string }>;
    serviceemail: string;
    provider: string;
    loadingfetch: boolean;
    selecteddocsTitle: string;
    setdocsurl: (value: string) => void;
    setopendocs: (open: boolean) => void;
    docsmsgdelete: () => void;
}

export const GoogleDocsConnectionPanel = ({
    sessionmessage,
    loadingdocsdelete,
    docsurl,
    docs,
    serviceemail,
    provider,
    loadingfetch,
    selecteddocsTitle,
    setdocsurl,
    setopendocs,
    docsmsgdelete,
}: GoogleDocsConnectionPanelProps) => {
    return (
        <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
            <Button onClick={docsmsgdelete} disabled={sessionmessage.length === 0 || loadingdocsdelete} className="bg-cyan-500 dark:bg-white">
                {loadingdocsdelete ? <Spinner /> : <><RefreshCw />Reset Chat</>}
            </Button>
            <div className="flex gap-2 items-center">
                {serviceemail && (
                    <>
                        {docs.length > 0 ? (
                            <Select
                                key={`${provider}-${docsurl}`}
                                onValueChange={(val) => setdocsurl(val ?? "")}
                                value={docsurl ?? undefined}
                                disabled={!provider || loadingfetch}
                            >
                                <SelectTrigger>
                                    <span className="truncate">
                                        {docsurl ? selecteddocsTitle : "Select docsurl"}
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="p-1 w-60">
                                    {docs.map((m) => (
                                        <SelectItem key={m.id} value={m.url}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem onClick={() => setopendocs(true)}>
                                        Add Docsurl
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Button onClick={() => setopendocs(true)}
                                className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                            >
                                Add Docsurl
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
