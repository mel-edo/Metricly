import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, FilterIcon, AlertCircle, Database, HardDrive } from 'lucide-react';

import { useServer } from '../contexts/ServerContext';
import { getContainers } from '../services/containers';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ContainerVolumes() {
  const [searchTerm, setSearchTerm] = useState('');
  // Get server context

  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // Fetch containers
  const { data: containerData, isLoading, error } = useQuery({
    queryKey: ['containers', serverIp],
    queryFn: () => getContainers(serverIp),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Filter containers with volumes
  const containersWithVolumes = containerData
    ? containerData.filter(container =>
        container.volumes && container.volumes.length > 0
      )
    : [];

  // Filter by search term
  const filteredContainers = containersWithVolumes.filter(container =>
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.volumes.some(volume =>
      volume.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volume.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search volumes..."
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
          <div className="animate-spin h-8 w-8 border-4 border-metricly-accent/50 border-t-metricly-accent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading volumes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">Error loading volumes</p>
          <p className="text-sm text-red-400 mt-2">
            {error instanceof Error ? error.message : 'Failed to fetch container volumes'}
          </p>
        </div>
      ) : filteredContainers.length === 0 ? (
        <div className="bg-metricly-secondary rounded-lg p-8 text-center">
          <Database className="h-12 w-12 text-metricly-accent/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Volumes Found</h3>
          <p className="text-muted-foreground mb-4">
            No containers with mounted volumes were found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContainers.map(container => (
            <Card key={container.id} className="bg-metricly-secondary border-white/5 h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm text-text flex items-center">
                    <Database className="mr-2 h-4 w-4 text-metricly-accent" />
                    {container.name}
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">{container.image}</p>
              </CardHeader>
              <CardContent className="pb-3 flex-1 overflow-auto">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium flex items-center">
                    <HardDrive className="h-3.5 w-3.5 text-metricly-accent mr-1.5" />
                    Mounted Volumes
                  </h4>
                  <div className="bg-metricly-background/30 rounded-md p-2 space-y-2 max-h-[200px] overflow-y-auto">
                    {container.volumes.map((volume, index) => (
                      <div key={index} className="border-b border-metricly-background/50 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{volume.type}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs">
                                  {volume.size || 'Unknown size'}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Volume size</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Source:</span>
                            <span className="text-xs font-mono bg-metricly-background/50 p-1 rounded truncate" title={volume.source}>
                              {volume.source}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Destination:</span>
                            <span className="text-xs font-mono bg-metricly-background/50 p-1 rounded truncate" title={volume.destination}>
                              {volume.destination}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
