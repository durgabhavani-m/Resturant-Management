
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useStaff } from "../context/StaffContext";
import { useAuth } from "../context/AuthContext";

const RESET_STORAGE_KEY = "restaurant_demo_password_reset";

type DemoResetRecord = {
  email: string;
  token: string;
  expiresAt: number;
};

const ResetPasswordPage = () => {
  const { staff, updateStaff } = useStaff();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const isFirstTimeSetup =
    searchParams.get("mode") === "first-time";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      let targetStaff = undefined;

      if (isFirstTimeSetup) {
        if (!user) {
          setError("Please log in again to set your password.");
          return;
        }

        targetStaff = staff.find(
          (member) =>
            member.id === user.id &&
            member.email.trim().toLowerCase() ===
              user.email.trim().toLowerCase() &&
            member.status === "Active"
        );

        if (!targetStaff || !targetStaff.mustResetPassword) {
          setError(
            "First-time password setup is not available for this account."
          );
          return;
        }
      } else {
        if (!token) {
          setError(
            "The reset link is invalid. Please request a new one."
          );
          return;
        }

        // Read the reset record at the time the form is submitted.
        const storedValue = localStorage.getItem(RESET_STORAGE_KEY);

        if (!storedValue) {
          setError(
            "The reset information is missing from this browser. Please request a new reset email using this same browser."
          );
          return;
        }

        let resetRecord: DemoResetRecord;

        try {
          resetRecord = JSON.parse(storedValue) as DemoResetRecord;
        } catch {
          localStorage.removeItem(RESET_STORAGE_KEY);
          setError(
            "The reset information is invalid. Please request a new link."
          );
          return;
        }

        if (
          !resetRecord.email ||
          !resetRecord.token ||
          typeof resetRecord.expiresAt !== "number" ||
          resetRecord.token !== token ||
          resetRecord.expiresAt <= Date.now()
        ) {
          localStorage.removeItem(RESET_STORAGE_KEY);
          setError(
            "This reset link is invalid or expired. Please request a new one."
          );
          return;
        }

        targetStaff = staff.find(
          (member) =>
            member.email.trim().toLowerCase() ===
              resetRecord.email.trim().toLowerCase() &&
            member.status === "Active"
        );

        if (!targetStaff) {
          setError("Staff account not found or inactive.");
          return;
        }
      }

      const updated = updateStaff({
        ...targetStaff,
        password,
        passwordSet: true,
        mustResetPassword: false,
      });

      if (!updated) {
        setError("Unable to update your password. Please try again.");
        return;
      }

      if (isFirstTimeSetup) {
        navigate("/dashboard", { replace: true });
      } else {
        localStorage.removeItem(RESET_STORAGE_KEY);
        navigate("/login", {
          replace: true,
          state: { passwordResetSuccess: true },
        });
      }
    } catch (resetError) {
      console.error("Password reset failed:", resetError);
      setError("Unable to reset your password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        py: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {isFirstTimeSetup ? "Set Your Password" : "Reset Password"}
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {isFirstTimeSetup
            ? "Create a permanent password for your account."
            : "Enter your new password and confirm it below."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            required
            type="password"
            label="New Password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            inputProps={{ minLength: 8 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            type="password"
            label="Confirm New Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            inputProps={{ minLength: 8 }}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Save Password"}
          </Button>
        </Box>

        {!isFirstTimeSetup && (
          <Button
            component={Link}
            to="/login"
            fullWidth
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
