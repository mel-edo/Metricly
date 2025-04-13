import React, { createContext, useContext, useState, useEffect } from 'react';
import { getServers, ServerInfo, updateServerName as updateServerNameApi } from '../services/servers';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';

interface ServerContextType {
  servers: ServerInfo[];
  activeServer: ServerInfo | null;
  setActiveServer: (server: ServerInfo) => void;
  loading: boolean;
  error: string | null;
  refreshServers: () => Promise<void>;
  updateServerName: (serverId: string, newName: string) => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeServer, setActiveServer] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  // Helper function to remove duplicate localhost entries
  const removeDuplicateLocalhost = (servers: ServerInfo[]): ServerInfo[] => {
    // Track if we've seen localhost or 127.0.0.1
    let hasLocalhost = false;
    let localhostIndex = -1;

    // Find all localhost/127.0.0.1 entries
    servers.forEach((server, index) => {
      const ip = server.ip_address.split(':')[0];
      if (ip === '127.0.0.1' || ip === 'localhost') {
        if (!hasLocalhost) {
          hasLocalhost = true;
          localhostIndex = index;
        }
      }
    });

    // If we have multiple localhost entries, keep only the first one
    if (hasLocalhost && localhostIndex >= 0) {
      // Keep only the first localhost entry and filter out others
      return servers.filter((server, index) => {
        const ip = server.ip_address.split(':')[0];
        if (ip === '127.0.0.1' || ip === 'localhost') {
          return index === localhostIndex;
        }
        return true;
      });
    }

    return servers;
  };

  // Function to update server name
  const updateServerName = async (serverId: string, newName: string): Promise<void> => {
    try {
      console.log('Updating server name:', serverId, newName);
      console.log('Available servers:', servers);

      // The serverId could be either the IP address or the server ID
      // First try to find by IP address
      let server = servers.find(s => s.ip_address === serverId);

      // If not found, it might be the server ID from the UI
      if (!server) {
        console.log('Server not found by IP address, trying to find by ID');
        // In this case, we need to use the serverId directly
        await updateServerNameApi(serverId, newName);
      } else {
        // Call the API to update the server name using IP address
        await updateServerNameApi(server.ip_address, newName);
      }

      // After successful update, refresh the servers list
      await fetchServers();

      // Also update the local state for immediate feedback
      const updatedServers = servers.map(server => {
        // Match by IP address or by the fact that this is the only server with this name
        if (server.ip_address === serverId) {
          return { ...server, name: newName };
        }
        return server;
      });

      // Update the servers state
      setServers(updatedServers);

      // Update active server if it's the one being renamed
      if (activeServer && activeServer.ip_address === serverId) {
        setActiveServer({ ...activeServer, name: newName });
      }

      // Store the updated server name in localStorage for persistence
      try {
        // Get existing server names from localStorage
        const storedServerNames = localStorage.getItem('serverNames');
        const serverNames = storedServerNames ? JSON.parse(storedServerNames) : {};

        // Update the name for this server
        serverNames[serverId] = newName;

        // Save back to localStorage
        localStorage.setItem('serverNames', JSON.stringify(serverNames));
      } catch (storageErr) {
        console.error('Error storing server name in localStorage:', storageErr);
        // Continue even if localStorage fails
      }
    } catch (err) {
      console.error('Error updating server name:', err);
      throw err;
    }
  };

  const fetchServers = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      // Try to get servers from the API
      console.log('Fetching servers...');
      let serverList = await getServers();
      console.log('Servers fetched successfully:', serverList);

      // Remove duplicate localhost/127.0.0.1 entries
      const uniqueServers = removeDuplicateLocalhost(serverList);

      // Apply stored server names from localStorage
      try {
        const storedServerNames = localStorage.getItem('serverNames');
        if (storedServerNames) {
          const serverNames = JSON.parse(storedServerNames);

          // Apply stored names to the servers
          const serversWithNames = uniqueServers.map(server => {
            const storedName = serverNames[server.ip_address];
            if (storedName) {
              return { ...server, name: storedName };
            }
            return server;
          });

          setServers(serversWithNames);
        } else {
          setServers(uniqueServers);
        }
      } catch (storageErr) {
        console.error('Error loading server names from localStorage:', storageErr);
        // If there's an error reading from localStorage, just use the original servers
        setServers(uniqueServers);
      }

      // Set localhost as default active server if none is selected
      if (!activeServer) {
        // Get the servers with applied names
        const serversToUse = servers || uniqueServers;

        // Try to find localhost in the servers list
        const localhost = serversToUse.find(s => s.ip_address === '127.0.0.1');
        if (localhost) {
          setActiveServer(localhost);
        } else if (serversToUse.length > 0) {
          setActiveServer(serversToUse[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching servers:', err);

      // If we get an error, still set localhost as the active server
      // This ensures the app can still function with local containers
      if (!activeServer) {
        const localhost = { ip_address: '127.0.0.1', name: 'Localhost' };
        setActiveServer(localhost);

        // Add only localhost to the servers list - no bogus data
        setServers([localhost]);
      }

      // Handle network errors gracefully
      if (err instanceof TypeError) {
        console.warn('Network error detected, using local mode');
        // Don't show error to user, just use localhost
        toast({
          title: 'Network Error',
          description: 'Could not connect to the server. Using local mode.',
          variant: 'default',
        });
      } else {
        // Only show error if it's not a token expiration issue
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch servers';
        if (!errorMsg.includes('Token expired')) {
          setError(errorMsg);
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch servers when logged in
      fetchServers();
    }
  }, [isLoggedIn]);

  return (
    <ServerContext.Provider
      value={{
        servers,
        activeServer,
        setActiveServer,
        loading,
        error,
        refreshServers: fetchServers,
        updateServerName
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = (): ServerContextType => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};
