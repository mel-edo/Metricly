import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { ServerIcon, Check } from "lucide-react";

export interface Server {
  id: string;
  name: string;
  address: string;
  isActive?: boolean;
}

interface SwitchServerDialogProps {
  activeServer: Server | null;
  onServerSwitch: (server: Server) => void;
}

export function SwitchServerDialog({ activeServer, onServerSwitch }: SwitchServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [servers, setServers] = useState<Server[]>([
    { id: "1", name: "Production Server", address: "192.168.1.100", isActive: true },
    { id: "2", name: "Staging Server", address: "192.168.1.101" },
    { id: "3", name: "Development Server", address: "192.168.1.102" },
    { id: "4", name: "Test Server", address: "192.168.1.103" },
  ]);

  useEffect(() => {
    // Update active server in the list when it changes
    if (activeServer) {
      setServers(prev =>
        prev.map(server => ({
          ...server,
          isActive: server.id === activeServer.id
        }))
      );
    }

    // Listen for the custom event to open the dialog
    const handleOpenDialog = () => setIsOpen(true);
    document.addEventListener('open-switch-server-dialog', handleOpenDialog);

    return () => {
      document.removeEventListener('open-switch-server-dialog', handleOpenDialog);
    };
  }, [activeServer]);

  const handleServerSelect = (server: Server) => {
    onServerSwitch(server);
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
          <DialogDescription>
            Select a server to connect to from the list below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`p-3 rounded-md flex items-center justify-between cursor-pointer transition-colors ${server.isActive
                ? 'bg-metricly-accent/10 border border-metricly-accent/30'
                : 'bg-metricly-background hover:bg-metricly-background/80 border border-transparent'}`}
              onClick={() => !server.isActive && handleServerSelect(server)}
            >
              <div className="flex items-center gap-3">
                <ServerIcon className={`w-5 h-5 ${server.isActive ? 'text-metricly-accent' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`font-medium ${server.isActive ? 'text-metricly-accent' : ''}`}>{server.name}</p>
                  <p className="text-xs text-muted-foreground">{server.address}</p>
                </div>
              </div>
              {server.isActive && (
                <div className="bg-metricly-accent/20 p-1 rounded-full">
                  <Check className="w-4 h-4 text-metricly-accent" />
                </div>
              )}
            </div>
          ))}
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
