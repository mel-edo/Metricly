import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert, Link, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      onLoginSuccess();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
    setLoading(false);
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
        
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
          <Box textAlign="center">
            <Link href="/register" underline="hover" sx={{ color: "primary.main" }}>
              Don't have an account? Register
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
