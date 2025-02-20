import { 
  Drawer, 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography 
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

export const Sidebar = ({ mobileOpen, setMobileOpen, children }) => {
  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': { width: drawerWidth },
      }}
      open
    >
      <Box sx={{ overflow: 'auto', pt: 2 }}>  {/* ✅ Removed extra spacing */}
        <Typography variant="h6" sx={{ px: 2, mt: 1 }}>  {/* ✅ Optional Title */}
          Dashboard
        </Typography>
        {/* <Divider sx={{ mb: 1 }} />  ✅ Adjust spacing */}
        {children}
      </Box>
    </Drawer>
  );
};
