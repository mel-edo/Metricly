import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cva } from "class-variance-authority";

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const metricCardVariants = cva(
  "metric-card overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-metricly-secondary border-white/5",
        gradient: "bg-gradient-to-br from-metricly-secondary to-metricly-background border-metricly-accent/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function MetricCard({ title, icon, children, className }: MetricCardProps) {
  return (
    <Card className={metricCardVariants({ className })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-muted-foreground hover:text-metricly-accent">{icon}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title} metrics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
