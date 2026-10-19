import type { FormEvent } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import type { Reservation, ReservationStatus } from "../../types/reservation";

const getStatusColor = (
  status: ReservationStatus
): "success" | "warning" | "info" | "error" => {
  if (status === "Confirmed") return "success";
  if (status === "Pending") return "warning";
  if (status === "Completed") return "info";
  return "error";
};

interface ReservationDialogsProps {
  showForm: boolean;
  editingReservation: Reservation | null;
  selectedReservation: Reservation | null;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  tableNumber: string;
  tableSection: string;
  selectableTables: Array<{
    id: string;
    tableNumber: number;
    section: string;
    capacity: number;
    status: string;
  }>;
  onCloseForm: () => void;
  onCloseDetails: () => void;
  onCustomerNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onGuestsChange: (value: string) => void;
  onTableChange: (tableSection: string, tableNumber: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const ReservationDialogs = ({
  showForm,
  editingReservation,
  selectedReservation,
  customerName,
  phone,
  date,
  time,
  guests,
  tableNumber,
  tableSection,
  selectableTables,
  onCloseForm,
  onCloseDetails,
  onCustomerNameChange,
  onPhoneChange,
  onDateChange,
  onTimeChange,
  onGuestsChange,
  onTableChange,
  onSubmit,
}: ReservationDialogsProps) => {
  return (
    <>
      <Dialog open={showForm} onClose={onCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h2">
              {editingReservation ? "Edit Reservation" : "Add Reservation"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {editingReservation
                ? "Update reservation information"
                : "Create a new resturnat reservation"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCloseForm} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={onSubmit}>
          <DialogContent
            dividers
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Customer Name"
              fullWidth
              required
              value={customerName}
              placeholder="Enter customer name..."
              onChange={(event) => onCustomerNameChange(event.target.value)}
            />

            <TextField
              label="Phone"
              type="tel"
              fullWidth
              required
              value={phone}
              placeholder="Enter phone Number..."
              onChange={(event) => onPhoneChange(event.target.value)}
            />

            <TextField
              label="Date"
              type="date"
              fullWidth
              required
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Time"
              type="time"
              fullWidth
              required
              value={time}
              onChange={(event) => onTimeChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Number of Guests"
              type="number"
              fullWidth
              required
              inputProps={{ min: 1 }}
              value={guests}
              placeholder="Enter number of guests"
              onChange={(event) => onGuestsChange(event.target.value)}
            />

            {selectableTables.length > 0 ? (
              <TextField
                select
                label="Table Number"
                fullWidth
                required
                value={
                  tableNumber && tableSection ? `${tableSection}::${tableNumber}` : ""
                }
                onChange={(event) => {
                  const value = event.target.value;

                  if (!value) {
                    onTableChange("", "");
                    return;
                  }

                  const [selectedSection, selectedNumber] = value.split("::");
                  onTableChange(selectedSection, selectedNumber);
                }}
              >
                <MenuItem value="">Select a table</MenuItem>
                {selectableTables.map((table) => (
                  <MenuItem
                    key={table.id}
                    value={`${table.section}::${table.tableNumber}`}
                  >
                    {table.section} · Table {table.tableNumber} · {table.capacity}{" "}
                    seats · {table.status}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Alert severity="warning">
                No tables have capacity for {guests || 0} guests.
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onCloseForm}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingReservation ? "Update Reservation" : "Add Reservation"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(selectedReservation)}
        onClose={onCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h2">Reservation Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Reservation information
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onCloseDetails}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {selectedReservation && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Customer
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                  {selectedReservation.customerName}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedReservation.phone}
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedReservation.date}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Time
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedReservation.time}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Guests
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedReservation.guests}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Table
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedReservation.tableNumber
                      ? `Table ${selectedReservation.tableNumber}`
                      : "Not assigned"}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedReservation.status}
                    size="small"
                    color={getStatusColor(selectedReservation.status)}
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
        )}

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onCloseDetails}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReservationDialogs;
