import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { Reservation, ReservationStatus } from "../../types/reservation";
import type { TimeSlot } from "../../context/TimeSlotContext";

interface SelectableTable {
  id: string;
  tableNumber: number;
  section: string;
  capacity: number;
  status: string;
}

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

  selectableTables: SelectableTable[];
  timeSlots: TimeSlot[];

  onCustomerNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onGuestsChange: (value: string) => void;
  onTableChange: (
    nextTableSection: string,
    nextTableNumber: string,
  ) => void;

  onCloseForm: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCloseDetails: () => void;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusColor(
  status: ReservationStatus,
): "success" | "warning" | "info" | "error" | "primary" | "default" {
  switch (status) {
    case "Confirmed":
      return "success";
    case "Pending":
      return "warning";
    case "Seated":
      return "primary";
    case "Completed":
      return "info";
    case "Cancelled":
    case "No-show":
      return "error";
    default:
      return "default";
  }
}

export default function ReservationDialogs({
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
  timeSlots,
  onCustomerNameChange,
  onPhoneChange,
  onDateChange,
  onTimeChange,
  onGuestsChange,
  onTableChange,
  onCloseForm,
  onSubmit,
  onCloseDetails,
}: ReservationDialogsProps) {
  console.log("Dialog open:", showForm);
console.log("Received time slots:", timeSlots);
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <>
      {/* Add/Edit Reservation Dialog */}
      <Dialog
        open={showForm}
        onClose={onCloseForm}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={onSubmit}>
          <DialogTitle>
            {editingReservation ? "Edit Reservation" : "Add Reservation"}
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Customer Name"
              fullWidth
              required
              margin="normal"
              value={customerName}
              onChange={(event) =>
                onCustomerNameChange(event.target.value)
              }
            />

            <TextField
              label="Phone Number"
              type="tel"
              fullWidth
              required
              margin="normal"
              value={phone}
              inputProps={{
                inputMode: "numeric",
                maxLength: 10,
                pattern: "[0-9]{10}",
              }}
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                onPhoneChange(digits);
              }}
              helperText="Enter exactly 10 digits"
            />

            <TextField
              label="Reservation Date"
              type="date"
              fullWidth
              required
              margin="normal"
              value={date}
              inputProps={{ min: getTodayDate() }}
              onChange={(event) => onDateChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Time Slot"
              fullWidth
              required
              margin="normal"
              value={time}
              onChange={(event) => onTimeChange(event.target.value)}
              helperText="Choose an active reservation time slot"
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot.id} value={slot.startTime}>
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </MenuItem>
              ))}

              {time &&
                !timeSlots.some((slot) => slot.startTime === time) && (
                  <MenuItem value={time}>
                    {formatTime(time)} (existing reservation)
                  </MenuItem>
                )}
            </TextField>

            <TextField
              label="Number of Guests"
              type="number"
              fullWidth
              required
              margin="normal"
              value={guests}
              inputProps={{ min: 1, step: 1 }}
              onChange={(event) =>
                onGuestsChange(event.target.value)
              }
            />

            <TextField
              select
              label="Table"
              fullWidth
              required
              margin="normal"
              value={
                tableNumber && tableSection
                  ? `${tableSection}::${tableNumber}`
                  : ""
              }
              onChange={(event) => {
                const [nextTableSection, nextTableNumber] = 
                event.target.value.split("::");

                if(nextTableSection && nextTableNumber){
                  onTableChange(nextTableSection, nextTableNumber);
                }
              }}
            >
              {selectableTables.map((table) => (
                <MenuItem
                  key={table.id}
                  value={`${table.section}::${table.tableNumber}`}
                >
                  Table {table.tableNumber} — {table.section} (Capacity:{" "}
                  {table.capacity})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>

          <DialogActions>
            <Button onClick={onCloseForm}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingReservation ? "Save Changes" : "Add Reservation"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reservation Details Dialog */}
      <Dialog
        open={Boolean(selectedReservation)}
        onClose={onCloseDetails}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reservation Details</DialogTitle>

        <DialogContent dividers>
          {selectedReservation && (
            <>
              <Typography sx={{ mb: 1 }}>
                <strong>Customer:</strong>{" "}
                {selectedReservation.customerName}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Phone:</strong> {selectedReservation.phone}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Date:</strong> {selectedReservation.date}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Time:</strong>{" "}
                {(() => {
                  const slot = timeSlots.find(
                    (item) =>
                      item.startTime === selectedReservation.time,
                  );

                  return slot
                    ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
                    : formatTime(selectedReservation.time);
                })()}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Guests:</strong> {selectedReservation.guests}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Table:</strong> {selectedReservation.tableNumber}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Section:</strong> {selectedReservation.tableSection}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Status:</strong>{" "}
                {selectedReservation.status}
              </Typography>

              <Typography color="text.secondary" variant="caption">
                Status color: {getStatusColor(selectedReservation.status)}
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
