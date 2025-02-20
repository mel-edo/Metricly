import { Alert, AlertTitle, Grid } from '@mui/material';

export const AlertsList = ({ alerts = [], setAlerts }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    {alerts.length === 0 ? (
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>No Alerts</AlertTitle>
          No active alerts at this time.
        </Alert>
      </Grid>
    ) : (
      alerts.map((alert, index) => (
        <Grid item xs={12} key={index}>
          <Alert
            severity="error"
            onClose={() => setAlerts(prev => prev.filter((_, i) => i !== index))}
          >
            <AlertTitle>Alert</AlertTitle>
            {alert}
          </Alert>
        </Grid>
      ))
    )}
  </Grid>
);
