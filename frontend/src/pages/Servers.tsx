import React from 'react';
import {
  Server,
  RefreshCw,
  CirclePlus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Terminal,
  Settings,
  BadgeAlert,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';

// Server interface
interface ServerProps {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  ip: string;
  location: string;
  type: string;
  uptime: string;
}

const servers: ServerProps[] = [
  { id: '1', name: 'prod-api-01', status: 'online', ip: '192.168.1.100', location: 'us-east-1', type: 'API Server', uptime: '45 days' },
  { id: '2', name: 'prod-db-01', status: 'online', ip: '192.168.1.101', location: 'us-east-1', type: 'Database', uptime: '45 days' },
  { id: '3', name: 'staging-api-01', status: 'warning', ip: '192.168.2.100', location: 'us-west-1', type: 'API Server', uptime: '12 days' },
  { id: '4', name: 'staging-db-01', status: 'online', ip: '192.168.2.101', location: 'us-west-1', type: 'Database', uptime: '12 days' },
  { id: '5', name: 'dev-api-01', status: 'offline', ip: '192.168.3.100', location: 'eu-west-1', type: 'API Server', uptime: '0' },
  { id: '6', name: 'dev-db-01', status: 'online', ip: '192.168.3.101', location: 'eu-west-1', type: 'Database', uptime: '3 days' },
  { id: '7', name: 'monitoring-01', status: 'online', ip: '192.168.0.10', location: 'us-east-1', type: 'Monitoring', uptime: '60 days' },
];

// Status component
const ServerStatus = ({ status }: { status: ServerProps['status'] }) => {
  const statusConfig = {
    online: { icon: CheckCircle2, color: 'text-metricly-success', bg: 'bg-metricly-success/10' },
    warning: { icon: BadgeAlert, color: 'text-metricly-warning', bg: 'bg-metricly-warning/10' },
    offline: { icon: Trash2, color: 'text-metricly-error', bg: 'bg-metricly-error/10' },
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

const ServersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter servers based on searchTerm
  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ip.includes(searchTerm) ||
    server.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'online').length,
    warning: servers.filter(s => s.status === 'warning').length,
    offline: servers.filter(s => s.status === 'offline').length,
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshed server list",
      description: `${servers.length} servers refreshed`,
    });
  };

  const handleOpenAddServerDialog = () => {
    // Use the component directly
    document.dispatchEvent(new CustomEvent('open-add-server-dialog'));

    toast({
      title: "Add server",
      description: "Please enter server details",
    });
  };

  return (
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
            <CardTitle className="text-base flex justify-between">
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

      {/* Servers Table */}
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
              className="pl-8"
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
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uptime</TableHead>
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
                  <TableCell>{server.location}</TableCell>
                  <TableCell>{server.type}</TableCell>
                  <TableCell>{server.uptime}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Terminal className="mr-2 h-4 w-4" />
                          <span>Terminal</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-metricly-error">
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
    </div>
  );
};

export default ServersPage;
