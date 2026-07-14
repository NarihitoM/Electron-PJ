import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { WRITE_TOOLS_LABELS } from "../../config/toolsselection";
import { extractToolMessage } from "../../utils/toolutils";
import { ShieldAlert } from "lucide-react";

interface ToolApprovalDialogProps {
  open: boolean;
  toolName: string;
  toolQuery: Record<string, unknown> | null;
  onApprove: () => void;
  onReject: () => void;
}

export const ToolApprovalDialog = ({
  open,
  toolName,
  toolQuery,
  onApprove,
  onReject,
}: ToolApprovalDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onReject();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="text-yellow-500" />
            Tool Approval Required
          </DialogTitle>
          <DialogDescription>
            This tool modifies external data. Review and approve before execution.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Tool</span>
            <span className="text-sm text-muted-foreground">
              {WRITE_TOOLS_LABELS[toolName] || toolName}
            </span>
          </div>
          {toolQuery && Object.keys(toolQuery).length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Arguments</span>
              <pre className="text-xs bg-muted rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {extractToolMessage(toolQuery) || JSON.stringify(toolQuery, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={onReject}>
            Reject
          </Button>
          <Button onClick={onApprove}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
