import { authenticatedRequest, publicRequest } from './api';

export interface ServerInfo {
  ip_address: string;
  name?: string;
}

export interface ServerMetrics {
  timestamp: string;
  cpu_percent: number;
  memory_info: {
    total: number;
    available: number;
    percent: number;
    used: number;
    free: number;
  };
  disk_usage: {
    [mountpoint: string]: {
      total: number;
      used: number;
      free: number;
      percent: number;
    };
  };
}

export interface ServerThresholds {
  cpu: number;
  memory: number;
  disk: number;
  created_at?: string;
  updated_at?: string;
}

// Get all servers
const getServers = async (): Promise<ServerInfo[]> => {
  return authenticatedRequest('/servers');
};

// Add a new server
const addServer = async (ipAddress: string): Promise<void> => {
  await authenticatedRequest('/servers', {
    method: 'POST',
    body: JSON.stringify({ ip_address: ipAddress }),
  });
};

// Delete a server
const deleteServer = async (ipAddress: string): Promise<void> => {
  await authenticatedRequest(`/servers/${ipAddress}`, {
    method: 'DELETE',
  });
};

// Get server metrics
const getServerMetrics = async (ipAddress: string, timeRange: string = '1h'): Promise<ServerMetrics[]> => {
  return authenticatedRequest(`/servers/${ipAddress}/metrics?timeRange=${timeRange}`);
};

// Get current system metrics (no authentication required)
const getCurrentSystemMetrics = async (serverIp: string): Promise<ServerMetrics> => {
  return publicRequest(`/system?server=${serverIp}`);
};

// Get server thresholds
const getServerThresholds = async (ipAddress: string): Promise<ServerThresholds> => {
  return authenticatedRequest(`/servers/${ipAddress}/thresholds`);
};

// Update server thresholds
const updateServerThresholds = async (ipAddress: string, thresholds: Partial<ServerThresholds>): Promise<ServerThresholds> => {
  return authenticatedRequest(`/servers/${ipAddress}/thresholds`, {
    method: 'POST',
    body: JSON.stringify(thresholds),
  });
};

// Check server status
const checkServerStatus = async (ipAddress: string): Promise<{ isOnline: boolean; error: string | null }> => {
  return authenticatedRequest(`/server/${ipAddress}/status`);
};

export {
  getServers,
  addServer,
  deleteServer,
  getServerMetrics,
  getCurrentSystemMetrics,
  getServerThresholds,
  updateServerThresholds,
  checkServerStatus,
};
