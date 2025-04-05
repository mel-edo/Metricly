import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string | React.ReactNode;
  showPercentage?: boolean;
  tooltip?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  tooltip,
  className = "",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);
  
  // Determine color based on percentage
  let fillColorClass = "progress-bar-fill-low";
  if (percentage > 80) {
    fillColorClass = "progress-bar-fill-high";
  } else if (percentage > 50) {
    fillColorClass = "progress-bar-fill-medium";
  }
  
  const heightClass = 
    size === "sm" ? "h-1.5" : 
    size === "lg" ? "h-3" : 
    "h-2";
  
  const progressBar = (
    <div className={`flex items-center space-x-2 w-full ${className}`}>
      {label && <div className="text-xs text-muted-foreground w-24 overflow-hidden text-ellipsis whitespace-nowrap">{label}</div>}
      <div className={`progress-bar flex-1 ${heightClass}`}>
        <div 
          className={`${fillColorClass} h-full rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && <span className="text-xs font-medium">{percentage}%</span>}
    </div>
  );
  
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {progressBar}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return progressBar;
}