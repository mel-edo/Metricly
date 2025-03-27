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
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentTab, setCurrentTab] = useState('dashboard');  // Add tab switching state

  const { system, docker, historical, isLoading } = useServerMetrics(currentServer);

  // Fetch initial server list
  useEffect(() => {
    fetch('/metrics/servers')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched servers:', data);
        setServers(data);
      })
      .catch(err => {
        console.error('Error fetching servers:', err);
        setError('Failed to fetch servers.');
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        setCurrentTab={setCurrentTab} 
        currentServer={currentServer}
      >
        {servers.length === 0 ? (
          <p>No servers available. Add a server or check API response.</p>
        ) : (
          <ServerList 
            servers={servers} 
            currentServer={currentServer} 
            setCurrentServer={setCurrentServer} 
          />
        )}
      </Sidebar>
      <Container>
        <Box>
          {/*Render Dashboard or Charts Based on Selected Tab */}
          {currentTab === 'dashboard' ? (
            <>
              <ServerForm onAddServer={(ip) => {
                fetch('/metrics/servers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ip_address: ip }),
                })
                .then(res => res.json())
                .then(data => setServers(data))
                .catch(err => console.error("Error adding server:", err));
              }} />
              <AlertsList alerts={alerts} />
              <SystemMetrics system={system} isLoading={isLoading} />
              <DockerContainers docker={docker} isLoading={isLoading} currentServer={currentServer} />
            </>
          ) : (
            <SystemCharts data={historical} system={system} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
