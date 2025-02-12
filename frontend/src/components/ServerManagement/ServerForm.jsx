import { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';

export const ServerForm = ({ onAddServer }) => {
  const [ipAddress, setIpAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ipAddress.trim()) {
      onAddServer(ipAddress.trim());
      setIpAddress('');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Server
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Server IP Address"
            variant="outlined"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.1"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Server
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};