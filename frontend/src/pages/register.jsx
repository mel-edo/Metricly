import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Attempting registration with:", { email });
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log("Registration response status:", response.status);
      const data = await response.json();
      console.log("Registration response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onRegisterSuccess();
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h5" gutterBottom align="center">
            Register
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRegister}
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
          <Box mt={2} textAlign="center">
            <Link href="/login" underline="hover">
              Already have an account? Login
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register; 