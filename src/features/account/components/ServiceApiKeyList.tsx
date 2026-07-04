import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export interface ServiceApiKeyItem {
    name: string;
    displayName: string;
    icon: string;
}

interface ServiceApiKeyListProps {
    providers: ServiceApiKeyItem[];
    activeProvider?: string;
    onProviderChange?: (value: string) => void;
    renderProviderUI: (provider: ServiceApiKeyItem) => React.ReactNode;
}

export const ServiceApiKeyList = ({ providers, renderProviderUI }: ServiceApiKeyListProps) => {
    return (
        <div className="mx-auto max-w-5xl">
            <Tabs defaultValue="openai" className="mt-5 flex flex-col">
                <TabsList className="bg-muted/50 p-3 flex flex-row gap-2 h-auto justify-start">
                    {providers.map((provider) => (
                        <TabsTrigger key={provider.name} value={provider.name} className="py-3">
                            <img src={provider.icon} className="bg-white rounded-lg w-5 h-5 p-0.5 object-contain shrink-0" />
                            <span className="mr-2">{provider.displayName}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {providers.map((provider) => (
                    <TabsContent key={provider.name} value={provider.name}>
                        {renderProviderUI(provider)}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
