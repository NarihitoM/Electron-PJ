import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Spinner } from "@/shared/components/ui/spinner";
import { Globe, Key, Lock, Link, Unlink, Wifi, WifiOff } from "lucide-react";

interface N8nConnectionPanelProps {
    settingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
    connected: boolean;
    n8nUrl: string;
    authType: string;
    authValue: string;
    detectedMode: string;
    loadingn8n: boolean;
    urlInput: string;
    setUrlInput: (v: string) => void;
    authTypeInput: string;
    setAuthTypeInput: (v: string) => void;
    authValueInput: string;
    setAuthValueInput: (v: string) => void;
    testingMode: boolean;
    testResult: { restApiAvailable: boolean; mode: string } | null;
    handleTestConnection: () => void;
    handleConnect: () => void;
    handleDisconnect: () => void;
}

export const N8nConnectionPanel = ({
    settingsOpen,
    setSettingsOpen,
    connected,
    n8nUrl,
    authType,
    detectedMode,
    loadingn8n,
    urlInput,
    setUrlInput,
    authTypeInput,
    setAuthTypeInput,
    authValueInput,
    setAuthValueInput,
    testingMode,
    testResult,
    handleTestConnection,
    handleConnect,
    handleDisconnect,
}: N8nConnectionPanelProps) => {
    return (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>n8n Connection</DialogTitle>
                    <DialogDescription>
                        Connect your n8n instance. For self-hosted n8n, use session cookie. For Cloud Pro, use API key. Cloud Free users: no auth needed (webhook only).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label htmlFor="n8nUrl">n8n URL</Label>
                        <Input
                            id="n8nUrl"
                            value={connected ? n8nUrl : urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="http://localhost:5678"
                            disabled={connected}
                        />
                    </div>
                    {!connected && (
                        <>
                            <div className="space-y-1">
                                <Label>Auth Method</Label>
                                <RadioGroup value={authTypeInput} onValueChange={setAuthTypeInput} className="flex flex-col gap-2 pt-1">
                                    <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                                        <RadioGroupItem value="cookie" id="auth-cookie" />
                                        <Label htmlFor="auth-cookie" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Lock size={16} /> Session Cookie <span className="text-xs text-muted-foreground">(Self-hosted n8n — recommended)</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                                        <RadioGroupItem value="apikey" id="auth-apikey" />
                                        <Label htmlFor="auth-apikey" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Key size={16} /> API Key <span className="text-xs text-muted-foreground">(Self-hosted or Cloud Pro)</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                                        <RadioGroupItem value="none" id="auth-none" />
                                        <Label htmlFor="auth-none" className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Globe size={16} /> No Auth <span className="text-xs text-muted-foreground">(Cloud Free — webhook only)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {authTypeInput !== "none" && (
                                <div className="space-y-1">
                                    <Label htmlFor="n8nAuthValue">
                                        {authTypeInput === "cookie" ? "Session Cookie" : "API Key"}
                                    </Label>
                                    <Input
                                        id="n8nAuthValue"
                                        type="password"
                                        value={authValueInput}
                                        onChange={(e) => setAuthValueInput(e.target.value)}
                                        placeholder={authTypeInput === "cookie" ? "Paste your n8n session cookie..." : "Enter your n8n API key..."}
                                    />
                                    {authTypeInput === "cookie" && (
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            How to get your cookie: Open n8n in browser → F12 → Application → Cookies → Copy value
                                        </p>
                                    )}
                                </div>
                            )}
                            <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testingMode || !urlInput.trim()} className="w-full">
                                {testingMode ? <Spinner className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
                                Test Connection
                            </Button>
                            {testResult && (
                                <div className={`rounded-lg border p-3 text-sm ${testResult.restApiAvailable ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
                                    <div className="flex items-center gap-2">
                                        {testResult.restApiAvailable ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-yellow-500" />}
                                        <span className={testResult.restApiAvailable ? "text-green-600" : "text-yellow-600"}>
                                            {testResult.restApiAvailable ? "REST API available — Full agent access" : "REST API unavailable — Webhook mode only"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {connected && (
                        <div className="rounded-lg border p-3 text-sm bg-blue-500/5 border-blue-500/20">
                            <div className="flex items-center gap-2">
                                {detectedMode === "rest" ? <Wifi className="h-4 w-4 text-blue-500" /> : <Globe className="h-4 w-4 text-blue-500" />}
                                <span>Mode: <strong>{authType === "none" ? "Webhook" : "REST API — Full Access"}</strong></span>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2">
                    {connected ? (
                        <Button variant="destructive" onClick={handleDisconnect} disabled={loadingn8n}>
                            {loadingn8n ? <Spinner /> : <><Unlink className="mr-2 h-4 w-4" />Disconnect</>}
                        </Button>
                    ) : (
                        <Button onClick={handleConnect} className="bg-cyan-500 dark:bg-white" disabled={loadingn8n || !urlInput.trim()}>
                            {loadingn8n ? <Spinner /> : <><Link className="mr-2 h-4 w-4" />Connect</>}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
