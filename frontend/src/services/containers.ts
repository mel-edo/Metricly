import { authenticatedRequest, publicRequest } from './api';

export interface ContainerInfo {
  name: string;
  id: string;
  status: string;
  cpu_percent: number;
  memory_usage: string;
  memory_limit: string;
  network_stats: {
    [network: string]: {
      rx_bytes: string;
      tx_bytes: string;
      rx_packets: number;
      tx_packets: number;
      rx_errors: number;
      tx_errors: number;
      rx_dropped: number;
      tx_dropped: number;
    };
  };
  ports: {
    [port: string]: Array<{ HostIp: string; HostPort: string }>;
  };
  size: string;
  created: string;
  uptime: string;
  image: string;
  volumes: Array<{
    source: string;
    destination: string;
    type: string;
    size: string;
  }>;
}

export interface ContainerMetrics {
  timestamp: string;
  cpu_percent: number;
  memory_used: number;
  memory_limit: number;
  status: string;
  is_running: boolean;
  restart_count: number;
  exit_code: number;
}

// Get all containers
const getContainers = async (serverIp: string = '127.0.0.1'): Promise<ContainerInfo[]> => {
  return publicRequest(`/docker?server=${serverIp}`);
};

// Get container metrics history
const getContainerMetricsHistory = async (
  serverIp: string = '127.0.0.1',
  timeRange: string = '1h'
): Promise<Record<string, ContainerMetrics[]>> => {
  try {
    return await authenticatedRequest(`/servers/${serverIp}/docker/metrics?timeRange=${timeRange}`);
  } catch (error) {
    // If authentication fails, try to redirect to login
    if (error instanceof Error &&
        (error.message.includes('Authentication required') ||
         error.message.includes('Token expired') ||
         error.message.includes('Invalid token'))) {
      // Redirect to login page if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};

// Perform container action (start, stop, restart)
const containerAction = async (
  containerName: string,
  action: 'start' | 'stop' | 'restart',
  serverIp: string = '127.0.0.1'
): Promise<{ message: string }> => {
  try {
    return await authenticatedRequest(`/containers/${containerName}/${action}?server=${serverIp}`, {
      method: 'POST',
    });
  } catch (error) {
    // If authentication fails, try to redirect to login
    if (error instanceof Error &&
        (error.message.includes('Authentication required') ||
         error.message.includes('Token expired') ||
         error.message.includes('Invalid token'))) {
      // Redirect to login page if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};

// Get container logs
const getContainerLogs = async (
  containerName: string,
  serverIp: string = '127.0.0.1'
): Promise<{ logs: string }> => {
  try {
    return await authenticatedRequest(`/containers/${containerName}/logs?server=${serverIp}`);
  } catch (error) {
    // If authentication fails, try to redirect to login
    if (error instanceof Error &&
        (error.message.includes('Authentication required') ||
         error.message.includes('Token expired') ||
         error.message.includes('Invalid token'))) {
      // Redirect to login page if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};

export {
  getContainers,
  getContainerMetricsHistory,
  containerAction,
  getContainerLogs,
};
