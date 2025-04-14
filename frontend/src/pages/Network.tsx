import { Network, ArrowDownFromLine, ArrowUpToLine, AlertTriangle, RefreshCw } from "lucide-react";
import { CoolSpinner } from "../components/ui/cool-spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useNetworkInterfaces, useContainerTraffic, useContainers } from '../services/network';
import { Combobox, ComboboxOption } from "../components/ui/combobox";
import { useState, useEffect } from 'react';

// Custom tooltip for the network chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-metricly-background border border-metricly-secondary p-3 rounded-md shadow-md">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center text-xs">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-2">{entry.name}:</span>
            <span className="font-medium">{entry.value} MB/s</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const NetworkInterfaceCard = ({ interface: netInterface }: { interface: any }) => {
  const isActive = netInterface.status === 'active';

  return (
    <Card className="flex flex-col h-full">
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
      <CardContent className="pb-4 flex-grow">
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
      <CardFooter className="text-xs text-muted-foreground pt-3 mt-auto border-t border-border">
        Total: {netInterface.downloadTotal} received, {netInterface.uploadTotal} sent
      </CardFooter>
    </Card>
  );
};



const NetworkPage = () => {
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [containerOptions, setContainerOptions] = useState<ComboboxOption[]>([]);

  // Fetch containers for the dropdown
  const { data: containerData } = useContainers();

  // Fetch network interfaces (doesn't depend on selected container)
  const {
    data: interfaces,
    isLoading: isLoadingInterfaces,
    error: interfacesError,
    refetch: refetchInterfaces
  } = useNetworkInterfaces();

  // Fetch traffic data based on selected container
  const {
    data: trafficData,
    isLoading: isLoadingTraffic,
    error: trafficError,
    refetch: refetchTraffic
  } = useContainerTraffic(selectedContainer);

  // Update container options when container data changes
  useEffect(() => {
    if (containerData && containerData.length > 0) {
      const options = [
        { value: '', label: 'All Containers' },
        ...containerData.map((container: any) => ({
          value: container.id,
          label: container.name
        }))
      ];
      setContainerOptions(options);
    }
  }, [containerData]);

  // Handle container selection change
  const handleContainerChange = (containerId: string) => {
    setSelectedContainer(containerId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center">
          <Network className="mr-2" size={20} />
          Network
        </h1>
        <Button
          onClick={() => {
            refetchInterfaces();
            refetchTraffic();
          }}
          variant="outline"
          disabled={isLoadingInterfaces || isLoadingTraffic}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingInterfaces || isLoadingTraffic ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Interfaces</CardTitle>
            <CardDescription>Active network interfaces and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInterfaces ? (
              <div className="h-[280px] flex items-center justify-center">
                <CoolSpinner size="lg" text="Loading network interfaces..." variant="accent" />
              </div>
            ) : interfacesError ? (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-metricly-error mx-auto mb-2" />
                  <p className="text-metricly-error">Failed to load network interfaces</p>
                  <Button variant="outline" className="mt-4" onClick={() => refetchInterfaces()}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : interfaces?.length === 0 ? (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center text-muted-foreground">
                  <Network className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No network interfaces found</p>
                </div>
              </div>
            ) : (
              <div className="h-[280px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                  {interfaces?.map((netInterface) => (
                    <NetworkInterfaceCard key={netInterface.id} interface={netInterface} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Current network activity</CardDescription>
              </div>
              <div className="w-64">
                <Combobox
                  options={containerOptions}
                  value={selectedContainer}
                  onChange={handleContainerChange}
                  placeholder={selectedContainer === '' ? 'All Containers' : 'Select a container'}
                  className="w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTraffic ? (
              <div className="h-72 flex items-center justify-center">
                <CoolSpinner size="lg" text="Loading network traffic data..." variant="accent" />
              </div>
            ) : trafficError ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-metricly-error mx-auto mb-2" />
                  <p className="text-metricly-error">Failed to load network data</p>
                  <Button variant="outline" className="mt-4" onClick={() => refetchTraffic()}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trafficData || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkPage;
