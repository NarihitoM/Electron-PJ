import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { googleauthstore } from "../store/store";
import { googleauth } from "../api/api";

export const GoogleDocsConnectionPanel = () => {
  const store = googleauthstore();

  const adddocsurl = async () => {
    if (!store.docsinput.trim()) {
      toast.error("Please enter a Google Docs URL");
      return;
    }
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

  return (
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
            disabled={!store.docsinput.trim()}
            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
          >
            Add
          </Button>
          <Button variant="destructive" onClick={() => store.setOpendocs(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
