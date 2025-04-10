import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContainerOverview } from "@/components/ContainerOverview";
import { useServer } from "@/contexts/ServerContext";
import { Box, Server, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { ContainerMetricsChart } from "@/components/metrics/ContainerMetricsChart";
import { getContainers } from "@/services/containers";
import { useQuery } from "@tanstack/react-query";

// Generate mock data for the container metrics chart
const generateMockMetricsData = () => {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 1000 * 60 * 5);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40) + 10, // Random value between 10-50%
      memory: Math.floor(Math.random() * 30) + 20, // Random value between 20-50%
    });
  }

  return data;
};

const ContainersPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [containerOptions, setContainerOptions] = useState<ComboboxOption[]>([]);
  const [metricsData, setMetricsData] = useState<any[]>([]);

  const { activeServer } = useServer();
  const { toast } = useToast();

  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // Fetch containers
  const { data: containerData } = useQuery({
    queryKey: ['containers', serverIp],
    queryFn: () => getContainers(serverIp),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update container options when container data changes
  useEffect(() => {
    if (containerData && containerData.length > 0) {
      const options = containerData.map(container => ({
        value: container.id,
        label: container.name
      }));
      setContainerOptions(options);

      // Set the first container as selected by default if none is selected
      if (!selectedContainer && options.length > 0) {
        setSelectedContainer(options[0].value);
        setMetricsData(generateMockMetricsData());
      }
    }
  }, [containerData, selectedContainer]);

  // Handle container selection change
  const handleContainerChange = (containerId: string) => {
    console.log('Container selected:', containerId);
    setSelectedContainer(containerId);
    setMetricsData(generateMockMetricsData());
  };

  const handleCreateContainer = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Container creation will be available in a future update."
    });
  };

  // Get container counts
  const containerCounts = {
    total: containerData?.length || 0,
    running: containerData?.filter(c => c.status === 'running').length || 0,
    paused: containerData?.filter(c => c.status === 'paused').length || 0,
    stopped: containerData?.filter(c => c.status === 'stopped' || c.status === 'error').length || 0
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Containers</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Docker containers on {activeServer?.name || activeServer?.ip_address || 'localhost'}
          </p>
        </div>
        <Button onClick={handleCreateContainer} className="bg-gradient-to-r from-blue-500 via-metricly-accent to-purple-500 text-metricly-background hover:opacity-90">
          Create Container
        </Button>
      </div>

      {/* Container Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-text">
              <span>Total Containers</span>
              <span>{containerCounts.total}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-metricly-success">
              <span>Running</span>
              <span>{containerCounts.running}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-metricly-warning">
              <span>Paused</span>
              <span>{containerCounts.paused}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex justify-between text-metricly-error">
              <span>Stopped</span>
              <span>{containerCounts.stopped}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Container Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Container Management</CardTitle>
          <CardDescription>
            View and manage your Docker containers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-metricly-secondary mb-4">
              <TabsTrigger value="overview" className="flex items-center">
                <Box className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center">
                <Server className="mr-2 h-4 w-4" />
                Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ContainerOverview />
            </TabsContent>

            <TabsContent value="images">
              <div className="bg-metricly-secondary/30 rounded-lg p-8 text-center">
                <Server className="h-12 w-12 text-metricly-accent mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Docker Images</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your Docker images and pull new ones from registries
                </p>
                <div className="bg-metricly-background/50 p-4 rounded-md text-sm text-muted-foreground">
                  This feature will be available in a future update
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
          <CardDescription>
            Monitor resource usage for a specific container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-full">
                <Combobox
                  options={containerOptions}
                  value={selectedContainer}
                  onChange={handleContainerChange}
                  placeholder="Select a container"
                  className="w-full"
                />
              </div>
            </div>

            {selectedContainer ? (
              <ContainerMetricsChart
                data={metricsData}
                containerName={containerOptions.find(option => option.value === selectedContainer)?.label || ''}
              />
            ) : (
              <div className="bg-metricly-secondary/30 rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-metricly-accent mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Container Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a container from the dropdown to view its resource usage
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContainersPage;
