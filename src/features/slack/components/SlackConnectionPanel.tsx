import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

interface SlackConnectionPanelProps {
    workspace: string;
    isChecking: boolean;
    connectSlack: () => void;
}

export const SlackConnectionPanel: React.FC<SlackConnectionPanelProps> = ({
    workspace,
    isChecking,
    connectSlack,
}) => {
    return (
        <div className="min-h-[50vh] flex flex-col gap-2 justify-center items-center">
            <h1 className="text-3xl">Slack Agenting</h1>
            <p className="text-sm text-muted-foreground">Send Message To Get Started Slack Agenting.</p>
            {workspace ? (
                ""
            ) : (
                <Button disabled={isChecking} className="bg-cyan-500 dark:bg-white" onClick={() => connectSlack()}>
                    {isChecking ? <Spinner /> : "Connect Slack"}
                </Button>
            )}
        </div>
    );
};
