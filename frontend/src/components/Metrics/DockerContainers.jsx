import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

export const DockerContainers = ({ docker = [], isLoading, currentServer }) => {
  console.log("DEBUG: DockerContainers received:", docker);  // ✅ Log received data

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
        <Typography variant="h5" gutterBottom>Docker Containers</Typography>
        <List>
          {docker && docker.length > 0 ? (  // ✅ Properly check if docker is not empty
            docker.map((container, index) => (
              <ListItem key={index}>
                <ListItemText primary={container.name} />
              </ListItem>
            ))
          ) : (
            <Typography color="error">No running containers found.</Typography>  // ✅ Styled error message
          )}
        </List>
      </CardContent>
    </Card>
  );
};
