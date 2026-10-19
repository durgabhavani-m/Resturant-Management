import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import { useStaff } from "../context/StaffContext";
import { useAuth } from "../context/AuthContext";


const LoginPage = () => {
  const { staff } = useStaff();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const activeStaff = staff.filter((member) => member.status === "Active");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const normalizedEmail = email.trim().toLowerCase();

    const selectedStaff = activeStaff.find(
      (member) => member.email.trim().toLowerCase() === normalizedEmail
    );

    if (!selectedStaff || selectedStaff.password !== password) {
      setLoginError("Email or password is incorrect, or this account is inactive.");
      return;
    }

    login({
      id: selectedStaff.id,
      name: selectedStaff.name,
      email: selectedStaff.email,
      role: selectedStaff.role,
    });

    if(selectedStaff.mustResetPassword){
      navigate("/reset-password?mode=first-time", {replace: true});
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        px: 2,
      }}
    >
      <Paper elevation={8} sx={{ width: "100%", maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              mx: "auto",
              mb: 2,
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VerifiedUserIcon fontSize="large" />
          </Box>
          <Typography variant="h1">RestruHub</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Restaurant Management System
          </Typography>
        </Box>

        {user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Signed in as <strong>{user.name}</strong>. Sign in with another staff account to switch.
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@restaurant.com"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            required
            type="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          {loginError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {loginError}
            </Alert>
          )}

          <Box sx={{display:"flex", justifyContent: "flex-end", mt:1}}>
            <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover":{textDecoration: "underline"},
            }}
            >
              Forgot Password?
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            disabled={!email.trim() || !password}
            sx={{ mt: 3 }}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
