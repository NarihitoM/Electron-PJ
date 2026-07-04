import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

interface NotionConnectionPanelProps {
    isChecking: boolean;
    connectNotion: () => void;
}

export const NotionConnectionPanel = ({
    isChecking,
    connectNotion,
}: NotionConnectionPanelProps) => {
    return (
        <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
            <h1 className="text-3xl">Notion Agenting</h1>
            <p className="text-sm text-muted-foreground">Send Message To Get Started Notion Agenting.</p>
            <Button disabled={isChecking} className="bg-cyan-500 dark:bg-white" onClick={connectNotion}>{isChecking ? <Spinner /> : "Connect Notion"}</Button>
        </div>
    );
};
