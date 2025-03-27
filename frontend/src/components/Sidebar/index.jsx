import { 
  Drawer, 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography 
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const Sidebar = ({ mobileOpen, setMobileOpen, children, setCurrentTab, currentServer }) => {
  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': { width: drawerWidth, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
      }}
      open
    >
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, mt: 1 }}>
          Dashboard
        </Typography>
        <List>
          {/* ✅ Use setCurrentTab instead of setPage */}
          <ListItemButton onClick={() => setCurrentTab('dashboard')}>
            <ListItemIcon><ComputerIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton onClick={() => setCurrentTab('charts')}>
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Charts" />
          </ListItemButton>
        </List>
        {children}
      </Box>

      {/* ✅ Show Selected Server in Bottom-Left */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
        {currentServer ? (
          <>
            <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
            <Typography variant="body2">{currentServer.ip_address}</Typography>
          </>
        ) : (
          <Typography variant="body2" color="textSecondary">No server selected</Typography>
        )}
      </Box>
    </Drawer>
  );
};
