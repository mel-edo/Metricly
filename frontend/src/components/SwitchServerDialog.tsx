import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { ServerIcon, Check, AlertCircle } from "lucide-react";
import { useServer } from "../contexts/ServerContext";
import { ServerInfo } from "../services/servers";

export function SwitchServerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { servers, activeServer, setActiveServer, loading, error } = useServer();

  useEffect(() => {
    // Listen for the custom event to open the dialog
    const handleOpenDialog = () => setIsOpen(true);
    document.addEventListener('open-switch-server-dialog', handleOpenDialog);

    return () => {
      document.removeEventListener('open-switch-server-dialog', handleOpenDialog);
    };
  }, []);

  // Auto-select the first server as soon as servers are available
  useEffect(() => {
    if (!loading && !error && servers.length > 0 && !activeServer) {
      // Automatically select the first server if none is currently selected
      setActiveServer(servers[0]);
    }
  }, [loading, servers, activeServer, setActiveServer, error]);

  const handleServerSelect = (server: ServerInfo) => {
    setActiveServer(server);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-metricly-secondary border-metricly-secondary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ServerIcon className="w-5 h-5 text-metricly-accent" />
            Switch Server
          </DialogTitle>
          <DialogDescription className="text-subtext0">
            Select a server to connect to from the list below.
            {!loading && !error && servers.length > 0 && (
              <div className="mt-1 text-text">
                Total Servers: <span className="font-medium">{servers.length}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="p-3 rounded-md bg-metricly-background flex items-center justify-center">
              <p className="text-muted-foreground">Loading servers...</p>
            </div>
          ) : error ? (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : servers.length === 0 ? (
            <div className="p-3 rounded-md bg-metricly-background flex items-center justify-center">
              <p className="text-muted-foreground">No servers available</p>
            </div>
          ) : (
            servers.map((server) => (
              <div
                key={server.ip_address}
                className={`p-3 rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                  activeServer && server.ip_address === activeServer.ip_address
                    ? 'bg-metricly-accent/10 border border-metricly-accent/30'
                    : 'bg-metricly-background hover:bg-metricly-background/80 border border-transparent'
                }`}
                onClick={() => handleServerSelect(server)}
              >
                <div className="flex items-center gap-3">
                  <ServerIcon
                    className={`w-5 h-5 ${
                      activeServer && server.ip_address === activeServer.ip_address
                        ? 'text-metricly-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <div>
                    <p className={`font-medium ${
                      activeServer && server.ip_address === activeServer.ip_address
                        ? 'text-metricly-accent'
                        : ''
                    }`}>
                      {server.name || (server.ip_address === '127.0.0.1' ? 'Localhost' : `Server ${server.ip_address}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">{server.ip_address}</p>
                  </div>
                </div>
                {activeServer && server.ip_address === activeServer.ip_address && (
                  <div className="bg-metricly-accent/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-metricly-accent" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
