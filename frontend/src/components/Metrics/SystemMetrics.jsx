import { Card, CardContent, Typography, Skeleton, Grid } from '@mui/material';

export const SystemMetrics = ({ system, isLoading }) => {
  console.log("DEBUG: SystemMetrics received:", system);  // ✅ Log received system data

  if (isLoading || !system) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Skeleton width="40%" />
          </Typography>
          <Typography>Loading system metrics...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          System Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>CPU Usage: {system?.cpu_percent || "N/A"}%</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>Memory Used: {system?.memory_info?.used || "N/A"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>Disk Free: {system?.disk_usage?.free || "N/A"}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
