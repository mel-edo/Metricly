import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Snackbar, 
  Alert, 
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  LinearProgress,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';

export const DockerContainers = ({ docker = [], isLoading, currentServer }) => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [containers, setContainers] = useState(docker);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [resourceHistory, setResourceHistory] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setContainers(docker);
  }, [docker]);

  useEffect(() => {
    // Update resource history for each container
    containers.forEach(container => {
      setResourceHistory(prev => ({
        ...prev,
        [container.name]: [
          ...(prev[container.name] || []).slice(-20),
          {
            timestamp: new Date().toISOString(),
            cpu: container.cpu_percent,
            memory: parseFloat(container.memory_usage.split('/')[0])
          }
        ]
      }));
    });
  }, [containers]);

  const handleContainerAction = async (action, containerName) => {
    if (!currentServer) {
      setAlertMessage({ type: 'error', text: 'No server selected!' });
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(
        `/api/containers/${containerName}/${action}?server=${currentServer.ip_address}`,
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} container`);
      }

      setContainers(prevContainers => 
        prevContainers.map(container => 
          container.name === containerName
            ? { ...container, status: action === 'stop' ? 'Stopped' : 'Running' }
            : container
        )
      );

      setAlertMessage({ 
        type: 'success', 
        text: `Container ${action} successful!`,
        duration: 3000
      });
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setAlertMessage({ 
        type: 'error', 
        text: error.message || `Failed to ${action} container`,
        duration: 5000
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const fetchContainerLogs = async (containerName) => {
    if (!currentServer) return;
    
    setIsLoadingLogs(true);
    try {
      const response = await fetch(
        `/api/containers/${containerName}/logs?server=${currentServer.ip_address}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error.message || 'Failed to fetch container logs',
        duration: 5000
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const getHealthStatus = (container) => {
    if (container.status === 'Stopped') return 'error';
    if (container.cpu_percent > 90 || parseFloat(container.memory_usage.split('/')[0]) > 90) return 'warning';
    return 'success';
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Loading Docker Containers...</Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">Docker Containers</Typography>
        <List>
          {containers.length > 0 ? (
            containers.map((container, index) => {
              const ports = Object.entries(container.ports || {});
              const firstPort = ports.find(([port]) => port.includes('tcp'))?.[0];
              const [portNumber] = firstPort ? firstPort.split('/') : [null];
              const openUrl = firstPort ? `http://${currentServer.ip_address}:${portNumber}` : null;
              const healthStatus = getHealthStatus(container);

              return (
                <ListItem 
                  key={index} 
                  secondaryAction={
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => {
                            setSelectedContainer(container);
                            setShowDetails(true);
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Logs">
                        <IconButton 
                          onClick={() => {
                            setSelectedContainer(container);
                            setShowLogs(true);
                            fetchContainerLogs(container.name);
                          }}
                        >
                          <TerminalIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restart Container">
                        <IconButton 
                          onClick={() => handleContainerAction('restart', container.name)}
                          disabled={isLoadingAction}
                          color="primary"
                        >
                          {isLoadingAction ? (
                            <CircularProgress size={24} />
                          ) : (
                            <RestartAltIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Stop Container">
                        <IconButton 
                          onClick={() => handleContainerAction('stop', container.name)}
                          disabled={container.status === 'Stopped' || isLoadingAction}
                        >
                          <StopCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Start Container">
                        <IconButton 
                          onClick={() => handleContainerAction('start', container.name)}
                          disabled={container.status === 'Running' || isLoadingAction}
                        >
                          <PlayCircleIcon />
                        </IconButton>
                      </Tooltip>
                      {openUrl && container.status === 'Running' && (
                        <Tooltip title="Open in Browser">
                          <IconButton component={Link} href={openUrl} target="_blank" rel="noopener">
                            <OpenInNewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{container.name}</Typography>
                        <Chip 
                          label={container.status} 
                          color={healthStatus}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography>CPU: {container.cpu_percent}%</Typography>
                          <Typography>Memory: {container.memory_usage} / {container.memory_limit}</Typography>
                        </Box>
                        <Typography>Image: {container.image}</Typography>
                        {Object.entries(container.ports || {}).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">Ports:</Typography>
                            {Object.entries(container.ports).map(([port, mappings]) => (
                              <Typography key={port} variant="body2"> - {port} → {mappings.join(", ")}</Typography>
                            ))}
                          </Box>
                        )}
                      </>
                    } 
                  />
                </ListItem>
              );
            })
          ) : (
            <Typography color="error">No containers found.</Typography>
          )}
        </List>

        {/* Container Details Dialog */}
        <Dialog 
          open={showDetails && selectedContainer} 
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Container Details</DialogTitle>
          <DialogContent>
            {selectedContainer && (
              <>
                <Typography variant="h6" gutterBottom>{selectedContainer.name}</Typography>
                <Box sx={{ height: 300, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={resourceHistory[selectedContainer.name] || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <ChartTooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                      <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory Usage" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="subtitle1" gutterBottom>Details</Typography>
                <Typography>Status: {selectedContainer.status}</Typography>
                <Typography>Image: {selectedContainer.image}</Typography>
                <Typography>Size: {selectedContainer.size}</Typography>
                <Typography>Created: {new Date(selectedContainer.created).toLocaleString()}</Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Container Logs Dialog */}
        <Dialog 
          open={showLogs && selectedContainer} 
          onClose={() => setShowLogs(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Container Logs - {selectedContainer?.name}</DialogTitle>
          <DialogContent>
            {isLoadingLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  bgcolor: 'black', 
                  color: 'white', 
                  p: 2, 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 400,
                  overflow: 'auto'
                }}
              >
                {logs}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLogs(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {alertMessage && (
          <Snackbar 
            open={true} 
            autoHideDuration={alertMessage.duration || 3000} 
            onClose={() => setAlertMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={alertMessage.type} sx={{ width: '100%' }}>
              {alertMessage.text}
            </Alert>
          </Snackbar>
        )}
      </CardContent>
    </Card>
  );
};
