import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ProgressBar } from "./ProgressBar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Info, Terminal, RefreshCw, Play, Pause, Trash2, Edit } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
interface ContainerCardProps {
  id: string;
  name: string;
  status: "running" | "stopped" | "paused" | "error";
  cpu: {
    usage: number;
    limit?: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  image: string;
  ports?: {
    container: string;
    host: string;
  }[];
  onAction?: (action: string, id: string) => void;
}
export function ContainerCard({
  id,
  name,
  status,
  cpu,
  memory,
  image,
  ports,
  onAction
}: ContainerCardProps) {
  const statusColors = {
    running: "bg-metricly-success text-metricly-background",
    stopped: "bg-gray-500 text-white",
    paused: "bg-metricly-warning text-metricly-background",
    error: "bg-metricly-error text-white"
  };
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, id);
    }
  };
  return <Card className="bg-metricly-secondary border-white/5 overflow-hidden hover:border-metricly-accent/20 transition-colors">
      <CardHeader className="pb-3 relative">
        <Badge className={`absolute top-0 right-0 mt-4 mr-4 ${statusColors[status]}`}>
          {status}
        </Badge>
        <div className="flex items-start justify-between">
          <div className="space-y-1 mt-6">
            <CardTitle className="font-mono text-base flex items-center text-justify">
              {name}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{image}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>CPU Usage</span>
            <span>{cpu.usage}%</span>
          </div>
          <ProgressBar value={cpu.usage} max={100} size="sm" />

          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <span>Memory</span>
            <span>{Math.round(memory.usage / 1024 / 1024 * 10) / 10} MB / {Math.round(memory.limit / 1024 / 1024 * 10) / 10} GB</span>
          </div>
          <ProgressBar value={memory.usage} max={memory.limit} size="sm" />
        </div>

        {ports && ports.length > 0 && <div className="bg-metricly-background/30 rounded-md p-2 mt-2">
            <h4 className="text-xs font-medium mb-1">Ports</h4>
            <div className="grid grid-cols-2 gap-1">
              {ports.slice(0, 4).map((port, i) => <div key={i} className="text-xs text-muted-foreground">
                  {port.container} → {port.host}
                </div>)}
              {ports.length > 4 && <div className="text-xs text-muted-foreground mt-1">
                  +{ports.length - 4} more...
                </div>}
            </div>
          </div>}

        <div className="flex space-x-2 mt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAction('info')}>
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Container Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAction('terminal')}>
                  <Terminal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Terminal</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAction('restart')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restart</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAction(status === 'running' ? 'stop' : 'start')}>
                  {status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{status === 'running' ? 'Stop' : 'Start'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAction('edit')}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-900/20 hover:text-red-400" onClick={() => handleAction('delete')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>;
}
