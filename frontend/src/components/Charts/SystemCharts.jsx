import { Card, CardContent, Grid, Typography } from '@mui/material';

export const SystemCharts = ({ historical = [] }) => (
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>CPU Usage History</Typography>
          {historical.length > 0 ? (
            <LineChart
              xAxis={[{ data: historical.map((_, i) => i) }]}
              series={[{ data: historical.map(m => parseFloat(m.cpu_percent)) }]}
              height={300}
            />
          ) : (
            <Typography>No historical data available</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);
