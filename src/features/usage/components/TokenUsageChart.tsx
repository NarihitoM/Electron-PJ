import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { formatNumber } from "./usageHelpers";
import { useUsageStats } from "../hooks/useUsageStats";
import { usagestore } from "../store/store";

const barChartConfig = {
  inputTokens: { label: "Input Tokens", color: "#06b6d4" },
  outputTokens: { label: "Output Tokens", color: "#8b5cf6" },
} satisfies ChartConfig;

export const TokenUsageChart = () => {
  const { data: stats, isLoading } = useUsageStats();
  const { period } = usagestore();
  const data = stats?.byTime;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        {!isLoading ? (
          <CardTitle className="text-base">Token Usage Over Time</CardTitle>
        ) : (
          <Skeleton className="h-5 w-44" />
        )}
      </CardHeader>
      <CardContent>
        {data && !isLoading && data.length > 0 ? (
          <ChartContainer config={barChartConfig} className="h-50 w-full">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  if (period === "day") {
                    const h = parseInt(v, 10);
                    const ampm = h >= 12 ? "PM" : "AM";
                    const h12 = h % 12 || 12;
                    return `${h12} ${ampm}`;
                  }
                  if (period === "year") {
                    const d = new Date(v + "-01");
                    return d.toLocaleString("en", { month: "short" });
                  }
                  return v.slice(5);
                }}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNumber} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="inputTokens" fill="var(--color-inputTokens)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outputTokens" fill="var(--color-outputTokens)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : isLoading ? (
          <Skeleton className="h-50 w-full rounded-lg" />
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
