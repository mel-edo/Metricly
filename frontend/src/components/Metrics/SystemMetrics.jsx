import { Card, CardContent, Typography, Grid } from '@mui/material';

export const SystemMetrics = ({ system, isLoading }) => {
  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">Loading System Metrics...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb : 3 }}>System Metrics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}><Typography>CPU Usage: {system.cpu_percent}%</Typography></Grid>
          <Grid item xs={12}><Typography>CPU Cores: {system.cpu_count}</Typography></Grid>
          <Grid item xs={12}><Typography>Memory Used: {system.memory_info.used} / {system.memory_info.total}</Typography></Grid>
          <Grid item xs={12}><Typography>Disk Free: {system.disk_usage.free} / {system.disk_usage.total}</Typography></Grid>
          <Grid item xs={12}><Typography>Network Sent: {system.network_stats.bytes_sent}</Typography></Grid>
          <Grid item xs={12}><Typography>Network Received: {system.network_stats.bytes_recv}</Typography></Grid>
          <Grid item xs={12}><Typography>Processes Running: {system.process_count}</Typography></Grid>
          <Grid item xs={12}><Typography>System Uptime: {Math.round(system.uptime / 3600)} hours</Typography></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
