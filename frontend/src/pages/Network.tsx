import React from 'react';
import { Network, ArrowDownFromLine, ArrowUpToLine, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
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

const NetworkPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center">
          <Network className="mr-2" size={20} />
          Network
        </h1>
      </div>
      
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
      
      <h2 className="text-xl font-medium mt-6">Network Interfaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {networkInterfaces.map((netInterface) => (
          <NetworkInterfaceCard key={netInterface.id} interface={netInterface} />
        ))}
      </div>
    </div>
  );
};

export default NetworkPage;
