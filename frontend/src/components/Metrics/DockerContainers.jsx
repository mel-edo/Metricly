import { 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Skeleton,
  Box 
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

export const DockerContainers = ({ docker, isLoading, currentServer }) => {
  const handleContainerAction = async (action, containerName) => {
    try {
      const response = await fetch(
        `/api/containers/${containerName}/${action}?server=${currentServer.ip_address}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Action failed');
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Skeleton width="40%" />
          </Typography>
          <List>
            {[1, 2, 3].map((i) => (
              <ListItem key={i}>
                <Skeleton variant="rectangular" width="100%" height={80} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Docker Containers
        </Typography>
        <List>
          {docker.map((container, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>{container.name}</Typography>
                    <IconButton 
                      onClick={() => handleContainerAction('restart', container.name)}
                      size="small"
                    >
                      <RestartAltIcon color="warning" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleContainerAction('stop', container.name)}
                      size="small"
                    >
                      <StopCircleIcon color="error" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleContainerAction('start', container.name)}
                      size="small"
                    >
                      <PlayCircleIcon color="success" />
                    </IconButton>
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">CPU: {container.cpu_percent}</Typography>
                    <Typography variant="body2">Memory: {container.memory_usage}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};