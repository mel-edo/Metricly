import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';

function App() {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [dockerMetrics, setDockerMetrics] = useState([]);

  useEffect(() => {
    // Fetch system metrics
    fetch('/metrics/system')
      .then((response) => response.json())
      .then((data) => setSystemMetrics(data))
      .catch((error) => console.error('Error fetching system metrics:', error));

    // Fetch Docker metrics
    fetch('/metrics/docker')
      .then((response) => response.json())
      .then((data) => setDockerMetrics(data))
      .catch((error) => console.error('Error fetching Docker metrics:', error));
  }, []);

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        Server Monitoring Tool
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h5">System Metrics</Typography>
          {systemMetrics ? (
            <List>
              <ListItem>
                <ListItemText primary="CPU Usage" secondary={systemMetrics.cpu_percent} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Memory Info" secondary={`Total: ${systemMetrics.memory_info.total}, Used: ${systemMetrics.memory_info.used}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Disk Usage" secondary={`Total: ${systemMetrics.disk_usage.total}, Used: ${systemMetrics.disk_usage.used}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Network Stats" secondary={`Bytes Sent: ${systemMetrics.network_stats.bytes_sent}, Bytes Received: ${systemMetrics.network_stats.bytes_recv}`} />
              </ListItem>
            </List>
          ) : (
            <p>Loading system metrics...</p>
          )}
        </CardContent>
      </Card>
      <Card style={{ marginTop: '20px' }}>
        <CardContent>
          <Typography variant="h5">Docker Metrics</Typography>
          {dockerMetrics.length > 0 ? (
            <List>
              {dockerMetrics.map((container, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={container.name}
                    secondary={`CPU: ${container.cpu_percent}, Memory: ${container.memory_usage}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <p>Loading Docker metrics...</p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;