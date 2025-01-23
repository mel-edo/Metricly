import React from 'react';
import { Box, AppBar, Toolbar, Typography, Grid, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Metricly Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          {/* CPU Metrics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">CPU Metrics</Typography>
              <Box>Chart or Data Here</Box>
            </Paper>
          </Grid>
          
          {/* Memory Metrics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Memory Metrics</Typography>
              <Box>Chart or Data Here</Box>
            </Paper>
          </Grid>

          {/* Add more sections as needed */}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
