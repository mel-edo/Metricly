import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const isValidIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

export const ServerForm = ({ open, onClose, onAddServer }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!ipAddress.trim()) {
      setError('IP address is required');
      return;
    }

    if (!isValidIP(ipAddress.trim())) {
      setError('Invalid IP address format');
      return;
    }

    onAddServer(ipAddress.trim());
    setIpAddress('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add New Server</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Server IP Address"
            variant="outlined"
            value={ipAddress}
            onChange={(e) => {
              setIpAddress(e.target.value);
              setError('');
            }}
            placeholder="192.168.1.1"
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the IP address of the server you want to monitor. Make sure the server has the Metricly agent installed and running.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!ipAddress.trim()}
        >
          Add Server
        </Button>
      </DialogActions>
    </Dialog>
  );
};