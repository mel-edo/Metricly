import { Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { LineChart } from '@mui/x-charts';

export const SystemCharts = ({ historical = [], system }) => {
  // ✅ Ensure historical is always an array
  if (!Array.isArray(historical)) {
    console.error("Error: historical is not an array", historical);
    historical = [];
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>CPU Usage History</Typography>
            {historical.length > 0 ? (
              <LineChart
                xAxis={[{ data: historical.map((_, i) => i) }]}
                series={[{ data: historical.map(m => parseFloat(m.cpu_percent || 0)) }]}
                height={300}
              />
            ) : <Skeleton variant="rectangular" height={300} />}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Memory Usage</Typography>
            {historical.length > 0 ? (
              <LineChart
                xAxis={[{ data: historical.map((_, i) => i) }]}
                series={[{ data: historical.map(m => parseFloat(m.memory_info?.percent || 0)) }]}
                height={300}
              />
            ) : <Skeleton variant="rectangular" height={300} />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
