import { Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { LineChart } from '@mui/x-charts';

export const SystemCharts = ({ historical, system }) => (
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
          ) : <Skeleton variant="rectangular" height={300} />}
        </CardContent>
      </Card>
    </Grid>
    {/* Add more chart types */}
  </Grid>
);