import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid2";

import type {
  Staff,
  StaffRole,
  StaffStatus,
} from "../../types/staff";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

interface StaffDialogsProps {
  selectedStaff: Staff | null;

  showForm: boolean;

  editingStaff: Staff | null;

  name: string;
  email: string;
  phone: string;

  formRole: StaffRole;
  formStatus: StaffStatus;

  formErrors: FormErrors;

  onCloseDetails: () => void;

  onCloseForm: () => void;

  onNameChange: (value: string) => void;

  onEmailChange: (value: string) => void;

  onPhoneChange: (value: string) => void;

  onRoleChange: (value: StaffRole) => void;

  onStatusChange: (value: StaffStatus) => void;

  onSave: () => void;
}

const StaffDialogs = ({
  selectedStaff,
  showForm,
  editingStaff,
  name,
  email,
  phone,
  formRole,
  formStatus,
  formErrors,
  onCloseDetails,
  onCloseForm,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onRoleChange,
  onStatusChange,
  onSave,
}: StaffDialogsProps) => {
  const getInitials = (staffName: string) => {
    return staffName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusChipSx = (
    status: StaffStatus
  ) => {
    switch (status) {
      case "Active":
        return {
          bgcolor: "#ecfdf5",
          color: "#047857",
        };

      case "Inactive":
        return {
          bgcolor: "#f1f5f9",
          color: "#475569",
        };

      default:
        return {
          bgcolor: "#f8fafc",
          color: "#334155",
        };
    }
  };

  return (
    <>
      <Dialog
        open={Boolean(selectedStaff)}
        onClose={onCloseDetails}
        fullWidth
        maxWidth="xs"
      >
        {selectedStaff && (
          <>
            <DialogTitle>
              Staff Details
            </DialogTitle>

            <DialogContent dividers>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(
                    selectedStaff.name
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600}>
                    {selectedStaff.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {selectedStaff.role}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Email
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5 }}
                  >
                    {selectedStaff.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Phone
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5 }}
                  >
                    {selectedStaff.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Status
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={
                        selectedStaff.status
                      }
                      size="small"
                      sx={getStatusChipSx(
                        selectedStaff.status
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                variant="outlined"
                onClick={onCloseDetails}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={showForm}
        onClose={onCloseForm}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingStaff
            ? "Edit Staff"
            : "Add Staff"}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontWeight: 400,
            }}
          >
            {editingStaff
              ? "Update staff member information."
              : "Add a new staff member to your restaurant."}
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            pt: 2,
          }}
        >
          {/* Name */}
          <TextField
            fullWidth
            label="Name * "
            value={name}
            onChange={(event) =>
              onNameChange(
                event.target.value
              )
            }
            placeholder="Enter staff name"
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
          />

          {/* Email */}
          <TextField
            fullWidth
            type="email"
            label="Email * "
            value={email}
            onChange={(event) =>
              onEmailChange(
                event.target.value
              )
            }
            placeholder="staff@example.com"
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
          />

          {/* Phone */}
          <TextField
            fullWidth
            type="tel"
            label="Phone * "
            value={phone}
            onChange={(event) =>
              onPhoneChange(
                event.target.value
              )
            }
            placeholder="Enter phone number"
            error={Boolean(formErrors.phone)}
            helperText={formErrors.phone}
          />

          {/* Role + Status */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Role * "
                value={formRole}
                onChange={(event) =>
                  onRoleChange(
                    event.target.value as StaffRole
                  )
                }
              >
                <MenuItem value="Admin">
                  Admin
                </MenuItem>

                <MenuItem value="Dine-in Staff">
                  Dine-in Staff
                </MenuItem>

                <MenuItem value="Counter Staff">
                  Counter Staff
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Status * "
                value={formStatus}
                onChange={(event) =>
                  onStatusChange(
                    event.target.value as StaffStatus
                  )
                }
              >
                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onCloseForm}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onSave}
          >
            {editingStaff
              ? "Update Staff"
              : "Add Staff"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffDialogs;