import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Spinner } from "@/shared/components/ui/spinner";
import { Globe, Key, Lock, Link, Unlink, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useN8nConfig } from "@/features/n8n/hooks/useN8nConfig";
import { useTestN8n } from "@/features/n8n/hooks/useTestN8n";
import { useConnectN8n } from "@/features/n8n/hooks/useConnectN8n";
import { useDisconnectN8n } from "@/features/n8n/hooks/useDisconnectN8n";
import { n8nauthstore } from "../store/store";

export const N8nConnectionPanel = () => {
  const { data: n8nConfig } = useN8nConfig();
  const store = n8nauthstore();
  const { mutateAsync: testN8n } = useTestN8n();
  const { mutateAsync: connectN8n } = useConnectN8n();
  const { mutateAsync: disconnectN8n } = useDisconnectN8n();

  const connected = !!(n8nConfig as any)?.connected;
  const loadingn8n = !n8nConfig;

  const handleTestConnection = async () => {
    if (!store.urlInput.trim()) {
      toast.error("Please enter an n8n URL.");
      return;
    }
    store.setTestingMode(true);
    store.setTestResult(null);
    try {
      const result = await testN8n({
        n8nUrl: store.urlInput.trim(),
        authType: store.authTypeInput,
        authValue: store.authValueInput || undefined,
      });
      if (result.success) {
        store.setTestResult(result.data);
        if (result.data.restApiAvailable)
          toast.success(`REST API detected! Mode: ${result.data.mode}`);
        else toast.warning("REST API not available. Switching to webhook mode.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to test connection.");
    } finally {
      store.setTestingMode(false);
    }
  };

  const handleConnect = async () => {
    if (!store.urlInput.trim()) {
      toast.error("Please enter an n8n URL.");
      return;
    }
    try {
      const authVal =
        store.authTypeInput === "none" ? undefined : store.authValueInput || undefined;
      const result = await connectN8n({
        n8nUrl: store.urlInput.trim(),
        authType: store.authTypeInput,
        authValue: authVal,
      });
      if (result.success) {
        toast.success("Connected to n8n!");
        store.setSettingsOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to connect.");
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await disconnectN8n();
      if (result.success) {
        toast.success("Disconnected from n8n.");
        store.setSettingsOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to disconnect.");
    }
  };

  return (
    <Dialog open={store.settingsOpen} onOpenChange={store.setSettingsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {connected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-gray-400" />
            )}
            n8n Connection Settings
          </DialogTitle>
          <DialogDescription>Configure your n8n instance connection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>n8n Instance URL</Label>
            <Input
              placeholder="https://your-n8n-instance.com"
              value={store.urlInput}
              onChange={(e) => store.setUrlInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Authentication Method</Label>
            <RadioGroup value={store.authTypeInput} onValueChange={store.setAuthTypeInput}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cookie" />
                <Label className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Cookie Auth
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="header" />
                <Label className="flex items-center gap-1">
                  <Key className="h-3 w-3" /> Header Auth
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" />
                <Label className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> No Auth (Public Webhook)
                </Label>
              </div>
            </RadioGroup>
          </div>
          {store.authTypeInput !== "none" && (
            <div className="space-y-2">
              <Label>Auth Value</Label>
              <Input
                placeholder={
                  store.authTypeInput === "cookie" ? "cookie_session=abc123" : "Bearer abc123..."
                }
                value={store.authValueInput}
                onChange={(e) => store.setAuthValueInput(e.target.value)}
              />
            </div>
          )}
          {store.testResult && (
            <div
              className={`p-3 rounded-md text-sm ${store.testResult.restApiAvailable ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"}`}
            >
              {store.testResult.restApiAvailable
                ? `REST API available (${store.testResult.mode}).`
                : "REST API not available. Using webhook mode."}
            </div>
          )}
        </div>
        <DialogFooter>
          {connected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              <Unlink className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={store.testingMode || loadingn8n}
              >
                {store.testingMode ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Link className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>
              <Button
                onClick={handleConnect}
                disabled={store.testingMode || loadingn8n || !store.urlInput.trim()}
              >
                <Wifi className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
