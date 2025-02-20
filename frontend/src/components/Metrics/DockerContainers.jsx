import { Card, CardContent, Typography, List, ListItem, ListItemText, IconButton, Snackbar, Alert, Link } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';  // ✅ Import open icon
import { useState } from 'react';

export const DockerContainers = ({ docker = [], isLoading, currentServer }) => {
  const [alertMessage, setAlertMessage] = useState(null);

  const handleContainerAction = async (action, containerName) => {
    if (!currentServer) {
      setAlertMessage({ type: 'error', text: 'No server selected!' });
      return;
    }

    try {
      const response = await fetch(
        `/metrics/containers/${containerName}/${action}?server=${currentServer.ip_address}`,
        { method: 'POST' }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Action failed');

      setAlertMessage({ type: 'success', text: `Container ${action} successful!` });
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setAlertMessage({ type: 'error', text: `Failed to ${action} container.` });
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Loading Docker Containers...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">Docker Containers</Typography>
        <List>
          {docker.length > 0 ? (
            docker.map((container, index) => {
              // ✅ Find the first exposed port
              const firstPort = Object.keys(container.ports)[2] || null;
              const [portNumber] = firstPort ? firstPort.split('/') : [null];
              const openUrl = firstPort ? `http://${currentServer.ip_address}:${portNumber}` : null;

              return (
                <ListItem key={index} secondaryAction={
                  <>
                    <IconButton onClick={() => handleContainerAction('restart', container.name)}><RestartAltIcon /></IconButton>
                    <IconButton onClick={() => handleContainerAction('stop', container.name)}><StopCircleIcon /></IconButton>
                    <IconButton onClick={() => handleContainerAction('start', container.name)}><PlayCircleIcon /></IconButton>
                    {openUrl && (
                      <IconButton component={Link} href={openUrl} target="_blank" rel="noopener">
                        <OpenInNewIcon />
                      </IconButton>
                    )}
                  </>
                }>
                  <ListItemText 
                    primary={`${container.name} (${container.status})`} 
                    secondary={
                      <>
                        <Typography>CPU: {container.cpu_percent}%</Typography>
                        <Typography>Memory: {container.memory_usage} / {container.memory_limit}</Typography>
                        <Typography>Size: {container.size}</Typography>
                        <Typography>Image: {container.image}</Typography>
                        <Typography>Ports:</Typography>
                        {Object.entries(container.ports).map(([port, mappings]) => (
                          <Typography key={port}> - {port} → {mappings.join(", ")}</Typography>
                        ))}
                      </>
                    } 
                  />
                </ListItem>
              );
            })
          ) : (
            <Typography color="error">No running containers found.</Typography>
          )}
        </List>

        {/* ✅ Alert Snackbar for Success/Failure Messages */}
        {alertMessage && (
          <Snackbar 
            open={true} 
            autoHideDuration={3000} 
            onClose={() => setAlertMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={alertMessage.type} sx={{ width: '100%' }}>
              {alertMessage.text}
            </Alert>
          </Snackbar>
        )}
      </CardContent>
    </Card>
  );
};
