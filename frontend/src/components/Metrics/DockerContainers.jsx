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
  CircularProgress,
  TextField
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import TerminalIcon from '@mui/icons-material/Terminal';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';

export const DockerContainers = ({ docker = [], isLoading, currentServer }) => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [containers, setContainers] = useState(docker);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});  // Track loading state per container
  const [resourceHistory, setResourceHistory] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [customUrls, setCustomUrls] = useState(() => {
    const saved = localStorage.getItem('containerCustomUrls');
    return saved ? JSON.parse(saved) : {};
  });
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [customUrlInput, setCustomUrlInput] = useState('');

  useEffect(() => {
    setContainers(docker);
  }, [docker]);

  useEffect(() => {
    // Update resource history for each container
    containers.forEach(container => {
      // Convert memory usage from string (e.g., "1.2 MB") to number
      const memoryValue = parseFloat(container.memory_usage.split(' ')[0]);
      const memoryUnit = container.memory_usage.split(' ')[1];
      const memoryInMB = memoryUnit === 'B' ? memoryValue / (1024 * 1024) :
                         memoryUnit === 'KB' ? memoryValue / 1024 :
                         memoryUnit === 'GB' ? memoryValue * 1024 :
                         memoryUnit === 'TB' ? memoryValue * 1024 * 1024 :
                         memoryValue; // Already in MB

      setResourceHistory(prev => ({
        ...prev,
        [container.name]: [
          ...(prev[container.name] || []).slice(-20),
          {
            timestamp: new Date().toISOString(),
            cpu: parseFloat(container.cpu_percent),
            memory: memoryInMB
          }
        ]
      }));
    });
  }, [containers]);

  // Save custom URLs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('containerCustomUrls', JSON.stringify(customUrls));
  }, [customUrls]);

  const handleContainerAction = async (action, containerName) => {
    if (!currentServer) {
      setAlertMessage({ type: 'error', text: 'No server selected!' });
      return;
    }

    setLoadingActions(prev => ({ ...prev, [containerName]: true }));
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
      setLoadingActions(prev => ({ ...prev, [containerName]: false }));
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

  const handleSetCustomUrl = (containerName) => {
    setEditingContainer(containerName);
    // Get the current URL (either custom or auto-detected)
    const container = containers.find(c => c.name === containerName);
    const ports = Object.entries(container.ports || {});
    const firstPort = ports.find(([port]) => port.includes('tcp'))?.[0];
    const [portNumber] = firstPort ? firstPort.split('/') : [null];
    const autoDetectedUrl = firstPort ? `http://${currentServer.ip_address}:${portNumber}` : null;
    const currentUrl = customUrls[containerName] || autoDetectedUrl;
    setCustomUrlInput(currentUrl || '');
    setShowUrlDialog(true);
  };

  const handleSaveCustomUrl = () => {
    if (editingContainer) {
      setCustomUrls(prev => ({
        ...prev,
        [editingContainer]: customUrlInput
      }));
      setShowUrlDialog(false);
      setEditingContainer(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
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
                          disabled={loadingActions[container.name]}
                          color="primary"
                        >
                          {loadingActions[container.name] ? (
                            <CircularProgress size={24} />
                          ) : (
                            <RestartAltIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Stop Container">
                        <IconButton 
                          onClick={() => handleContainerAction('stop', container.name)}
                          disabled={container.status === 'Stopped' || loadingActions[container.name]}
                        >
                          <StopCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Start Container">
                        <IconButton 
                          onClick={() => handleContainerAction('start', container.name)}
                          disabled={container.status === 'Running' || loadingActions[container.name]}
                        >
                          <PlayCircleIcon />
                        </IconButton>
                      </Tooltip>
                      {(openUrl || customUrls[container.name]) && (
                        <>
                        <Tooltip title="Open in Browser">
                            <IconButton 
                              component={Link} 
                              href={customUrls[container.name] || openUrl} 
                              target="_blank" 
                              rel="noopener"
                              disabled={container.status === 'Stopped'}
                            >
                            <OpenInNewIcon />
                          </IconButton>
                        </Tooltip>
                          <Tooltip title="Edit URL">
                            <IconButton 
                              onClick={() => handleSetCustomUrl(container.name)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </>
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
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        yAxisId="cpu"
                        orientation="left"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        // label={{ value: 'CPU Usage', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="memory"
                        orientation="right"
                        domain={[0, 'dataMax']}
                        tickFormatter={(value) => `${(value/1024).toFixed(1)}GB`}
                        // label={{ value: 'Memory Usage', angle: 90, position: 'insideRight' }}
                      />
                      <ChartTooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value, name) => {
                          if (name === 'CPU Usage') return [`${value.toFixed(1)}%`, name];
                          if (name === 'Memory Usage') return [`${(value/1024).toFixed(2)}GB`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="cpu"
                        type="monotone" 
                        dataKey="cpu" 
                        stroke="#FF6B6B" 
                        name="CPU Usage"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="memory"
                        type="monotone" 
                        dataKey="memory" 
                        stroke="#4ECDC4" 
                        name="Memory Usage"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="subtitle1" gutterBottom>Details</Typography>
                <Typography>Status: {selectedContainer.status}</Typography>
                <Typography>Image: {selectedContainer.image}</Typography>
                <Typography>Size: {formatBytes(selectedContainer.size)}</Typography>
                <Typography>Created: {new Date(selectedContainer.created).toLocaleString()}</Typography>
                {selectedContainer.volumes && selectedContainer.volumes.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>Volumes</Typography>
                    {selectedContainer.volumes.map((volume, index) => (
                      <Typography key={index}>
                        {volume.name || volume.source}: {formatBytes(volume.size || 0)}
                      </Typography>
                    ))}
                  </>
                )}
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

        {/* Custom URL Dialog */}
        <Dialog 
          open={showUrlDialog} 
          onClose={() => setShowUrlDialog(false)}
        >
          <DialogTitle>Set Custom URL for {editingContainer}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Custom URL"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com"
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUrlDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomUrl} variant="contained">Save</Button>
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
