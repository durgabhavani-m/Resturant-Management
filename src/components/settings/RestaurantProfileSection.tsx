
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import type {
  OpeningDay,
  OpeningHours,
  RestaurantSettings,
} from "../../context/ResturantContext";

export const days: OpeningDay[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const fieldSx = {
  "& .MuiInputBase-root": { fontSize: "0.8rem" },
  "& .MuiInputLabel-root": { fontSize: "0.8rem" },
  "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
};

interface Props {
  form: RestaurantSettings;
  updateField: <K extends keyof RestaurantSettings>(
    field: K,
    value: RestaurantSettings[K]
  ) => void;
  updateHours: (day: OpeningDay, patch: Partial<OpeningHours>) => void;
  copyFromDay: OpeningDay;
  setCopyFromDay: (day: OpeningDay) => void;
  handleCopyHours: () => void;
  handleApplyHoursToOpenDays: () => void;
}

export default function RestaurantProfileSection({
  form,
  updateField,
  updateHours,
  copyFromDay,
  setCopyFromDay,
  handleCopyHours,
  handleApplyHoursToOpenDays,
}: Props) {
  return (
    <Paper
      id="restaurant-profile"
      component="section"
      variant="outlined"
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, scrollMarginTop: 16 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <StorefrontOutlinedIcon color="primary" fontSize="small" />
        <Box>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Restaurant Profile
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            Restaurant contact details and opening hours
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.75 }} />

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" label="Restaurant name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label="Logo URL"
            value={form.logoUrl}
            onChange={(e) => updateField("logoUrl", e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" label="Phone" type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" label="Email" type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid size={12}>
          <TextField required fullWidth size="small" multiline minRows={2}
            label="Address" value={form.address}
            onChange={(e) => updateField("address", e.target.value)} sx={fieldSx} />
        </Grid>
      </Grid>

      {form.logoUrl && (
        <Box component="img" src={form.logoUrl} alt="Restaurant logo preview"
          sx={{ mt: 1.5, maxWidth: 120, maxHeight: 48, objectFit: "contain" }} />
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5, mb: 1 }}>
        <AccessTimeOutlinedIcon color="primary" fontSize="small" />
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>
          Weekly Opening Hours
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.25 }}>
        <TextField select size="small" label="Copy hours from"
          value={copyFromDay}
          onChange={(e) => setCopyFromDay(e.target.value as OpeningDay)}
          sx={{ ...fieldSx, minWidth: 145 }}>
          {days.map((day) => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </TextField>
        <Button size="small" variant="outlined" onClick={handleCopyHours}>
          Copy to all days
        </Button>
        <Button size="small" variant="outlined" onClick={handleApplyHoursToOpenDays}>
          Apply to open days
        </Button>
      </Box>

      <Stack spacing={0}>
        {days.map((day) => {
          const hours = form.openingHours[day];

          return (
            <Box key={day} sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "100px 85px minmax(100px, 1fr) minmax(100px, 1fr) 130px",
              },
              gap: 1,
              alignItems: "center",
              py: 0.5,
              borderBottom: 1,
              borderColor: "divider",
            }}>
              <Typography sx={{ fontSize: "0.77rem", fontWeight: 600 }}>
                {day}
              </Typography>

              <FormControlLabel
                sx={{ m: 0 }}
                control={<Switch size="small" checked={hours.open}
                  onChange={(e) => updateHours(day, { open: e.target.checked })} />}
                label={<Typography sx={{ fontSize: "0.72rem" }}>
                  {hours.open ? "Open" : "Closed"}
                </Typography>}
              />

              <TextField size="small" type="time" label="Opens"
                value={hours.openTime} disabled={!hours.open}
                onChange={(e) => updateHours(day, { openTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />

              <TextField size="small" type="time" label="Closes"
                value={hours.closeTime} disabled={!hours.open}
                onChange={(e) => updateHours(day, { closeTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />

              <FormControlLabel
                sx={{ m: 0, gridColumn: { xs: "2", sm: "auto" } }}
                control={<Checkbox size="small" checked={hours.overnight}
                  disabled={!hours.open}
                  onChange={(e) => updateHours(day, { overnight: e.target.checked })} />}
                label={<Typography sx={{ fontSize: "0.7rem" }}>
                  Closes next day
                </Typography>}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
