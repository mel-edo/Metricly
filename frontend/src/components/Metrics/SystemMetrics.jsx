import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export const SystemMetrics = ({ metrics, isLoading, currentServer }) => {
  const [localMetrics, setLocalMetrics] = useState(metrics);
  const [updateInterval, setUpdateInterval] = useState(null);

  useEffect(() => {
    setLocalMetrics(metrics);
  }, [metrics]);

  useEffect(() => {
    const fetchLatestMetrics = async () => {
      if (!currentServer) return;
      
      try {
        const response = await fetch(
          `/api/system?server=${currentServer.ip_address}`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch metrics');
        }
        
        const data = await response.json();
        
        // Ensure all values are properly formatted
        const memoryInfo = data.memory_info || {};
        const diskInfo = (data.disk_usage && data.disk_usage['/']) || {};
        
        setLocalMetrics({
          cpu_percent: parseFloat(data.cpu_percent || 0),
          memory_percent: parseFloat(memoryInfo.percent || 0),
          memory_used: parseInt(memoryInfo.used || 0, 10),
          memory_total: parseInt(memoryInfo.total || 0, 10),
          disk_percent: parseFloat(diskInfo.percent || 0),
          disk_used: parseInt(diskInfo.used || 0, 10),
          disk_total: parseInt(diskInfo.total || 0, 10),
          disks: Object.entries(data.disk_usage || {}).map(([mount, usage]) => ({
            mount,
            percent: parseFloat(usage.percent || 0),
            used: parseInt(usage.used || 0, 10),
            total: parseInt(usage.total || 0, 10)
          }))
        });
      } catch (error) {
        console.error('Error fetching latest metrics:', error);
        setLocalMetrics({
          cpu_percent: 0,
          memory_percent: 0,
          memory_used: 0,
          memory_total: 0,
          disk_percent: 0,
          disk_used: 0,
          disk_total: 0,
          disks: []
        });
      }
    };

    // Set up polling interval for real-time updates
    if (currentServer) {
      fetchLatestMetrics(); // Initial fetch
      const interval = setInterval(fetchLatestMetrics, 5000); // Update every 5 seconds
      setUpdateInterval(interval);
    }

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [currentServer]);

  if (isLoading || !localMetrics) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    bytes = parseFloat(bytes);
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getProgressColor = (value) => {
    if (value >= 90) return 'error';
    if (value >= 70) return 'warning';
    return 'success';
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          System Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SpeedIcon sx={{ mr: 1 }} />
              <Typography variant="h6">CPU Usage</Typography>
            </Box>
            <Tooltip title={`${localMetrics.cpu_percent}%`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={localMetrics.cpu_percent}
                    color={getProgressColor(localMetrics.cpu_percent)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {localMetrics.cpu_percent}%
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MemoryIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Memory Usage</Typography>
            </Box>
            <Tooltip title={`${localMetrics.memory_percent}%`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={localMetrics.memory_percent}
                    color={getProgressColor(localMetrics.memory_percent)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {localMetrics.memory_percent}%
                </Typography>
              </Box>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formatBytes(localMetrics.memory_used)} / {formatBytes(localMetrics.memory_total)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Disk Usage</Typography>
            </Box>
            {localMetrics.disks && localMetrics.disks.map((disk, index) => (
              <Box key={disk.mount} sx={{ mb: index < localMetrics.disks.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ 
                    maxWidth: '40%', 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {disk.mount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(disk.used)} / {formatBytes(disk.total)}
                  </Typography>
                </Box>
                <Tooltip title={`${disk.percent}% - ${disk.mount}`}>
                  <LinearProgress
                    variant="determinate"
                    value={disk.percent}
                    color={getProgressColor(disk.percent)}
                    sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                  />
                </Tooltip>
                {index < localMetrics.disks.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
