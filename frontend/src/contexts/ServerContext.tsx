import React, { createContext, useContext, useState, useEffect } from 'react';
import { getServers, ServerInfo, removeDuplicateLocalhostEntries, updateServerName as updateServerNameApi } from '../services/servers';
import { useAuth } from './AuthContext';

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
      // Try to call the API to update the server name
      // If the API doesn't support this, it will return a mock response
      await updateServerNameApi(serverId, newName);

      // Update the servers list with the updated server name
      const updatedServers = servers.map(server => {
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
      let serverList = await getServers();

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

      // Only show error if it's not a token expiration issue
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch servers';
      if (!errorMsg.includes('Token expired')) {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Remove duplicate localhost entries and then fetch servers
      const init = async () => {
        try {
          // First try to remove any duplicate localhost entries
          await removeDuplicateLocalhostEntries();
          // Then fetch the updated server list
          await fetchServers();
        } catch (error) {
          console.error('Error initializing servers:', error);
          // Still try to fetch servers even if removing duplicates fails
          fetchServers();
        }
      };

      init();
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
