import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useGoogleService } from "@/features/google/hooks/useGoogleService";
import { useDeleteGoogleDocMessage } from "@/features/google/hooks/useDeleteGoogleDocMessage";
import { useGoogleConnect } from "@/features/google/hooks/useGoogleConnect";
import { googleauthstore } from "../store/store";
import { googleauth } from "../api/api";

export const GoogleDocsConnectionPanel = () => {
  const { data: googleService } = useGoogleService();
  const deleteDocsMutation = useDeleteGoogleDocMessage();
  const store = googleauthstore();
  const { connect, isChecking } = useGoogleConnect();

  const docs = (googleService as any)?.googledocs ?? [];
  const serviceemail = (googleService as any)?.email ?? "";
  const loadingfetch = !googleService;
  const loadingdocsdelete = deleteDocsMutation.isPending;

  const selecteddocsTitle = docs.find((g: any) => g.url === store.docsurl)?.name || "";

  const adddocsurl = async () => {
    try {
      const response = await googleauth.addgoogledocsurl(store.docsinput);
      if (response.success) {
        toast.success(response.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      store.setOpendocs(false);
      store.setDocsinput("");
    }
  };

  const connectGoogle = async () => {
    try {
      await connect();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const docsmsgdelete = async () => {
    try {
      const response = await deleteDocsMutation.mutateAsync();
      if (response.success) {
        toast.success(response.message);
        store.setsessionmessage_docs([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <div className="flex w-full gap-2 justify-between mx-auto max-w-5xl mb-3 mt-3">
        <Button
          onClick={docsmsgdelete}
          disabled={store.sessionmessage_docs.length === 0 || loadingdocsdelete}
          className="bg-cyan-500 dark:bg-white"
        >
          {loadingdocsdelete ? (
            <Spinner />
          ) : (
            <>
              <RefreshCw />
              Reset Chat
            </>
          )}
        </Button>
        <div className="flex gap-2 items-center">
          {serviceemail ? (
            <>
              {!loadingfetch && (
                <Button
                  onClick={connectGoogle}
                  disabled={isChecking}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {isChecking ? <Spinner /> : "Reconnect Google"}
                </Button>
              )}
              {docs.length > 0 ? (
                <Select
                  key={`${store.provider}-${store.docsurl}`}
                  onValueChange={(val) => store.setdocsurl(val ?? "")}
                  value={store.docsurl ?? undefined}
                  disabled={!store.provider || loadingfetch}
                >
                  <SelectTrigger>
                    <span className="truncate">
                      {store.docsurl ? selecteddocsTitle : "Select docsurl"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="p-1 w-60">
                    {docs.map((m: any) => (
                      <SelectItem key={m.id} value={m.url}>
                        {m.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add_docsurl" onClick={() => store.setOpendocs(true)}>
                      Add Docsurl
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Button
                  onClick={() => store.setOpendocs(true)}
                  className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
                >
                  Add Docsurl
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={connectGoogle}
              disabled={isChecking}
              className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
            >
              {isChecking ? <Spinner /> : "Connect Google"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={store.opendocs} onOpenChange={store.setOpendocs} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Add GoogleDocsUrl</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="docs">Url</Label>
            <Input
              id="docs"
              placeholder="Enter GoogleDocsUrl"
              value={store.docsinput}
              onChange={(e) => store.setDocsinput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={adddocsurl}
              disabled={loadingfetch}
              className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
            >
              {" "}
              {loadingfetch ? <Spinner /> : "Add"}
            </Button>
            <Button variant="destructive" onClick={() => store.setOpendocs(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
