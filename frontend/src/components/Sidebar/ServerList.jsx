import { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  Menu, 
  MenuItem, 
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

export const ServerList = ({ servers = [], currentServer, setCurrentServer, handleRemoveServer }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [serverStatus, setServerStatus] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);

  const checkServerStatus = async (server) => {
    if (!server) return;

    setLoadingStates(prev => ({ ...prev, [server.ip_address]: true }));
    setError(null);

    try {
      const response = await fetch(`/api/server/${server.ip_address}/status`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      setServerStatus(prev => ({
        ...prev,
        [server.ip_address]: {
          isOnline: response.ok,
          lastChecked: Date.now(),
          error: data.error,
          responseTime: Date.now() - prev[server.ip_address]?.lastChecked
        }
      }));
    } catch (error) {
      console.error(`Error checking server status for ${server.ip_address}:`, error);
      setServerStatus(prev => ({
        ...prev,
        [server.ip_address]: {
          isOnline: false,
          lastChecked: Date.now(),
          error: error.message
        }
      }));
      setError(`Failed to check status for ${server.ip_address}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [server.ip_address]: false }));
    }
  };

  useEffect(() => {
    // Initial status check for all servers
    servers.forEach(server => {
      checkServerStatus(server);
    });

    // Set up periodic status checks
    const interval = setInterval(() => {
      servers.forEach(server => {
        const status = serverStatus[server.ip_address];
        if (!status || Date.now() - status.lastChecked > 30000) { // Check every 30 seconds
          checkServerStatus(server);
        }
      });
    }, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
      // Clear all loading states
      setLoadingStates({});
    };
  }, [servers]);

  const handleContextMenu = (event, server) => {
    event.preventDefault();
    setSelectedServer(server);
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedServer(null);
  };

  const getServerStatusIcon = (server) => {
    const status = serverStatus[server.ip_address];
    const isLoading = loadingStates[server.ip_address];

    if (isLoading) {
      return <CircularProgress size={20} />;
    }

    if (!status) {
      return <PendingIcon color="action" />;
    }

    return status.isOnline ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const getServerStatusTooltip = (server) => {
    const status = serverStatus[server.ip_address];
    if (!status) return "Checking status...";

    if (status.isOnline) {
      return `Online (Last checked: ${new Date(status.lastChecked).toLocaleTimeString()})`;
    }

    return `Offline: ${status.error || 'Unknown error'}`;
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Divider sx={{ bgcolor: 'divider', my: 2 }} />
      <Typography variant="subtitle1" sx={{ px: 2 }}>Servers</Typography>
      <List>
        {servers.length === 0 ? (
          <Typography sx={{ px: 2 }}>No servers found</Typography>
        ) : (
          servers.map((server) => (
            <ListItem 
              key={server.ip_address} 
              disablePadding 
              onContextMenu={(e) => handleContextMenu(e, server)}
            >
              <ListItemButton 
                onClick={() => setCurrentServer(server)} 
                selected={server.ip_address === currentServer?.ip_address}
                disabled={!serverStatus[server.ip_address]?.isOnline}
              >
                <ListItemIcon>
                  <Tooltip title={getServerStatusTooltip(server)}>
                    {getServerStatusIcon(server)}
                  </Tooltip>
                </ListItemIcon>
                <ListItemText 
                  primary={server.name || server.ip_address}
                  secondary={!serverStatus[server.ip_address]?.isOnline && serverStatus[server.ip_address]?.error}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Right-click context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => { handleRemoveServer(selectedServer.ip_address); handleCloseMenu(); }}>
          Remove Server
        </MenuItem>
      </Menu>
    </>
  );
};
