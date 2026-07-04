import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard, ServiceCardData } from "./ServiceCard";

interface ServiceIntegrationListProps {
    search: string;
    onSearchChange: (value: string) => void;
    services: ServiceCardData[];
    onServiceClick: (id: string) => void;
}

export const ServiceIntegrationList = ({ search, onSearchChange, services, onServiceClick }: ServiceIntegrationListProps) => {
    return (
        <div className="mx-auto max-w-5xl px-4 mt-4 mb-6">
            <div className="flex flex-col gap-1 mb-4">
                <h1 className="text-2xl font-bold">Connected Services</h1>
                <p className="text-muted-foreground">Manage your connected third-party services.</p>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search connected services..."
                    className="pl-10 h-11 rounded-xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onClick={onServiceClick}
                    />
                ))}

                {services.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Search className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm">No services match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
