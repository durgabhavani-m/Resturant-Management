
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useTimeSlots, type TimeSlot } from "../../context/TimeSlotContext";
import TimeSlotForm from "./TimeSlotForm";

import { useNavigate } from "react-router-dom";

const RESERVATION_STORAGE_KEY = "reservation_customers";

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TimeSlotManagementPage() {
  const { slots, setSlots } = useTimeSlots();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");

  const openAddDialog = () => {
    setEditingSlot(null);
    setDialogOpen(true);
  };

  const openEditDialog = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setDialogOpen(true);
  };

  const handleSave = (values: Omit<TimeSlot, "id">) => {
    let reservations: Array<{ time?: string }> = [];

    try {
      reservations = JSON.parse(
        localStorage.getItem(RESERVATION_STORAGE_KEY) ?? "[]"
      );
    } catch {
      setMessage("Could not read existing reservations. Please try again.");
      return;
    }

    if (
      editingSlot &&
      editingSlot.startTime !== values.startTime &&
      reservations.some((reservation) => reservation.time === editingSlot.startTime)
    ) {
      setMessage(
        "This slot has existing reservations. Its start time cannot be changed. Create a new slot and deactivate this one instead."
      );
      return;
    }

    if (editingSlot) {
      setSlots((current) =>
        current.map((slot) =>
          slot.id === editingSlot.id ? { ...slot, ...values } : slot
        )
      );
    } else {
      setSlots((current) => [
        ...current,
        {
          id: `SLOT-${Date.now()}`,
          ...values,
        },
      ]);
    }

    setDialogOpen(false);
    setEditingSlot(null);
    setMessage("Time slot saved successfully.");
  };

  const handleToggle = (slot: TimeSlot) => {
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, isActive: !item.isActive } : item
      )
    );

    setMessage(
      slot.isActive
        ? "Slot deactivated. Existing reservations have been retained."
        : "Slot activated."
    );
  };

  const handleDelete = (slot: TimeSlot) => {
    let reservations: Array<{ time?: string }> = [];

    try {
      reservations = JSON.parse(
        localStorage.getItem(RESERVATION_STORAGE_KEY) ?? "[]"
      );
    } catch {
      setMessage("Could not read existing reservations. Please try again.");
      return;
    }

    const hasReservations = reservations.some(
      (reservation) => reservation.time === slot.startTime
    );

    if (hasReservations) {
      setMessage(
        "This slot has existing reservations and cannot be deleted. Deactivate it instead."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to delete this time slot?")) {
      return;
    }

    setSlots((current) => current.filter((item) => item.id !== slot.id));
    setMessage("Time slot deleted.");
  };

  const activeCount = slots.filter((slot) => slot.isActive).length;

  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate("/reservations")}
      sx={{ alignSelf: "flex-start" }}
    >
      Back to Reservations
    </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Time Slot Management
          </Typography>
          <Typography color="text.secondary">
            Manage the time ranges available for reservations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add Time Slot
        </Button>
      </Stack>

      {message && (
        <Alert
          severity={
            message.includes("cannot") ||
            message.includes("Could not")
              ? "warning"
              : "success"
          }
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total slots
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {slots.length}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active slots
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {activeCount}
          </Typography>
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{maxHeight: "400px", overflowY: "auto", overflowX: "hidden"}}>
        {slots.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No time slots yet. Select Add Time Slot to create one.
            </Typography>
          </Box>
        ) : (
          slots.map((slot) => (
            <Box
              key={slot.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </Typography>
                <Chip
                  size="small"
                  label={slot.isActive ? "Active" : "Inactive"}
                  color={slot.isActive ? "success" : "default"}
                  sx={{ mt: 0.75 }}
                />
              </Box>

              <Stack direction="row" alignItems="center">
                <Button
                  size="small"
                  onClick={() => handleToggle(slot)}
                >
                  {slot.isActive ? "Deactivate" : "Activate"}
                </Button>

                <IconButton
                  aria-label="Edit time slot"
                  onClick={() => openEditDialog(slot)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  aria-label="Delete time slot"
                  color="error"
                  onClick={() => handleDelete(slot)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            </Box>
          ))
        )}
        </Box>
      </Paper>

      <TimeSlotForm
        open={dialogOpen}
        initialSlot={editingSlot}
        existingSlots={slots}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
