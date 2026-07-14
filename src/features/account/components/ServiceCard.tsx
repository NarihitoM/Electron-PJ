import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { GoogleIcon } from "@/shared/components/ui/googleicon";

export interface ServiceCardData {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  isActive: boolean;
}

interface ServiceCardProps {
  service: ServiceCardData;
  onClick: (id: string) => void;
}

export const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  return (
    <Card
      className="border border-transparent bg-card shadow-none p-0 animate-in fade-in slide-in-from-bottom-2 cursor-pointer hover:bg-accent/50 hover:border-cyan-500/50 transition-all"
      onClick={() => onClick(service.id)}
    >
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 dark:bg-white rounded-lg shrink-0">
            {service.icon ? (
              <img src={service.icon} className="h-5 w-5 object-contain" alt={service.name} />
            ) : (
              <GoogleIcon />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold">{service.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {service.description}
            </CardDescription>
          </div>
          {service.isActive && (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 shrink-0">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
