import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Typography, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { SystemMetrics } from "./components/Metrics/SystemMetrics";
import { DockerContainers } from "./components/Metrics/DockerContainers";
import { MetricsHistory } from "./components/Metrics/MetricsHistory";
import Login from "./pages/login";
import Register from "./pages/register";
import { ThemeProvider, useTheme } from "./theme/index.jsx";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const DRAWER_WIDTH = 240;

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [docker, setDocker] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toggleTheme, isDarkMode } = useTheme();

  const handleApiError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    let errorMessage = "An unexpected error occurred";
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = "Your session has expired. Please log in again.";
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action.";
          break;
        case 404:
          errorMessage = "The requested resource was not found.";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = error.response.data?.error || `Error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    }
    
    setError(errorMessage);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchServers();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentServer) {
      fetchMetrics();
    }
  }, [currentServer]);

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch servers: ${response.statusText}`);
      }

      const data = await response.json();
      setServers(data);
      if (data.length > 0) {
        setCurrentServer(data[0]);
      }
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      handleApiError(error, "fetchServers");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (!currentServer) return;

    setMetricsLoading(true);
    try {
      const [systemResponse, dockerResponse] = await Promise.all([
        fetch(`/api/system?server=${currentServer.ip_address}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`/api/docker?server=${currentServer.ip_address}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (!systemResponse.ok || !dockerResponse.ok) {
        throw new Error(
          `Failed to fetch metrics: ${systemResponse.statusText || dockerResponse.statusText}`
        );
      }

      const [systemData, dockerData] = await Promise.all([
        systemResponse.json(),
        dockerResponse.json(),
      ]);

      // Helper function to convert human-readable size to bytes
      const convertToBytes = (sizeStr) => {
        if (!sizeStr || typeof sizeStr !== 'string') return 0;
        const [value, unit] = sizeStr.split(' ');
        const numValue = parseFloat(value);
        const multipliers = {
          'B': 1,
          'KB': 1024,
          'MB': 1024 * 1024,
          'GB': 1024 * 1024 * 1024,
          'TB': 1024 * 1024 * 1024 * 1024
        };
        return numValue * multipliers[unit] || 0;
      };

      // Process system metrics
      const metrics = {
        cpu_percent: systemData.cpu_percent || 0,
        memory_percent: systemData.memory_info?.percent || 0,
        memory_used: systemData.memory_info?.used || 0,
        memory_total: systemData.memory_info?.total || 0,
        disks: systemData.disk_usage ? Object.entries(systemData.disk_usage).map(([mount, usage]) => ({
          mount,
          percent: usage.percent,
          used: usage.used,
          total: usage.total
        })) : [],
        disk_percent: systemData.disk_usage?.root?.percent || 0,
        disk_used: systemData.disk_usage?.root?.used || 0,
        disk_total: systemData.disk_usage?.root?.total || 0
      };

      setMetrics(metrics);
      setDocker(dockerData);
      setError(null);
    } catch (error) {
      handleApiError(error, "fetchMetrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleRemoveServer = async (ip) => {
    try {
      const response = await fetch(`/api/servers/${ip}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove server: ${response.statusText}`);
      }

      const updatedServers = servers.filter((s) => s.ip_address !== ip);
      setServers(updatedServers);

      if (currentServer?.ip_address === ip) {
        setCurrentServer(updatedServers[0] || null);
      }

      if (updatedServers.length === 0) {
        setMetrics(null);
        setDocker([]);
      }
      setError(null);
    } catch (error) {
      handleApiError(error, "handleRemoveServer");
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {isAuthenticated && (
          <Sidebar
            servers={servers}
            currentServer={currentServer}
            onServerSelect={setCurrentServer}
            onServerRemove={handleRemoveServer}
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            ...(isAuthenticated ? {
              width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` },
              ml: { xs: 0, sm: `${DRAWER_WIDTH}px` },
              position: 'relative',
              left: { xs: 0, sm: '-8px' },
            } : {
              width: '100%',
            }),
          }}
        >
          {isAuthenticated && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                px: 3,
                py: 2,
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                backgroundColor: 'background.default',
                borderBottom: 1,
                borderColor: 'divider',
                width: '100%',
              }}
            >
              <Typography variant="h4" component="h1">
                Dashboard
              </Typography>
              <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
                <IconButton onClick={toggleTheme} color="inherit">
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ p: isAuthenticated ? 3 : 0, flexGrow: 1 }}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Container maxWidth="xl">
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <SystemMetrics
                            metrics={metrics}
                            isLoading={metricsLoading}
                            currentServer={currentServer}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <MetricsHistory
                            server={currentServer}
                            metrics={metrics}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <DockerContainers
                            docker={docker}
                            isLoading={metricsLoading}
                            currentServer={currentServer}
                          />
                        </Grid>
                      </Grid>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  !isAuthenticated ? (
                    <Login onLoginSuccess={fetchServers} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  !isAuthenticated ? (
                    <Register onRegisterSuccess={() => {
                      // After successful registration, redirect to login
                      navigate("/login");
                    }} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
