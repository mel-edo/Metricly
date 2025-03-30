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
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>System Metrics History</Typography>
            {historical.length > 0 ? (
              <LineChart
                xAxis={[{ 
                  data: historical.map((_, i) => i),
                  scaleType: 'linear'
                }]}
                series={[
                  { 
                    data: historical.map(m => parseFloat(m.cpu_percent || 0)),
                    label: 'CPU %',
                    color: '#8884d8'
                  },
                  { 
                    data: historical.map(m => parseFloat(m.memory_percent || 0)),
                    label: 'Memory %',
                    color: '#82ca9d'
                  },
                  { 
                    data: historical.map(m => parseFloat(m.disk_percent || 0)),
                    label: 'Disk %',
                    color: '#ffc658'
                  }
                ]}
                height={400}
                slotProps={{
                  legend: {
                    hidden: false,
                    position: 'bottom'
                  }
                }}
              />
            ) : <Skeleton variant="rectangular" height={400} />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
