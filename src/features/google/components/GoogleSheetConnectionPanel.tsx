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
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { googleauthstore } from "../store/store";
import { googleauth } from "../api/api";

export const GoogleSheetConnectionPanel = () => {
  const store = googleauthstore();

  const addsheetsheeturl = async () => {
    if (!store.sheetinput.trim()) {
      toast.error("Please enter a Google Sheet URL");
      return;
    }
    try {
      const response = await googleauth.addgooglesheeturl(store.sheetinput);
      if (response.success) {
        toast.success(response.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        toast.error(Error.response?.data?.message || err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      store.setOpensheet(false);
      store.setsheetinput("");
    }
  };

  return (
    <Dialog open={store.opensheet} onOpenChange={store.setOpensheet} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add GoogleSheetUrl</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sheet">sheeturl</Label>
          <Input
            id="sheet"
            placeholder="Enter GoogleSheetUrl"
            value={store.sheetinput}
            onChange={(e) => store.setsheetinput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={addsheetsheeturl}
            disabled={store.loadingfetch_sheet || !store.sheetinput.trim()}
            className="bg-cyan-500 dark:bg-card-foreground dark:text-black"
          >
            {" "}
            {store.loadingfetch_sheet ? <Spinner /> : "Add"}
          </Button>
          <Button variant="destructive" onClick={() => store.setOpensheet(false)}>
            {" "}
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
