import React from 'react';
import { Cable, Wifi, Network, ExternalLink, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Button } from "../components/ui/button";

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

const ConnectionsPage = () => {
  const stats = {
    total: connections.length,
    established: connections.filter(c => c.status === 'established').length,
    listening: connections.filter(c => c.status === 'listening').length,
    blocked: connections.filter(c => c.status === 'blocked').length,
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center">
          <Cable className="mr-2" size={20} />
          Network Connections
        </h1>
        <Button 
          onClick={() => {}}
          variant="outline"
        >
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between">
              <span>Total Connections</span>
              <span>{stats.total}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-green">
              <span>Established</span>
              <span>{stats.established}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-blue">
              <span>Listening</span>
              <span>{stats.listening}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-red">
              <span>Blocked</span>
              <span>{stats.blocked}</span>
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
    </div>
  );
};

export default ConnectionsPage;
