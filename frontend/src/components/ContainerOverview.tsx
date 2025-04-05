import { useState } from 'react';
import { ContainerCard } from './ContainerCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, FilterIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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

  // Sample data
  const containers: Container[] = [
    {
      id: "1",
      name: "qbittorrent",
      status: "running",
      cpu: {
        usage: 0.01
      },
      memory: {
        usage: 11.83 * 1024 * 1024,
        limit: 9.66 * 1024 * 1024 * 1024
      },
      image: "lscr.io/linuxserver/qbittorrent:latest",
      ports: [
        { container: "6881/tcp", host: "6881, 6881" },
        { container: "6881/udp", host: "6881, 6881" },
        { container: "8090/tcp", host: "8090, 8090" }
      ]
    },
    {
      id: "2",
      name: "speedtest-tracker",
      status: "running",
      cpu: {
        usage: 0
      },
      memory: {
        usage: 1.8 * 1024 * 1024,
        limit: 9.66 * 1024 * 1024 * 1024
      },
      image: "lscr.io/linuxserver/speedtest-tracker:latest",
      ports: [
        { container: "80/tcp", host: "80, 80" }
      ]
    },
    {
      id: "3",
      name: "jellyfin",
      status: "running",
      cpu: {
        usage: 0.01
      },
      memory: {
        usage: 142.96 * 1024 * 1024,
        limit: 9.66 * 1024 * 1024 * 1024
      },
      image: "lscr.io/linuxserver/jellyfin:latest",
      ports: [
        { container: "1900/udp", host: "1900, 1900" },
        { container: "7359/udp", host: "7359, 7359" },
        { container: "8096/tcp", host: "8096, 8096" },
        { container: "8920/tcp", host: "8920, 8920" }
      ]
    }
  ];

  const handleContainerAction = (action: string, id: string) => {
    const container = containers.find(c => c.id === id);

    if (!container) return;

    let message = '';

    switch (action) {
      case 'start':
        message = `Starting container: ${container.name}`;
        break;
      case 'stop':
        message = `Stopping container: ${container.name}`;
        break;
      case 'restart':
        message = `Restarting container: ${container.name}`;
        break;
      case 'delete':
        message = `Deleting container: ${container.name}`;
        break;
      default:
        message = `${action.charAt(0).toUpperCase() + action.slice(1)} container: ${container.name}`;
    }

    toast({
      title: "Container Action",
      description: message
    });
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
            className="pl-8 bg-metricly-secondary border-metricly-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      {filteredContainers.length === 0 ? (
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
