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
  Tabs
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
      setHistoricalData(systemData);

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
              <Typography variant="h5">Docker Metrics History</Typography>
            </Box>

            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareDockerData()}>
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
                  {Object.entries(dockerHistoricalData).map(([containerName]) => (
                    <Line
                      key={`${containerName}_cpu`}
                      type="monotone"
                      dataKey={`${containerName}_cpu`}
                      stroke={containerColors[containerName] || getRandomColor()}
                      name={`${containerName} CPU %`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
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