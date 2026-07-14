import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SERVICES } from "@/shared/config/service";
import { GoogleIcon } from "@/shared/components/ui/googleicon";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "../hooks/useDashboardStats";

export const ServiceGrid = () => {
  const { isLoading } = useDashboardStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full rounded-md mb-2" />
              <Skeleton className="h-3 w-[85%] rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SERVICES.map((service) => (
        <Card
          key={service.name}
          className="hover:border-cyan-500/50 hover:border transition-all hover:shadow-md cursor-pointer"
          onClick={() => navigate("/app/settings")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              {service.isComponent ? (
                <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
                  <GoogleIcon />
                </div>
              ) : (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-10 h-10 rounded-lg bg-white p-1 object-contain"
                />
              )}
              <div>
                <CardTitle className="text-base">{service.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
