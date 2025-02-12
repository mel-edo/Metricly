import { Alert, AlertTitle, Grid } from '@mui/material';

export const AlertsList = ({ alerts, setAlerts }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    {alerts.map((alert, index) => (
      <Grid item xs={12} key={index}>
        <Alert
          severity="error"
          onClose={() => setAlerts(prev => prev.filter((_, i) => i !== index))}
        >
          <AlertTitle>Alert</AlertTitle>
          {alert}
        </Alert>
      </Grid>
    ))}
  </Grid>
);