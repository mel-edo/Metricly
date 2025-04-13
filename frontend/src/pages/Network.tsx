import React, { useState } from 'react';
import { Network, ArrowDownFromLine, ArrowUpToLine, AlertTriangle, Cable, Wifi, ExternalLink, Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Button } from "../components/ui/button";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer } from 'recharts';

const generateNetworkData = () => {
  const data = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      download: Math.floor(Math.random() * 10) + 2,
      upload: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
};

const networkData = generateNetworkData();

const networkInterfaces = [
  {
    id: '1',
    name: 'eth0',
    ip: '192.168.1.100',
    status: 'active',
    downloadSpeed: '8.45 MB/s',
    uploadSpeed: '2.12 MB/s',
    downloadTotal: '1.2 GB',
    uploadTotal: '450 MB',
  },
  {
    id: '2',
    name: 'docker0',
    ip: '172.17.0.1',
    status: 'active',
    downloadSpeed: '1.25 MB/s',
    uploadSpeed: '0.87 MB/s',
    downloadTotal: '345 MB',
    uploadTotal: '120 MB',
  },
  {
    id: '3',
    name: 'wlan0',
    ip: '10.0.0.15',
    status: 'inactive',
    downloadSpeed: '0 MB/s',
    uploadSpeed: '0 MB/s',
    downloadTotal: '0 MB',
    uploadTotal: '0 MB',
  },
];

const NetworkInterfaceCard = ({ interface: netInterface }: { interface: typeof networkInterfaces[0] }) => {
  const isActive = netInterface.status === 'active';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{netInterface.name}</CardTitle>
            <CardDescription>{netInterface.ip}</CardDescription>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full flex items-center ${isActive ? 'bg-metricly-success/20 text-metricly-success' : 'bg-metricly-error/20 text-metricly-error'}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-metricly-success' : 'bg-metricly-error'}`}></span>
            {netInterface.status}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <ArrowDownFromLine size={16} className="mr-2 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-muted-foreground">Download</span>
                <span className="font-medium">{netInterface.downloadSpeed}</span>
              </div>
            </div>
            <div className="flex items-center">
              <ArrowUpToLine size={16} className="mr-2 text-green-400" />
              <div className="flex flex-col">
                <span className="text-muted-foreground">Upload</span>
                <span className="font-medium">{netInterface.uploadSpeed}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground text-sm">
            <AlertTriangle size={16} className="mr-2 text-metricly-warning" />
            Interface is not active
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-2 border-t border-border">
        Total: {netInterface.downloadTotal} received, {netInterface.uploadTotal} sent
      </CardFooter>
    </Card>
  );
};

// Connection types and data
interface ConnectionProps {
  id: string;
  source: string;
  destination: string;
  protocol: string;
  port: number;
  status: 'established' | 'listening' | 'blocked';
  bytes: string;
}

const connections: ConnectionProps[] = [
  { id: '1', source: '192.168.1.100', destination: '54.231.224.14', protocol: 'TCP', port: 443, status: 'established', bytes: '1.27 MB' },
  { id: '2', source: '192.168.1.100', destination: '35.174.127.31', protocol: 'TCP', port: 80, status: 'established', bytes: '256 KB' },
  { id: '3', source: '192.168.1.100', destination: '192.168.1.1', protocol: 'UDP', port: 53, status: 'established', bytes: '64 KB' },
  { id: '4', source: '127.0.0.1', destination: '127.0.0.1', protocol: 'TCP', port: 8080, status: 'listening', bytes: '0' },
  { id: '5', source: '192.168.1.100', destination: '10.0.0.25', protocol: 'TCP', port: 22, status: 'blocked', bytes: '0' },
  { id: '6', source: '192.168.1.100', destination: '172.17.0.2', protocol: 'TCP', port: 3306, status: 'established', bytes: '532 KB' },
  { id: '7', source: '0.0.0.0', destination: '*', protocol: 'TCP', port: 443, status: 'listening', bytes: '0' },
];

const ConnectionStatus = ({ status }: { status: ConnectionProps['status'] }) => {
  const statusMap = {
    established: { icon: Network, color: 'text-green', bg: 'bg-green/10' },
    listening: { icon: Wifi, color: 'text-blue', bg: 'bg-blue/10' },
    blocked: { icon: Ban, color: 'text-red', bg: 'bg-red/10' },
  };

  const { icon: Icon, color, bg } = statusMap[status];

  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <div className={`p-1 rounded ${bg}`}>
        <Icon size={14} />
      </div>
      <span className="capitalize">{status}</span>
    </div>
  );
};

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('traffic');

  const connectionStats = {
    total: connections.length,
    established: connections.filter(c => c.status === 'established').length,
    listening: connections.filter(c => c.status === 'listening').length,
    blocked: connections.filter(c => c.status === 'blocked').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center">
          <Network className="mr-2" size={20} />
          Network
        </h1>
        {activeTab === 'connections' && (
          <Button
            onClick={() => {}}
            variant="outline"
          >
            Refresh
          </Button>
        )}
      </div>

      <Tabs defaultValue="traffic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-metricly-secondary">
          <TabsTrigger value="traffic" className="flex items-center">
            <ArrowUpToLine className="h-4 w-4 mr-2" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="interfaces" className="flex items-center">
            <Network className="h-4 w-4 mr-2" />
            Interfaces
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center">
            <Cable className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-6">

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>Current network activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e2e',
                    borderColor: '#333',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value} MB/s`]}
                />
                <Area
                  type="monotone"
                  dataKey="download"
                  stackId="1"
                  stroke="#60a5fa"
                  fill="rgba(96, 165, 250, 0.2)"
                  name="Download"
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  stackId="2"
                  stroke="#4ade80"
                  fill="rgba(74, 222, 128, 0.2)"
                  name="Upload"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="interfaces" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {networkInterfaces.map((netInterface) => (
              <NetworkInterfaceCard key={netInterface.id} interface={netInterface} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between">
                  <span>Total Connections</span>
                  <span>{connectionStats.total}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between text-green">
                  <span>Established</span>
                  <span>{connectionStats.established}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between text-blue">
                  <span>Listening</span>
                  <span>{connectionStats.listening}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex justify-between text-red">
                  <span>Blocked</span>
                  <span>{connectionStats.blocked}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Transfer</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>{connection.source}</TableCell>
                      <TableCell>{connection.destination}</TableCell>
                      <TableCell>{connection.protocol}</TableCell>
                      <TableCell>{connection.port}</TableCell>
                      <TableCell>
                        <ConnectionStatus status={connection.status} />
                      </TableCell>
                      <TableCell>{connection.bytes}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkPage;
