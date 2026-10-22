
import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import type { TimeSlot } from "../../context/TimeSlotContext";

interface Props {
  open: boolean;
  initialSlot: TimeSlot | null;
  existingSlots: TimeSlot[];
  onClose: () => void;
  onSave: (values: Omit<TimeSlot, "id">) => void;
}

export default function TimeSlotForm({
  open,
  initialSlot,
  existingSlots,
  onClose,
  onSave,
}: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setStartTime(initialSlot?.startTime ?? "");
    setEndTime(initialSlot?.endTime ?? "");
    setIsActive(initialSlot?.isActive ?? true);
    setError("");
  }, [open, initialSlot]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!startTime || !endTime) {
      setError("Please enter both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const conflicts = existingSlots.some((slot) => {
      if (slot.id === initialSlot?.id || !slot.isActive || !isActive) {
        return false;
      }

      return startTime < slot.endTime && endTime > slot.startTime;
    });

    if (conflicts) {
      setError("This time range overlaps with another active slot.");
      return;
    }

    onSave({ startTime, endTime, isActive });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialSlot ? "Edit Time Slot" : "Add Time Slot"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              Active slots are available for new reservations.
            </Alert>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setError("");
              }}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
                setError("");
              }}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  color="success"
                />
              }
              label={isActive ? "Active" : "Inactive"}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {initialSlot ? "Save Changes" : "Save Time Slot"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
