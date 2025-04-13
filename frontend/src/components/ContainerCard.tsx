import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ProgressBar } from "./ProgressBar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Terminal, RefreshCw, Play, Pause, Trash2, CheckCircle, AlertTriangle, XCircle, AlertCircle, ExternalLink, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { getContainerLogs, containerAction } from "../services/containers";
import { useServer } from "../contexts/ServerContext";
interface ContainerCardProps {
  id: string;
  name: string;
  status: "running" | "stopped" | "paused" | "error" | "exited";
  cpu: {
    usage: number;
    limit?: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  image: string;
  uptime: string;
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
  uptime,
  ports,
  onAction
}: ContainerCardProps) {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // State for URL editing dialog
  const [isEditUrlDialogOpen, setIsEditUrlDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  // State for terminal dialog
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [logs, setLogs] = useState<string>("");
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // References for logs container and interval
  const logsContainerRef = useRef<HTMLPreElement>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    stopped: "bg-metricly-error text-white",
    paused: "bg-metricly-warning text-metricly-background",
    error: "bg-metricly-error text-white",
    exited: "bg-metricly-error text-white"
  };

  // Normalize status for display
  const displayStatus = status === 'exited' ? 'stopped' : status;
  // Handle container actions
  const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (onAction) {
      // Use the parent component's handler if provided
      onAction(action, id);
    } else {
      // Otherwise handle the action directly
      if (action === 'delete') {
        // Delete is not implemented directly here
        console.log(`Delete action on container ${name} not implemented directly`);
        return;
      }

      try {
        // Show loading toast
        toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing container...`);

        // Call the API to perform the action
        const result = await containerAction(name, action, serverIp);

        // Show success toast
        toast.success(result.message || `Container ${action}ed successfully`);
      } catch (error) {
        // Show error toast
        toast.error(`Failed to ${action} container: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Error ${action}ing container:`, error);
      }
    }
  };

  // Check if the container has web ports
  const hasWebPort = getContainerUrl() !== null;
  return <>
    {/* Terminal Dialog */}
    <Dialog open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Terminal className="mr-2 h-4 w-4" />
            {name} logs
          </DialogTitle>
          <DialogDescription>
            Container logs for {name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden min-h-[300px] flex flex-col">
          {isLoadingLogs ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-metricly-accent/50 border-t-metricly-accent rounded-full"></div>
            </div>
          ) : logsError ? (
            <div className="bg-metricly-error/10 border border-metricly-error/30 rounded-md p-4 text-center h-full flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 text-metricly-error mb-2" />
              <p className="text-metricly-error font-medium">Error loading logs</p>
              <p className="text-sm text-metricly-error/80 mt-1">{logsError}</p>
            </div>
          ) : (
            <pre
              ref={logsContainerRef}
              className="bg-metricly-background/80 border border-metricly-secondary/30 rounded-md p-4 text-xs font-mono overflow-auto h-full whitespace-pre-wrap scroll-smooth"
            >
              {logs || 'No logs available for this container'}
            </pre>
          )}
        </div>
        <DialogFooter className="mt-4">
          <div className="flex space-x-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => {
                // Clear auto-refresh interval when closing
                if (refreshIntervalRef.current !== null) {
                  clearInterval(refreshIntervalRef.current);
                  refreshIntervalRef.current = null;
                }
                setIsTerminalOpen(false);
                setLogs('');
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsLoadingLogs(true);
                setLogsError(null);

                // Refresh logs
                getContainerLogs(name, serverIp)
                  .then(response => {
                    setLogs(response.logs || 'No logs available');
                    // Schedule smooth scroll to bottom after state update and render
                    setTimeout(() => {
                      if (logsContainerRef.current) {
                        logsContainerRef.current.scrollTo({
                          top: logsContainerRef.current.scrollHeight,
                          behavior: 'smooth'
                        });
                      }
                    }, 50);
                  })
                  .catch(error => {
                    console.error('Error fetching logs:', error);
                    setLogsError(error instanceof Error ? error.message : 'Failed to fetch logs');
                  })
                  .finally(() => {
                    setIsLoadingLogs(false);
                  });
              }}
              disabled={isLoadingLogs}
            >
              {isLoadingLogs ? 'Refreshing...' : 'Refresh Logs'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
            {displayStatus}
          </Badge>
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-xs text-muted-foreground truncate max-w-[300px]">{image}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="mr-1">Uptime:</span>
            <span className="font-mono">{status === "running" ? uptime : "Not running"}</span>
          </div>
        </div>
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
            ) : status === "error" || status === "exited" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-red cursor-help">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Stopped</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Container is stopped</p>
                  <p>Start the container to resume services</p>
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

        {status === "running" ? (
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
        ) : (
          <div className="bg-metricly-background/30 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Resource usage metrics are not available while the container is stopped.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start the container to view CPU and memory usage.
            </p>
          </div>
        )}

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
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsTerminalOpen(true);
                    setIsLoadingLogs(true);
                    setLogsError(null);

                    // Fetch container logs
                    getContainerLogs(name, serverIp)
                      .then(response => {
                        setLogs(response.logs || 'No logs available');
                        // Schedule smooth scroll to bottom after state update and render
                        setTimeout(() => {
                          if (logsContainerRef.current) {
                            logsContainerRef.current.scrollTo({
                              top: logsContainerRef.current.scrollHeight,
                              behavior: 'smooth'
                            });
                          }
                        }, 50);

                        // Start auto-refresh interval
                        const interval = setInterval(() => {
                          if (!document.hidden) { // Only refresh if page is visible
                            getContainerLogs(name, serverIp)
                              .then(response => {
                                setLogs(response.logs || 'No logs available');
                                // Scroll to bottom if we're already near the bottom
                                if (logsContainerRef.current) {
                                  const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
                                  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                                  if (isNearBottom) {
                                    logsContainerRef.current.scrollTo({
                                      top: logsContainerRef.current.scrollHeight,
                                      behavior: 'smooth'
                                    });
                                  }
                                }
                              })
                              .catch(error => {
                                console.error('Error auto-refreshing logs:', error);
                              });
                          }
                        }, 3000); // Refresh every 3 seconds

                        // Store interval ID in ref
                        refreshIntervalRef.current = interval;
                      })
                      .catch(error => {
                        console.error('Error fetching logs:', error);
                        setLogsError(error instanceof Error ? error.message : 'Failed to fetch logs');
                      })
                      .finally(() => {
                        setIsLoadingLogs(false);
                      });
                  }}
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Logs</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleAction('restart');
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restart</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:text-metricly-accent hover:border-metricly-accent hover:bg-metricly-accent/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleAction(status === 'running' ? 'stop' : 'start');
                  }}
                >
                  {status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{status === 'running' ? 'Stop' : 'Start'}</p>
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
