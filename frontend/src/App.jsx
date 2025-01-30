import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Drawer,
  ListItemButton,
  ListItemIcon,
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Button,
  Divider, // Add Divider import
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudIcon from "@mui/icons-material/Cloud";
import ComputerIcon from "@mui/icons-material/Computer"; // Add ComputerIcon for servers

const drawerWidth = 240;

function App() {
  const [servers, setServers] = useState([]);
  const [ipAddress, setIpAddress] = useState("");
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [dockerMetrics, setDockerMetrics] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState(null); // Track the current server

  useEffect(() => {
    fetch('/api/servers')
      .then((response) => response.json())
      .then((data) => setServers(data))
      .catch((error) => console.error('Error fetching servers:', error));
  }, []);

  const handleAddServer = () => {
    fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_address: ipAddress }),
    })
      .then((response) => response.json())
      .then((data) => {
        setServers([...servers, { ip_address: ipAddress }]);
        setIpAddress('');
      })
      .catch((error) => console.error('Error adding server:', error));
  };

  const handleSetCurrentServer = (server) => {
    setCurrentServer(server); // Set the current server
  };

  useEffect(() => {
    const fetchMetrics = () => {
      // Fetch system metrics
      fetch("/metrics/system")
        .then((response) => response.json())
        .then((data) => setSystemMetrics(data))
        .catch((error) =>
          console.error("Error fetching system metrics:", error)
        );

      // Fetch Docker metrics
      fetch("/metrics/docker")
        .then((response) => response.json())
        .then((data) => setDockerMetrics(data))
        .catch((error) =>
          console.error("Error fetching Docker metrics:", error)
        );
    };

    // Fetch metrics initially
    fetchMetrics();

    // Set interval to fetch metrics periodically
    const intervalId = setInterval(fetchMetrics, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        width: drawerWidth,
        bgcolor: "#1e1e2e",
        color: "#cdd6f4",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ textAlign: "center", mt: 2 }}>
        System Monitor
      </Typography>
      <List>
        {[
          { text: "CPU Usage", icon: <SpeedIcon /> },
          { text: "Memory", icon: <MemoryIcon /> },
          { text: "Disk Usage", icon: <StorageIcon /> },
          { text: "Docker Containers", icon: <CloudIcon /> },
        ].map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton>
              <ListItemIcon sx={{ color: "#cdd6f4" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Divider between main menu and servers */}
      <Divider sx={{ bgcolor: "#45475a", my: 2 }} />

      {/* Added Servers List */}
      <List sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ pl: 2, color: "#cdd6f4" }}>
          Servers
        </Typography>
        {servers.map((server, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => handleSetCurrentServer(server)}
              sx={{
                backgroundColor:
                  currentServer?.ip_address === server.ip_address
                    ? "#585b70"
                    : "inherit",
              }}
            >
              <ListItemIcon sx={{ color: "#cdd6f4" }}>
                <ComputerIcon />
              </ListItemIcon>
              <ListItemText primary={server.ip_address} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Current Server Display */}
      {currentServer && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#313244",
            color: "#cdd6f4",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle2">Current Server</Typography>
          <Typography variant="body2">{currentServer.ip_address}</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar for Mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#1e1e2e",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            System Monitor
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Container>
          <Typography variant="h4" align="center" gutterBottom>
            System Monitor
          </Typography>

          {/* System Metrics */}
          <Card sx={{ backgroundColor: "#1e1e2e", mb: 2 }}>
            <CardContent>
              <Typography variant="h5">System Metrics</Typography>
              {systemMetrics ? (
                <List>
                  <ListItem>
                    <ListItemText
                      primary="CPU Usage"
                      secondary={systemMetrics.cpu_percent}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Memory Info"
                      secondary={`Total: ${systemMetrics.memory_info.total}, Used: ${systemMetrics.memory_info.used}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Disk Usage"
                      secondary={`Total: ${systemMetrics.disk_usage.total}, Used: ${systemMetrics.disk_usage.used}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Network Stats"
                      secondary={`Bytes Sent: ${systemMetrics.network_stats.bytes_sent}, Bytes Received: ${systemMetrics.network_stats.bytes_recv}`}
                    />
                  </ListItem>
                </List>
              ) : (
                <p>Loading system metrics...</p>
              )}
            </CardContent>
          </Card>

          {/* Docker Metrics */}
          <Card sx={{ backgroundColor: "#1e1e2e", mb: 2 }}>
            <CardContent>
              <Typography variant="h5">Docker Metrics</Typography>
              {dockerMetrics.length > 0 ? (
                <List>
                  {dockerMetrics.map((container, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={container.name}
                        secondary={
                          <List>
                            <ListItem>
                              <ListItemText
                                primary="CPU Usage"
                                secondary={container.cpu_percent}
                                sx={{ color: "#cdd6f4" }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Memory Usage"
                                secondary={container.memory_usage}
                                sx={{ color: "#cdd6f4" }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Network Stats"
                                secondary={`Bytes Sent: ${container.network_io.rx_bytes}, Bytes Received: ${container.network_io.tx_bytes}`}
                                sx={{ color: "#cdd6f4" }}
                              />
                            </ListItem>
                          </List>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <p>Loading Docker metrics...</p>
              )}
            </CardContent>
          </Card>

          {/* Servers Section */}
          <Card sx={{ backgroundColor: "#1e1e2e", mb: 2 }}>
            <CardContent>
              <Typography variant="h5">Servers</Typography>
              <TextField
                label="IP Address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button variant="contained" onClick={handleAddServer}>
                Add Server
              </Button>
              <List>
                {servers.map((server, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={server.ip_address} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}

export default App;