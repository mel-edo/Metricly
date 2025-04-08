import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { ServerIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { addServer } from "../services/servers";
import { useServer } from "../contexts/ServerContext";

export function AddServerDialog() {
  const [serverAddress, setServerAddress] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Add event listener to open the dialog when the button is clicked
  useEffect(() => {
    const handleOpenDialog = () => setIsOpen(true);
    document.addEventListener('open-add-server-dialog', handleOpenDialog);
    return () => document.removeEventListener('open-add-server-dialog', handleOpenDialog);
  }, []);

  const { refreshServers } = useServer();

  const handleAddServer = async () => {
    if (!serverAddress) {
      toast.error("Please enter a server address");
      return;
    }

    // Validate server address format
    const validServerPattern = /^(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;
    if (!validServerPattern.test(serverAddress)) {
      toast.error(`Invalid server address format: ${serverAddress}`);
      return;
    }

    setIsVerifying(true);

    try {
      // Convert localhost to 127.0.0.1 for API
      const ipAddress = serverAddress.toLowerCase() === 'localhost' ? '127.0.0.1' : serverAddress;

      // Add the server
      await addServer(ipAddress);

      toast.success(`Server ${serverAddress} added successfully!`);
      setIsOpen(false);
      setServerAddress("");

      // Refresh the server list
      await refreshServers();
    } catch (error) {
      toast.error(`Failed to add server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ServerIcon className="w-5 h-5 text-metricly-accent" />
            Add New Server
          </DialogTitle>
          <DialogDescription>
            Enter the address of the server you want to monitor.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="server-address" className="text-sm font-medium">
              Server Address
            </label>
            <Input
              id="server-address"
              placeholder="localhost:9090 or 192.168.1.10"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              className="bg-metricly-background border-metricly-secondary/80 text-text placeholder:text-subtext0"
            />
            <p className="text-xs text-muted-foreground">
              Enter hostname or IP address with optional port
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddServer}
            disabled={isVerifying}
            className="bg-gradient-to-r from-blue-500 via-metricly-accent to-purple-500 text-metricly-background hover:opacity-90"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Add Server"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
