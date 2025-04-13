import { publicRequest } from './api';
import { useQuery } from '@tanstack/react-query';
import { useServer } from '../contexts/ServerContext';

export interface NetworkInterface {
  id: string;
  name: string;
  ip: string;
  status: 'active' | 'inactive';
  downloadSpeed: string;
  uploadSpeed: string;
  downloadTotal: string;
  uploadTotal: string;
}

export interface NetworkStats {
  interfaces: NetworkInterface[];
  traffic: {
    time: string;
    download: number;
    upload: number;
  }[];
}

// Get system network interfaces
export const getNetworkInterfaces = async (serverIp: string = '127.0.0.1'): Promise<NetworkInterface[]> => {
  try {
    const response = await publicRequest(`/network?server=${serverIp}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.interfaces || [];
  } catch (error) {
    console.error('Error fetching network interfaces:', error);
    throw error;
  }
};

// Get container network traffic data for a specific container
export const getContainerNetworkTraffic = async (
  serverIp: string = '127.0.0.1',
  containerId?: string
): Promise<{ time: string; download: number; upload: number; }[]> => {
  try {
    // Get container data which includes network stats
    const containers = await publicRequest(`/docker?server=${serverIp}`);

    // If no containers or no specific container selected, return empty data
    if (!containers || !Array.isArray(containers) || containers.length === 0) {
      return generateEmptyTrafficData();
    }

    // If containerId is provided, filter to just that container
    const targetContainers = containerId
      ? containers.filter(c => c.id === containerId)
      : containers;

    if (targetContainers.length === 0) {
      return generateEmptyTrafficData();
    }

    // Generate traffic data based on actual container network stats
    const now = new Date();
    const trafficMap = new Map();

    // Process container network data to aggregate traffic by time
    targetContainers.forEach(container => {
      if (container.network_stats) {
        Object.values(container.network_stats).forEach(stats => {
          // Convert string values to numbers (remove units)
          const rxBytes = parseFloat(stats.rx_bytes) || 0;
          const txBytes = parseFloat(stats.tx_bytes) || 0;

          // Add to our traffic data
          for (let i = 30; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            const timeKey = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            if (!trafficMap.has(timeKey)) {
              trafficMap.set(timeKey, {
                time: timeKey,
                download: rxBytes / 30, // Distribute the traffic over time periods
                upload: txBytes / 30,
              });
            } else {
              const existing = trafficMap.get(timeKey);
              trafficMap.set(timeKey, {
                ...existing,
                download: existing.download + (rxBytes / 30),
                upload: existing.upload + (txBytes / 30),
              });
            }
          }
        });
      }
    });

    // Convert map to array and sort by time
    const trafficEntries = Array.from(trafficMap.entries());
    trafficEntries.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a[0]}`).getTime();
      const timeB = new Date(`1970/01/01 ${b[0]}`).getTime();
      return timeA - timeB;
    });

    // If we have traffic data, use it
    if (trafficEntries.length > 0) {
      const networkTraffic: { time: string; download: number; upload: number; }[] = [];
      trafficEntries.forEach(([_, data]) => {
        networkTraffic.push({
          time: data.time,
          download: parseFloat(data.download.toFixed(2)),
          upload: parseFloat(data.upload.toFixed(2)),
        });
      });
      return networkTraffic;
    } else {
      // Fallback if no network data is available
      return generateEmptyTrafficData();
    }
  } catch (error) {
    console.error('Error fetching container network traffic:', error);
    throw error;
  }
};

// Helper function to generate empty traffic data
const generateEmptyTrafficData = () => {
  const data: { time: string; download: number; upload: number; }[] = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      download: 0,
      upload: 0,
    });
  }

  return data;
};

// Get all network stats (interfaces and traffic)
export const getNetworkStats = async (
  serverIp: string = '127.0.0.1',
  containerId?: string
): Promise<NetworkStats> => {
  try {
    // Get interfaces from system
    const interfaces = await getNetworkInterfaces(serverIp);

    // Get traffic data from container(s)
    const traffic = await getContainerNetworkTraffic(serverIp, containerId);

    return {
      interfaces,
      traffic
    };
  } catch (error) {
    console.error('Error fetching network stats:', error);
    throw error;
  }
};

// React Query hook for network interfaces only
export const useNetworkInterfaces = () => {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  return useQuery({
    queryKey: ['networkInterfaces', serverIp],
    queryFn: () => getNetworkInterfaces(serverIp),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

// React Query hook for container traffic only
export const useContainerTraffic = (containerId?: string) => {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  return useQuery({
    queryKey: ['containerTraffic', serverIp, containerId],
    queryFn: () => getContainerNetworkTraffic(serverIp, containerId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

// Combined hook for backward compatibility
export const useNetworkStats = (containerId?: string) => {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  return useQuery({
    queryKey: ['networkStats', serverIp, containerId],
    queryFn: () => getNetworkStats(serverIp, containerId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

// Get all containers for dropdown
export const useContainers = () => {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  return useQuery({
    queryKey: ['containers', serverIp],
    queryFn: async () => {
      const containers = await publicRequest(`/docker?server=${serverIp}`);
      return containers || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};
