import { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Menu, MenuItem } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

export const ServerList = ({ servers = [], currentServer, setCurrentServer, handleRemoveServer }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);

  const handleContextMenu = (event, server) => {
    event.preventDefault();
    setSelectedServer(server);
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedServer(null);
  };

  return (
    <>
      <Divider sx={{ bgcolor: 'divider', my: 2 }} />
      <Typography variant="subtitle1" sx={{ px: 2 }}>Servers</Typography>
      <List>
        {servers.length === 0 ? (
          <Typography sx={{ px: 2 }}>No servers found</Typography>
        ) : (
          servers.map((server) => (
            <ListItem key={server.ip_address} disablePadding onContextMenu={(e) => handleContextMenu(e, server)}>
              <ListItemButton onClick={() => setCurrentServer(server)} selected={server.ip_address === currentServer?.ip_address}>
                <ListItemIcon><ComputerIcon /></ListItemIcon>
                <ListItemText primary={server.ip_address} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Right-click context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => { handleRemoveServer(selectedServer.ip_address); handleCloseMenu(); }}>
          Remove Server
        </MenuItem>
      </Menu>
    </>
  );
};
