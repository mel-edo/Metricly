import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../theme';

export const ThemeCustomizer = ({ open, onClose }) => {
  const { customColors, updateCustomColors } = useTheme();
  const [colors, setColors] = useState(customColors);

  const handleColorChange = (type, shade, value) => {
    setColors(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [shade]: value
      }
    }));
  };

  const handleSave = () => {
    updateCustomColors(colors);
    onClose();
  };

  const handleReset = () => {
    setColors({
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Customize Theme</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Primary Color
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Light"
                value={colors.primary.light}
                onChange={(e) => handleColorChange('primary', 'light', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Main"
                value={colors.primary.main}
                onChange={(e) => handleColorChange('primary', 'main', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Dark"
                value={colors.primary.dark}
                onChange={(e) => handleColorChange('primary', 'dark', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom>
            Secondary Color
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Light"
                value={colors.secondary.light}
                onChange={(e) => handleColorChange('secondary', 'light', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Main"
                value={colors.secondary.main}
                onChange={(e) => handleColorChange('secondary', 'main', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Dark"
                value={colors.secondary.dark}
                onChange={(e) => handleColorChange('secondary', 'dark', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Reset to Default</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 