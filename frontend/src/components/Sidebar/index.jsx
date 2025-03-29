import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Typography,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { ServerForm } from '../ServerManagement/ServerForm';
import { ThemeCustomizer } from '../ThemeCustomizer';
import { ServerList } from './ServerList';

const DRAWER_WIDTH = 240;

export const Sidebar = ({ servers, currentServer, onServerSelect, onServerRemove }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showServerForm, setShowServerForm] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          Metricly
        </Typography>
        <IconButton onClick={handleMenuOpen} size="small">
          <PersonIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={() => setShowServerForm(true)}
        >
          <IconButton
            color="primary"
            sx={{ mr: 1 }}
          >
            <AddIcon />
          </IconButton>
          <Typography variant="body1">Add New Server</Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={() => setShowThemeCustomizer(true)}
        >
          <IconButton
            color="primary"
            sx={{ mr: 1 }}
          >
            <PaletteIcon />
          </IconButton>
          <Typography variant="body1">Customize Theme</Typography>
        </Box>
      </Box>
      <Divider />
      <ServerList
        servers={servers}
        currentServer={currentServer}
        setCurrentServer={onServerSelect}
        handleRemoveServer={onServerRemove}
      />
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={handleLogout}
        >
          <IconButton color="error" sx={{ mr: 1 }}>
            <LogoutIcon />
          </IconButton>
          <Typography variant="body1" color="error">Logout</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box
        component="nav"
        sx={{ 
          width: { sm: DRAWER_WIDTH }, 
          flexShrink: { sm: 0 }
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH,
                borderRight: 0 // Remove right border
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH,
                borderRight: 0 // Remove right border
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      </Menu>

      {showServerForm && (
        <ServerForm
          open={showServerForm}
          onClose={() => setShowServerForm(false)}
        />
      )}

      {showThemeCustomizer && (
        <ThemeCustomizer
          open={showThemeCustomizer}
          onClose={() => setShowThemeCustomizer(false)}
        />
      )}
    </>
  );
};
