import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert, Link, Paper, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with username:', username);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        console.error('Login failed:', data.error);
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      onLoginSuccess();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}15 25%, transparent 25%),
            linear-gradient(-45deg, ${theme.palette.primary.main}15 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${theme.palette.primary.main}15 75%),
            linear-gradient(-45deg, transparent 75%, ${theme.palette.primary.main}15 75%)`,
          backgroundSize: '20px 20px',
          opacity: 0.5,
          zIndex: 0,
        }}
      />
      
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '400px',
          mx: 2,
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(10px)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Welcome to Metricly
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Sign in to monitor your servers
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box 
          component="form" 
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleLogin(); 
          }}
          noValidate
        >
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
