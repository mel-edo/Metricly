import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 
import { CssBaseline } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#b4befe',
        },
        background: {
            default: '#181825',
        },
        text: {
            primary: '#cdd6f4',
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
  </React.StrictMode>
);