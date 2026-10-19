import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useStaff } from "../context/StaffContext";

const SERVICE_ID = "service_qvign7g";
const TEMPLATE_ID = "template_h7moofn";
const PUBLIC_KEY = "-V8JLH2rrqpisLs9Z";

const RESET_STORAGE_KEY = "restaurant_demo_password_reset";
const RESET_EXPIRY_MS = 15 * 60 * 1000;

type DemoResetRecord = {
  email: string;
  token: string;
  expiresAt: number;
};

const ForgotPassword = () => {
  const { staff } = useStaff();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const matchingStaff = staff.find(
        (member) =>
          member.email.trim().toLowerCase() === normalizedEmail &&
          member.status === "Active"
      );

      // Use the same response for unknown and known addresses.
      if (matchingStaff) {
        const token = crypto.randomUUID();

        const resetRecord: DemoResetRecord = {
          email: normalizedEmail,
          token,
          expiresAt: Date.now() + RESET_EXPIRY_MS,
        };

        localStorage.setItem(
          RESET_STORAGE_KEY,
          JSON.stringify(resetRecord)
        );

        console.log(
  "Saved reset record:",
  localStorage.getItem(RESET_STORAGE_KEY) !== null
);

console.log("Request origin:", window.location.origin);

        const resetUrl = new URL(
          "/reset-password",
          window.location.origin
        );

        resetUrl.searchParams.set("token", token);

        console.log("Reset URL generated:", resetUrl?.toString());
        

        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            to_email: matchingStaff.email,
            reset_link: resetUrl.toString(),
          },
          { publicKey: PUBLIC_KEY }
        );
      }

      setMessage(
        "If an active account matches that email, a reset link has been sent. Please check your inbox."
      );
    } catch (sendError) {
      console.error("Failed to send reset email:", sendError);
      setError(
        "Unable to send the reset email. Please try again."
      );
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
          Forgot Password?
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter your registered email address. We will send you a
          link to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            type="email"
            label="Registered Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </Box>

        <Button
          component={Link}
          to="/login"
          fullWidth
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
