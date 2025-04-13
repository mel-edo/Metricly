import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContainerOverview } from "@/components/ContainerOverview";
import { ContainerVolumes } from "@/components/ContainerVolumes";
import { useServer } from "@/contexts/ServerContext";
import { Box, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { ContainerMetricsChart } from "@/components/metrics/ContainerMetricsChart";
import { getContainers, getContainerMetricsHistory } from "@/services/containers";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Format container metrics data for the chart
const formatMetricsData = (metricsData: Record<string, any[]>, containerId: string, containerOptions: ComboboxOption[]) => {
  // Find the container name from the ID
  const containerName = containerOptions.find(option => option.value === containerId)?.label;

  if (!containerName || !metricsData || !metricsData[containerName] || !metricsData[containerName].length) {
    return [];
  }

  return metricsData[containerName].map(metric => ({
    time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: metric.cpu_percent || 0,
    memory: metric.memory_used && metric.memory_limit ?
      (metric.memory_used / metric.memory_limit) * 100 : 0,
  }));
};

const ContainersPage = () => {
  // Default to overview tab
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [containerOptions, setContainerOptions] = useState<ComboboxOption[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1h');

  const { activeServer } = useServer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // Fetch containers
  const { data: containerData, isLoading: isLoadingContainers } = useQuery({
    queryKey: ['containers', serverIp],
    queryFn: () => getContainers(serverIp),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch container metrics
  const { data: metricsData, isLoading: isLoadingMetrics, error: metricsError } = useQuery({
    queryKey: ['containerMetrics', serverIp, selectedContainer, timeRange],
    queryFn: async () => {
      const data = await getContainerMetricsHistory(serverIp, timeRange);
      return data;
    },
    enabled: !!selectedContainer,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Log any errors
  useEffect(() => {
    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }
  }, [metricsError]);

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
      }
    }
  }, [containerData, selectedContainer]);

  // Handle container selection change
  const handleContainerChange = (containerId: string) => {
    setSelectedContainer(containerId);
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
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
    stopped: containerData?.filter(c => c.status !== 'running').length || 0
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <TabsTrigger value="volumes" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                Volumes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ContainerOverview />
            </TabsContent>

            <TabsContent value="volumes">
              <ContainerVolumes />
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

            {isLoadingContainers || isLoadingMetrics ? (
              <div className="bg-metricly-secondary/30 rounded-lg p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-metricly-accent/50 border-t-metricly-accent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading container metrics...</p>
              </div>
            ) : metricsError ? (
              <div className="bg-metricly-secondary/30 rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-metricly-error mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Metrics</h3>
                <p className="text-muted-foreground mb-4">
                  {metricsError instanceof Error ? metricsError.message : 'Failed to load container metrics'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['containerMetrics'] });
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : selectedContainer ? (
              <ContainerMetricsChart
                data={formatMetricsData(metricsData || {}, selectedContainer, containerOptions)}
                containerName={containerOptions.find(option => option.value === selectedContainer)?.label || ''}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
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
