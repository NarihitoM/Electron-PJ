import { Button } from "@/shared/components/ui/button";

interface ServiceConnectionPanelProps {
    onAddProvider: () => void;
}

export function ServiceConnectionPanel({ onAddProvider }: ServiceConnectionPanelProps) {
    return (
        <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
            <h1 className="text-3xl">How can i help you today?</h1>
            <p className="text-sm text-muted-foreground">Send Message To Get Started.</p>
            <Button className="bg-cyan-500 dark:bg-white" onClick={onAddProvider}>Add Provider</Button>
        </div>
    );
}
