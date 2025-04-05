import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList,
  TabsTrigger 
} from "../components/ui/tabs";
import { 
  Activity,
  Box, 
  Server as ServerIcon
} from "lucide-react";
import { SystemOverview } from '@/components/SystemOverview';
import { ContainerOverview } from '@/components/ContainerOverview';
import type { Server } from '@/components/SwitchServerDialog';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [activeServer, setActiveServer] = useState<Server>({
    id: "1", 
    name: "Production Server", 
    address: "192.168.1.100",
    isActive: true
  });
  
  // Listen for server switch events
  useState(() => {
    const handleServerSwitch = (e: CustomEvent) => {
      setActiveServer(e.detail);
    };
    
    document.addEventListener('server-switched', handleServerSwitch as EventListener);
    
    return () => {
      document.removeEventListener('server-switched', handleServerSwitch as EventListener);
    };
  });
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-muted-foreground flex items-center">
          <ServerIcon className="w-4 h-4 mr-1" />
          <span>Server: {activeServer?.name || "localhost"}</span>
        </div>
      </div>
      
      <Tabs defaultValue="system" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-metricly-secondary">
          <TabsTrigger value="system" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="containers" className="flex items-center">
            <Box className="h-4 w-4 mr-2" />
            Containers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="space-y-4 animate-fade-in">
          <SystemOverview />
        </TabsContent>
        <TabsContent value="containers" className="space-y-4 animate-fade-in">
          <ContainerOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
