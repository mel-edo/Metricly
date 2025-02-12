import { Card, CardContent, Grid, Typography, Skeleton } from '@mui/material';

export const SystemMetrics = ({ system, isLoading }) => {
  // Loading skeleton simulation
  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Skeleton width="40%" />
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton variant="rectangular" height={60} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Actual content when data is loaded
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          System Metrics
        </Typography>
        <Grid container spacing={2}>
          <MetricItem label="CPU Usage" value={system?.cpu_percent} />
          <MetricItem label="Memory Used" value={system?.memory_info.used} />
          <MetricItem label="Disk Free" value={system?.disk_usage.free} />
          <MetricItem label="Network Sent" value={system?.network_stats.bytes_sent} />
        </Grid>
      </CardContent>
    </Card>
  );
};

// Reusable metric display component
const MetricItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value || 'N/A'}
    </Typography>
  </Grid>
);