import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ServerIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

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

  const handleAddServer = async () => {
    if (!serverAddress) {
      toast.error("Please enter a server address");
      return;
    }

    setIsVerifying(true);

    // Simulate server verification
    setTimeout(() => {
      setIsVerifying(false);

      // For demo purposes, only accept localhost or IP patterns
      const validServerPattern = /^(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;

      if (validServerPattern.test(serverAddress)) {
        toast.success(`Server ${serverAddress} connected successfully!`);
        setIsOpen(false);
        setServerAddress("");
      } else {
        toast.error(`Unable to connect to ${serverAddress}. Please check the address and try again.`);
      }
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <dialog id="add-server-dialog" className="modal" onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.currentTarget.close();
        }
      }} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="max-w-md w-full p-6 bg-metricly-secondary rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <DialogContent className="sm:max-w-[425px] p-0 bg-transparent border-none shadow-none">
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
                    className="bg-metricly-background border-metricly-secondary/80"
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
          </div>
        </div>
      </dialog>
    </Dialog>
  );
}
