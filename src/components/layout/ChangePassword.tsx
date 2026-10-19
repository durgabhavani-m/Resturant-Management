import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    currentPassword: string,
    newPassword: string
  ) => boolean;
}

const ChangePassword = ({
  open,
  onClose,
  onSave,
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must differ from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const saved = onSave(currentPassword, newPassword);

    if (saved) {
      handleClose();
    } else {
      setError("Current password is incorrect or the password could not be updated.");
    }
  };

  const passwordField = (
    label: string,
    value: string,
    visible: boolean,
    setVisible: (value: boolean) => void,
    setValue: (value: string) => void
  ) => (
    <TextField
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      fullWidth
      autoComplete="new-password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={`Toggle ${label.toLowerCase()} visibility`}
              onClick={() => setVisible(!visible)}
              edge="end"
            >
              {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Change Password</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Enter your current password and choose a new password.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {passwordField(
            "Current Password",
            currentPassword,
            showCurrent,
            setShowCurrent,
            setCurrentPassword
          )}

          {passwordField(
            "New Password",
            newPassword,
            showNew,
            setShowNew,
            setNewPassword
          )}

          {passwordField(
            "Confirm New Password",
            confirmPassword,
            showConfirm,
            setShowConfirm,
            setConfirmPassword
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={<LockIcon />}
          onClick={handleSubmit}
        >
          Update Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;
