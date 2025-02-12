import { 
  Drawer, 
  Box, 
  Toolbar, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudIcon from '@mui/icons-material/Cloud';

// Main sidebar container
export const Sidebar = ({ mobileOpen, setMobileOpen, children }) => {
  const drawerWidth = 240;

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => setMobileOpen(false)}>
            <MenuIcon />
          </IconButton>
          {children}
        </Box>
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
        open
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          {children}
        </Box>
      </Drawer>
    </>
  );
};

// Navigation menu items
export const SidebarMenu = () => (
  <>
    <List>
      {['Dashboard', 'Docker Containers'].map((text, index) => (
        <ListItemButton key={text}>
          <ListItemIcon>
            {index % 2 === 0 ? <SpeedIcon /> : <CloudIcon />}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      ))}
    </List>
    <Divider sx={{ my: 2 }} />
  </>
);