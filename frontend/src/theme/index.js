import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1b26',
      paper: '#24283b',
    },
    primary: {
      main: '#7aa2f7',
    },
    secondary: {
      main: '#bb9af7',
    },
    error: {
      main: '#f7768e',
    },
    warning: {
      main: '#ff9e64',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px',
        },
      },
    },
  },
});