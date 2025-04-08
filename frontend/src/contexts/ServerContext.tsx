import React, { createContext, useContext, useState, useEffect } from 'react';
import { getServers, ServerInfo } from '../services/servers';
import { useAuth } from './AuthContext';

interface ServerContextType {
  servers: ServerInfo[];
  activeServer: ServerInfo | null;
  setActiveServer: (server: ServerInfo) => void;
  loading: boolean;
  error: string | null;
  refreshServers: () => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeServer, setActiveServer] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  const fetchServers = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      // Try to get servers from the API
      const serverList = await getServers();
      setServers(serverList);

      // Set localhost as default active server if none is selected
      if (!activeServer) {
        const localhost = serverList.find(s => s.ip_address === '127.0.0.1');
        if (localhost) {
          setActiveServer(localhost);
        } else if (serverList.length > 0) {
          setActiveServer(serverList[0]);
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
        refreshServers: fetchServers
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
