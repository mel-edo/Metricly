import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

export const ServerList = ({ servers, currentServer, setCurrentServer }) => (
  <>
    <Divider sx={{ bgcolor: 'divider', my: 2 }} />
    <Typography variant="subtitle1" sx={{ px: 2 }}>
      Servers
    </Typography>
    <List>
      {servers.map((server) => (
        <ListItem key={server.ip_address} disablePadding>
          <ListItemButton
            selected={currentServer?.ip_address === server.ip_address}
            onClick={() => setCurrentServer(server)}
          >
            <ListItemIcon><ComputerIcon /></ListItemIcon>
            <ListItemText primary={server.ip_address} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </>
);