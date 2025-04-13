import { useState } from 'react';
import {
  Server,
  RefreshCw,
  CirclePlus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  BadgeAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useServer } from '../contexts/ServerContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { deleteServer } from '../services/servers';

// Server interface
interface ServerProps {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  ip: string;
  location?: string;
  type?: string;
  uptime?: string;
}

// Status component
const ServerStatus = ({ status }: { status: ServerProps['status'] }) => {
  const statusConfig = {
    online: { icon: CheckCircle2, color: 'text-metricly-success', bg: 'bg-metricly-success/10' },
    warning: { icon: BadgeAlert, color: 'text-metricly-warning', bg: 'bg-metricly-warning/10' },
    offline: { icon: AlertCircle, color: 'text-metricly-error', bg: 'bg-metricly-error/10' },
  };

  const { icon: Icon, color, bg } = statusConfig[status];

  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <div className={`p-1 rounded ${bg}`}>
        <Icon size={14} />
      </div>
      <span className="capitalize">{status}</span>
    </div>
  );
};

// Edit Server Dialog Component
interface EditServerDialogProps {
  server: ServerProps;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serverId: string, newName: string) => void;
}

const EditServerDialog = ({ server, isOpen, onClose, onSave }: EditServerDialogProps) => {
  const [serverName, setServerName] = useState(server?.name || '');

  const handleSave = () => {
    onSave(server.id, serverName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="w-5 h-5 text-metricly-accent" />
            Edit Server
          </DialogTitle>
          <DialogDescription>
            Update the server details
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="server-name" className="text-sm font-medium">
              Server Name
            </label>
            <Input
              id="server-name"
              placeholder="My Server"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="bg-metricly-background border-metricly-secondary/80 text-text placeholder:text-subtext0"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              IP Address
            </label>
            <div className="p-2 bg-metricly-secondary/30 rounded text-sm text-muted-foreground">
              {server?.ip} <span className="text-xs">(cannot be changed)</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 via-metricly-accent to-purple-500 text-metricly-background hover:opacity-90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Dialog Component
interface ConfirmDeleteDialogProps {
  server: ServerProps;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (serverId: string) => void;
}

const ConfirmDeleteDialog = ({ server, isOpen, onClose, onConfirm }: ConfirmDeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trash2 className="w-5 h-5 text-metricly-error" />
            Delete Server
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this server?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-metricly-error/10 border border-metricly-error/30 rounded-md">
            <p className="text-sm text-metricly-error">
              This action cannot be undone. This will permanently delete the server
              <strong> {server?.name} ({server?.ip})</strong> from your account.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(server.id)}
            variant="destructive"
          >
            Delete Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ServersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingServer, setEditingServer] = useState<ServerProps | null>(null);
  const [deletingServer, setDeletingServer] = useState<ServerProps | null>(null);
  const { servers: serverList, loading, error, refreshServers, updateServerName } = useServer();

  // Transform server data to our format
  const servers: ServerProps[] = serverList.map(server => ({
    id: server.ip_address,
    name: server.name || `Server ${server.ip_address}`,
    status: 'online', // We would need to implement status checking
    ip: server.ip_address,
    type: 'Server',
    uptime: 'Unknown' // We would need to implement uptime tracking
  }));

  // Filter servers based on searchTerm
  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ip.includes(searchTerm) ||
    (server.type && server.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats calculation
  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'online').length,
    warning: servers.filter(s => s.status === 'warning').length,
    offline: servers.filter(s => s.status === 'offline').length,
  };

  const handleRefresh = async () => {
    try {
      await refreshServers();
      toast({
        title: "Refreshed server list",
        description: `${servers.length} servers refreshed`,
      });
    } catch (err) {
      toast({
        title: "Error refreshing servers",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleOpenAddServerDialog = () => {
    // Use the component directly
    document.dispatchEvent(new CustomEvent('open-add-server-dialog'));

    toast({
      title: "Add server",
      description: "Please enter server details",
    });
  };

  // Handle edit server
  const handleEditServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setEditingServer(server);
    }
  };

  // Handle save edited server
  const handleSaveServer = async (serverId: string, newName: string) => {
    try {
      // In a real implementation, you would call an API to update the server name
      // For now, we'll just update it locally
      await updateServerName(serverId, newName);

      toast({
        title: "Server updated",
        description: `Server ${newName} updated successfully`,
      });

      // Refresh the server list
      await refreshServers();
    } catch (err) {
      toast({
        title: "Error updating server",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  // Handle delete server
  const handleDeleteServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setDeletingServer(server);
    }
  };

  // Handle confirm delete server
  const handleConfirmDelete = async (serverId: string) => {
    try {
      await deleteServer(serverId);

      toast({
        title: "Server deleted",
        description: `Server deleted successfully`,
      });

      // Refresh the server list
      await refreshServers();

      // Close the dialog
      setDeletingServer(null);
    } catch (err) {
      toast({
        title: "Error deleting server",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center">
            <Server className="mr-2" size={20} />
            Servers
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={handleOpenAddServerDialog}
            >
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </div>
        </div>

        {/* Server Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex justify-between text-text">
                <span>Total Servers</span>
                <span>{stats.total}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex justify-between text-metricly-success">
                <span>Online</span>
                <span>{stats.online}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex justify-between text-metricly-warning">
                <span>Warning</span>
                <span>{stats.warning}</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex justify-between text-metricly-error">
                <span>Offline</span>
                <span>{stats.offline}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin text-metricly-accent" />
                <p className="text-muted-foreground">Loading servers...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-metricly-error/50">
            <CardContent className="py-6">
              <div className="flex items-center space-x-2 text-metricly-error">
                <AlertCircle className="h-5 w-5" />
                <p>Error loading servers: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Servers Table */}
        {!loading && !error && servers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Server Inventory</CardTitle>
              <CardDescription>
                Manage and monitor your server infrastructure
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search servers..."
                  className="pl-8 text-text placeholder:text-subtext0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredServers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell>
                      <ServerStatus status={server.status} />
                    </TableCell>
                    <TableCell>{server.ip}</TableCell>
                    <TableCell>{server.type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditServer(server.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-metricly-error" onClick={() => handleDeleteServer(server.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}

        {!loading && !error && servers.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Server className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No servers found</p>
                <Button
                  variant="outline"
                  onClick={handleOpenAddServerDialog}
                  className="mt-2"
                >
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Add Server
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Server Dialog */}
      {editingServer && (
        <EditServerDialog
          server={editingServer}
          isOpen={!!editingServer}
          onClose={() => setEditingServer(null)}
          onSave={handleSaveServer}
        />
      )}
      
      {/* Confirm Delete Dialog */}
      {deletingServer && (
        <ConfirmDeleteDialog
          server={deletingServer}
          isOpen={!!deletingServer}
          onClose={() => setDeletingServer(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default ServersPage;
