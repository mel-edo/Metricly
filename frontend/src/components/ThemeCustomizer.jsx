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
  Paper,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../theme';
import { SketchPicker } from 'react-color';

export const ThemeCustomizer = ({ open, onClose }) => {
  const { customColors, updateCustomColors } = useTheme();
  const [colors, setColors] = useState(customColors);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const handleColorChange = (type, shade, value) => {
    setColors(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [shade]: value
      }
    }));
  };

  const handleColorPickerChange = (color) => {
    if (selectedColor) {
      const [type, shade] = selectedColor.split('-');
      handleColorChange(type, shade, color.hex);
      setShowColorPicker(null);
      setSelectedColor(null);
    }
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

  const colorExplanations = {
    primary: {
      main: 'Main brand color used for primary actions and key UI elements',
      light: 'Lighter shade used for hover states and secondary elements',
      dark: 'Darker shade used for active states and emphasis',
    },
    secondary: {
      main: 'Secondary brand color used for alternative actions and accents',
      light: 'Lighter shade used for hover states and secondary elements',
      dark: 'Darker shade used for active states and emphasis',
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          {['primary', 'secondary'].map((type) => (
            <Box key={type} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {type} Colors
              </Typography>
              <Grid container spacing={2}>
                {['light', 'main', 'dark'].map((shade) => (
                  <Grid item xs={12} md={4} key={shade}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {shade}
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 40,
                          backgroundColor: colors[type][shade],
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                        onClick={() => {
                          setSelectedColor(`${type}-${shade}`);
                          setShowColorPicker(true);
                        }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={colors[type][shade]}
                        onChange={(e) => handleColorChange(type, shade, e.target.value)}
                        InputProps={{
                          startAdornment: ''
                        }}
                      />
                      <Tooltip title={colorExplanations[type][shade]}>
                        <Typography variant="caption" color="text.secondary" align="center">
                          {colorExplanations[type][shade]}
                        </Typography>
                      </Tooltip>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Reset to Default</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>

      {showColorPicker && (
        <Dialog
          open={showColorPicker}
          onClose={() => {
            setShowColorPicker(null);
            setSelectedColor(null);
          }}
          PaperProps={{
            sx: {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }
          }}
        >
          <DialogContent>
            <SketchPicker
              color={colors[selectedColor.split('-')[0]][selectedColor.split('-')[1]]}
              onChange={handleColorPickerChange}
              disableAlpha
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}; 