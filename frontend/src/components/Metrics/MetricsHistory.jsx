import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Slider,
  TextField,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import SettingsIcon from '@mui/icons-material/Settings';

// Generate random color for containers
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const MetricsHistory = ({ server, metrics }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [thresholds, setThresholds] = useState({
    cpu: 80,
    memory: 80,
    disk: 80
  });
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [dockerHistoricalData, setDockerHistoricalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [containerColors, setContainerColors] = useState({});

  useEffect(() => {
    if (server) {
      fetchHistoricalData();
      // Set up periodic refresh based on timeRange
      const interval = setInterval(fetchHistoricalData, getRefreshInterval(timeRange));
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [server, timeRange]);

  const getRefreshInterval = (range) => {
    switch (range) {
      case '1h':
        return 60000; // 1 minute
      case '6h':
        return 300000; // 5 minutes
      case '24h':
        return 900000; // 15 minutes
      default:
        return 60000; // Default to 1 minute
    }
  };

  const fetchHistoricalData = async () => {
    if (!server) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch system metrics history
      const systemResponse = await fetch(
        `/api/servers/${server.ip_address}/metrics?timeRange=${timeRange}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (!systemResponse.ok) {
        throw new Error(`Failed to fetch historical data: ${systemResponse.statusText}`);
      }

      const systemData = await systemResponse.json();
      console.log('Received historical data:', systemData);

      // Format the data to ensure all required metrics are present
      const formattedData = systemData.map(point => ({
        timestamp: point.timestamp,
        cpu_percent: parseFloat(point.cpu_percent || 0),
        memory_percent: parseFloat(point.memory_info?.percent || 0),
        disk_percent: parseFloat(point.disk_usage?.['/']?.percent || 0)
      }));

      console.log('Formatted historical data:', formattedData);
      setHistoricalData(formattedData);

      // Fetch Docker metrics history
      const dockerResponse = await fetch(
        `/api/servers/${server.ip_address}/docker/metrics?timeRange=${timeRange}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!dockerResponse.ok) {
        throw new Error(`Failed to fetch Docker metrics: ${dockerResponse.statusText}`);
      }

      const dockerData = await dockerResponse.json();
      console.log('Received Docker data:', dockerData);
      setDockerHistoricalData(dockerData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError(error.message || 'Failed to load historical data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThresholdChange = (metric, value) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const saveThresholds = async () => {
    if (!server) return;

    try {
      const response = await fetch(
        `/api/servers/${server.ip_address}/thresholds`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(thresholds)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to save thresholds: ${response.statusText}`);
      }

      setShowThresholdDialog(false);
      setError(null);
    } catch (error) {
      console.error('Error saving thresholds:', error);
      setError(error.message || 'Failed to save thresholds');
    }
  };

  const checkAlerts = () => {
    if (!metrics) return;

    const newAlerts = [];
    if (metrics.cpu_percent > thresholds.cpu) {
      newAlerts.push({
        type: 'cpu',
        message: `CPU usage is above ${thresholds.cpu}% (Current: ${metrics.cpu_percent.toFixed(1)}%)`,
        value: metrics.cpu_percent,
        timestamp: new Date()
      });
    }
    if (metrics.memory_percent > thresholds.memory) {
      newAlerts.push({
        type: 'memory',
        message: `Memory usage is above ${thresholds.memory}% (Current: ${metrics.memory_percent.toFixed(1)}%)`,
        value: metrics.memory_percent,
        timestamp: new Date()
      });
    }
    if (metrics.disk_percent > thresholds.disk) {
      newAlerts.push({
        type: 'disk',
        message: `Disk usage is above ${thresholds.disk}% (Current: ${metrics.disk_percent.toFixed(1)}%)`,
        value: metrics.disk_percent,
        timestamp: new Date()
      });
    }
    setAlerts(newAlerts);
  };

  useEffect(() => {
    checkAlerts();
  }, [metrics, thresholds]);

  const getAlertColor = (type) => {
    switch (type) {
      case 'cpu': return 'error';
      case 'memory': return 'warning';
      case 'disk': return 'info';
      default: return 'default';
    }
  };

  // Prepare Docker data for combined chart
  const prepareDockerData = () => {
    if (!dockerHistoricalData || Object.keys(dockerHistoricalData).length === 0) return [];
    
    // Get all timestamps from all containers
    const allTimestamps = new Set();
    Object.values(dockerHistoricalData).forEach(containerData => {
      containerData.forEach(point => {
        allTimestamps.add(point.timestamp);
      });
    });

    // Create combined data points
    return Array.from(allTimestamps).sort().map(timestamp => {
      const point = { timestamp };
      Object.entries(dockerHistoricalData).forEach(([containerName, data]) => {
        const matchingPoint = data.find(d => d.timestamp === timestamp);
        if (matchingPoint) {
          point[`${containerName}_cpu`] = matchingPoint.cpu_percent;
          point[`${containerName}_memory`] = matchingPoint.memory_percent;
        }
      });
      return point;
    });
  };

  return (
    <Grid container spacing={3}>
      {/* System Metrics History */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">System Metrics History</Typography>
              <Box>
                <Tooltip title="Configure Thresholds">
                  <IconButton onClick={() => setShowThresholdDialog(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                </Select>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {alerts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Active Alerts</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {alerts.map((alert, index) => (
                    <Chip
                      key={index}
                      icon={<WarningIcon />}
                      label={`${alert.message} (${alert.value}%)`}
                      color={getAlertColor(alert.type)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu_percent"
                    stroke="#8884d8"
                    name="CPU %"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory_percent"
                    stroke="#82ca9d"
                    name="Memory %"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="disk_percent"
                    stroke="#ffc658"
                    name="Disk %"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Docker Metrics History */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Container Health Overview</Typography>
            </Box>

            {dockerHistoricalData && Object.keys(dockerHistoricalData).length > 0 ? (
              <Box>
                {Object.entries(dockerHistoricalData).map(([containerName, data]) => {
                  const latestData = data[data.length - 1];
                  if (!latestData) return null;

                  const cpuUsage = parseFloat(latestData.cpu_percent || 0);
                  const memoryUsage = parseFloat(latestData.memory_used || 0);
                  const memoryLimit = parseFloat(latestData.memory_limit || 0);
                  const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

                  // Get container health information
                  const isRunning = latestData.is_running || false;
                  const restartCount = latestData.restart_count || 0;
                  const exitCode = latestData.exit_code || 0;

                  // Determine container health
                  const isHealthy = () => {
                    // Check resource usage
                    const hasHighCpu = cpuUsage > thresholds.cpu;
                    const hasHighMemory = memoryPercentage > thresholds.memory;
                    
                    // Check container status
                    const hasTooManyRestarts = restartCount > 3;
                    const hasErrorExitCode = exitCode !== 0;
                    
                    return !hasHighCpu && !hasHighMemory && isRunning && !hasTooManyRestarts && !hasErrorExitCode;
                  };

                  const getHealthStatus = () => {
                    if (!isRunning) return { label: 'Stopped', color: 'error' };
                    if (exitCode !== 0) return { label: 'Error', color: 'error' };
                    if (restartCount > 3) return { label: 'Unstable', color: 'warning' };
                    if (cpuUsage > thresholds.cpu) return { label: 'High CPU', color: 'error' };
                    if (memoryPercentage > thresholds.memory) return { label: 'High Memory', color: 'error' };
                    return { label: 'Healthy', color: 'success' };
                  };

                  const healthStatus = getHealthStatus();

                  return (
                    <Box 
                      key={containerName} 
                      sx={{ 
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {containerName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={healthStatus.label}
                            size="small" 
                            color={healthStatus.color}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              CPU Usage
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={cpuUsage} 
                                  color={cpuUsage > thresholds.cpu ? 'error' : 'primary'}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {cpuUsage.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Memory Usage
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={memoryPercentage} 
                                  color={memoryPercentage > thresholds.memory ? 'error' : 'primary'}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {memoryUsage.toFixed(1)}MB / {memoryLimit.toFixed(1)}MB
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography color="text.secondary">No containers available.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Threshold Configuration Dialog */}
      <Dialog
        open={showThresholdDialog}
        onClose={() => setShowThresholdDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Alert Thresholds</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>CPU Threshold (%)</Typography>
            <Slider
              value={thresholds.cpu}
              onChange={(_, value) => handleThresholdChange('cpu', value)}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Memory Threshold (%)</Typography>
            <Slider
              value={thresholds.memory}
              onChange={(_, value) => handleThresholdChange('memory', value)}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Disk Threshold (%)</Typography>
            <Slider
              value={thresholds.disk}
              onChange={(_, value) => handleThresholdChange('disk', value)}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowThresholdDialog(false)}>Cancel</Button>
          <Button onClick={saveThresholds} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}; 