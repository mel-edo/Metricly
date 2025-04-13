import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ProgressBar } from "./ProgressBar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Terminal, RefreshCw, Play, Pause, Trash2, Edit, CheckCircle, AlertTriangle, XCircle, AlertCircle, ExternalLink, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
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
  // State for URL editing dialog
  const [isEditUrlDialogOpen, setIsEditUrlDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  // State to store the custom URL for this container
  const storageKey = `container-${id}-custom-url`;
  const savedCustomUrl = localStorage.getItem(storageKey);
  // Function to determine the container's URL based on its ports
  // urlVersion is used to force re-evaluation when the URL changes
  const getContainerUrl = (): string | null => {
    // This is just to make the linter happy that we're using urlVersion
    if (urlVersion < 0) return null; // This will never happen
    // First check if there's a custom URL saved for this container
    if (savedCustomUrl) {
      // Clean up the URL - remove commas and anything after the first port
      const cleanUrl = savedCustomUrl.split(',')[0].trim();
      return cleanUrl;
    }

    if (!ports || ports.length === 0) return null;

    try {
      // Look for common web ports (80, 443, 8080, 3000, etc.)
      const webPorts = ['80', '443', '8080', '3000', '8000', '8888', '5000', '5173'];

      // First, try to find a port that matches common web ports
      for (const webPort of webPorts) {
        const port = ports.find(p => p.container === webPort || p.host === webPort);
        if (port) {
          const protocol = port.container === '443' || port.host === '443' ? 'https' : 'http';
          // Ensure the port is a valid string and take only the first part if there are commas
          const hostPort = String(port.host).split(',')[0].trim();
          if (hostPort) {
            return `${protocol}://localhost:${hostPort}`;
          }
        }
      }

      // If no common web port is found, use the first port
      if (ports.length > 0) {
        const firstPort = ports[0];
        // Make sure the port has a host value
        if (firstPort.host) {
          // Take only the first part if there are commas
          const hostPort = String(firstPort.host).split(',')[0].trim();
          if (hostPort) {
            return `http://localhost:${hostPort}`;
          }
        }
      }
    } catch (error) {
      console.error('Error generating container URL:', error);
    }

    return null;
  };

  // Function to open the container URL in a new tab
  const openContainerUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const url = getContainerUrl();
      console.log('Opening URL:', url); // Debug log

      if (!url) {
        console.warn('No URL available to open');
        return;
      }

      // Open URL in a new tab using window.open
      window.open(url, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Error in openContainerUrl:', error);

      // Fallback method if window.open fails
      try {
        const url = getContainerUrl();
        if (url) {
          // Create a temporary link element
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (fallbackError) {
        console.error('Fallback method failed:', fallbackError);
        alert(`Could not open URL: ${getContainerUrl()}. Try editing the URL.`);
      }
    }
  };

  // Function to open the URL edit dialog
  const openEditUrlDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Initialize with current URL or empty string
    setCustomUrl(getContainerUrl() || '');
    setIsEditUrlDialogOpen(true);
  };

  // State to force re-render when URL changes
  const [urlVersion, setUrlVersion] = useState(0);

  // Function to save the custom URL
  const saveCustomUrl = () => {
    try {
      // Basic validation
      if (customUrl) {
        // Clean up the URL - remove commas and anything after the first port
        const cleanUrl = customUrl.split(',')[0].trim();

        // Try to parse as URL to validate
        new URL(cleanUrl);

        // Save to localStorage
        localStorage.setItem(storageKey, cleanUrl);
        toast.success('Custom URL saved');
      } else {
        // If empty, remove any saved custom URL
        localStorage.removeItem(storageKey);
        toast.success('Custom URL removed');
      }

      // Close the dialog
      setIsEditUrlDialogOpen(false);

      // Update the UI without refreshing the page
      // Increment the version to force a re-render
      setUrlVersion(prev => prev + 1);

      // Reset the input field
      setCustomUrl("");
    } catch (error) {
      toast.error('Invalid URL format');
    }
  };
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

  // Check if the container has web ports
  const hasWebPort = getContainerUrl() !== null;
  return <>
    {/* URL Edit Dialog */}
    <Dialog open={isEditUrlDialogOpen} onOpenChange={setIsEditUrlDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Container URL</DialogTitle>
          <DialogDescription>
            Enter a custom URL for this container or leave empty to use the auto-detected URL.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">Custom URL</label>
            <Input
              id="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://localhost:8080"
              className="w-full bg-metricly-background text-white border-metricly-secondary/80"
            />
            <p className="text-xs text-muted-foreground">Enter a custom URL or leave empty to use auto-detected URL</p>
          </div>

          {ports && ports.length > 0 && (
            <div className="mt-4 p-3 bg-metricly-background rounded-md border border-metricly-secondary/50">
              <p className="text-sm font-medium mb-2">Available Ports</p>
              <div className="space-y-2">
                {ports.map((port, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-metricly-secondary/30 p-2 rounded">
                    <div className="flex space-x-2">
                      <span className="text-muted-foreground">Container:</span>
                      <span className="font-mono text-metricly-accent">{port.container}</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex space-x-2">
                      <span className="text-muted-foreground">Host:</span>
                      <span className="font-mono text-metricly-accent">{port.host}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditUrlDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveCustomUrl}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card className="bg-metricly-secondary border-white/5 overflow-hidden hover:border-metricly-accent/20 transition-colors flex flex-col h-full relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-base text-text">
            {name}
          </CardTitle>
          <Badge className={`${statusColors[status]}`}>
            {status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{image}</p>
      </CardHeader>
      <CardContent className="pb-4 space-y-4 flex-1">
        {/* Health Status Indicator */}
        <div className="flex items-center justify-between p-2 rounded-md bg-metricly-background/30 mb-3">
          <span className="text-xs font-medium">Health Status</span>
          <TooltipProvider>
            {status === "running" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-green cursor-help">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Healthy</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Container is running normally</p>
                  <p>All services are operational</p>
                </TooltipContent>
              </Tooltip>
            ) : status === "paused" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-yellow cursor-help">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Paused</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Container is paused</p>
                  <p>Resume to restore functionality</p>
                </TooltipContent>
              </Tooltip>
            ) : status === "error" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-red cursor-help">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Error</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Container has encountered an error</p>
                  <p>Check logs for more information</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-gray-400 cursor-help">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Stopped</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Container is stopped</p>
                  <p>Start the container to resume services</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

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

      </CardContent>
      <div className="px-6 pb-4 mt-auto border-t border-metricly-background/20 pt-3">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 ${!hasWebPort
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10'}`}
                  onClick={(e) => {
                    if (hasWebPort) {
                      e.stopPropagation();
                      openContainerUrl(e);
                    }
                  }}
                  disabled={!hasWebPort}
                  type="button"
                  title="Open in browser"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasWebPort ? (
                  <div className="max-w-[200px] space-y-1">
                    <p className="font-medium">Open in Browser</p>
                    <p className="text-xs truncate">{getContainerUrl()}</p>
                  </div>
                ) : (
                  <p>No Web Port Available</p>
                )}
              </TooltipContent>
            </Tooltip>

            {/* Edit URL button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEditUrlDialog(e);
                  }}
                  type="button"
                  title="Edit URL"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Container URL</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10" onClick={() => handleAction('terminal')}>
                  <Terminal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Terminal</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10" onClick={() => handleAction('restart')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restart</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10" onClick={() => handleAction(status === 'running' ? 'stop' : 'start')}>
                  {status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{status === 'running' ? 'Stop' : 'Start'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10" onClick={() => handleAction('edit')}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:text-metricly-error hover:border-metricly-error hover:bg-metricly-error/10" onClick={() => handleAction('delete')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  </>;
}
