import { useState, useEffect } from 'react';
import { CssBaseline, Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { useServerMetrics } from './hooks/useServerMetrics';
import { AlertsList } from './components/Alerts/AlertsList';
import { ServerList } from './components/Sidebar/ServerList';
import { SystemCharts } from './components/Charts/SystemCharts';
import { SystemMetrics } from './components/Metrics/SystemMetrics';
import { DockerContainers } from './components/Metrics/DockerContainers';
import { ServerForm } from './components/ServerManagement/ServerForm';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const {
    system,
    docker,
    historical,
    alerts,
    isLoading,
    setMetrics
  } = useServerMetrics(currentServer);

  // Fetch initial server list
  useEffect(() => {
    fetch('/api/servers')
      .then(res => res.json())
      .then(setServers)
      .catch(console.error);
  }, []);

  const handleAddServer = (ip) => {
    fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_address: ip }),
    })
      .then(() => fetch('/api/servers'))
      .then(res => res.json())
      .then(setServers);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
        <ServerList
          servers={servers}
          currentServer={currentServer}
          setCurrentServer={setCurrentServer}
        />
      </Sidebar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="xl">
          {alerts.length > 0 && <AlertsList alerts={alerts} setAlerts={alerts => setMetrics(prev => ({ ...prev, alerts }))} />}
          
          <SystemCharts historical={historical} system={system} />
          <SystemMetrics system={system} isLoading={isLoading.system} />
          <DockerContainers 
            docker={docker} 
            isLoading={isLoading.docker}
            currentServer={currentServer}
          />
          <ServerForm onAddServer={handleAddServer} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}