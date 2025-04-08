import { useState, useEffect } from 'react';
import { ContainerCard } from './ContainerCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, FilterIcon, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useServer } from '../contexts/ServerContext';
import { getContainers, containerAction } from '../services/containers';
import { useQuery } from '@tanstack/react-query';

interface Container {
  id: string;
  name: string;
  status: "running" | "stopped" | "paused" | "error";
  cpu: {
    usage: number;
    limit?: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  image: string;
  ports?: {
    container: string;
    host: string;
  }[];
}

export function ContainerOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // Fetch containers
  const { data: containerData, isLoading, error, refetch } = useQuery({
    queryKey: ['containers', serverIp],
    queryFn: () => getContainers(serverIp),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Transform container data to our format
  const containers: Container[] = containerData ? containerData.map(container => {
    // Parse memory values
    const parseMemory = (memStr: string) => {
      try {
        const [value, unit] = memStr.split(' ');
        const numValue = parseFloat(value);

        if (unit === 'B') return numValue;
        if (unit === 'KB') return numValue * 1024;
        if (unit === 'MB') return numValue * 1024 * 1024;
        if (unit === 'GB') return numValue * 1024 * 1024 * 1024;
        if (unit === 'TB') return numValue * 1024 * 1024 * 1024 * 1024;
        return 0;
      } catch (e) {
        return 0;
      }
    };

    // Parse ports
    const parsePorts = () => {
      const result: { container: string; host: string }[] = [];

      if (!container.ports) return result;

      Object.entries(container.ports).forEach(([containerPort, hostPorts]) => {
        if (hostPorts && hostPorts.length > 0) {
          const hostPortsStr = hostPorts.map(p => p.HostPort).join(', ');
          result.push({
            container: containerPort,
            host: hostPortsStr
          });
        }
      });

      return result;
    };

    return {
      id: container.id,
      name: container.name,
      status: container.status as "running" | "stopped" | "paused" | "error",
      cpu: {
        usage: container.cpu_percent
      },
      memory: {
        usage: parseMemory(container.memory_usage),
        limit: parseMemory(container.memory_limit)
      },
      image: container.image,
      ports: parsePorts()
    };
  }) : [];

  const handleContainerAction = async (action: string, id: string) => {
    const container = containers.find(c => c.id === id);

    if (!container) return;

    // Only handle supported actions
    if (!['start', 'stop', 'restart'].includes(action)) {
      toast({
        title: "Unsupported Action",
        description: `Action '${action}' is not supported yet.`
      });
      return;
    }

    try {
      toast({
        title: "Container Action",
        description: `${action.charAt(0).toUpperCase() + action.slice(1)}ing container: ${container.name}...`
      });

      // Call the API to perform the action
      await containerAction(
        container.name,
        action as 'start' | 'stop' | 'restart',
        serverIp
      );

      toast({
        title: "Success",
        description: `Container ${container.name} ${action}ed successfully.`
      });

      // Refresh the container list
      refetch();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : `Failed to ${action} container.`,
        variant: "destructive"
      });
    }
  };

  const filteredContainers = containers.filter(container =>
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.image.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search containers..."
            className="pl-8 bg-metricly-secondary border-metricly-secondary text-text placeholder:text-subtext0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-metricly-secondary rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading containers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">Error loading containers</p>
          <p className="text-sm text-red-400 mt-2">
            {error instanceof Error ? error.message : 'Failed to fetch containers'}
          </p>
        </div>
      ) : filteredContainers.length === 0 ? (
        <div className="bg-metricly-secondary rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No containers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContainers.map(container => (
            <ContainerCard
              key={container.id}
              id={container.id}
              name={container.name}
              status={container.status}
              cpu={container.cpu}
              memory={container.memory}
              image={container.image}
              ports={container.ports}
              onAction={handleContainerAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
