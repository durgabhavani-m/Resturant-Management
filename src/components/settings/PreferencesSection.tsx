import {
  Alert,
  Box,
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
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import type {
  AppPreferences,
  HistoryDateRange,
} from "../../context/AppPreferencesContext";

import { useAppTheme } from "./ThemeContext";

interface Props {
  preferenceForm: AppPreferences;
  updatePreference: <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => void;
}

export default function PreferencesSection({
  preferenceForm,
  updatePreference,
}: Props) {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Paper
      id="preferences"
      component="section"
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        scrollMarginTop: 16,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <TuneOutlinedIcon color="primary" fontSize="small" />

        <Box>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Preferences
          </Typography>

          <Typography
            sx={{ fontSize: "0.75rem", color: "text.secondary" }}
          >
            Choose defaults for supported workflows
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.75 }} />

      <Stack spacing={1.5}>
        {/* Confirm before deleting */}
        <FormControlLabel
          sx={{ alignItems: "flex-start", m: 0 }}
          control={
            <Switch
              size="small"
              checked={preferenceForm.confirmBeforeDelete}
              onChange={(e) =>
                updatePreference(
                  "confirmBeforeDelete",
                  e.target.checked
                )
              }
            />
          }
          label={
            <Box>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Confirm before deleting records
              </Typography>

              <Typography
                sx={{ fontSize: "0.73rem", color: "text.secondary" }}
              >
                Ask for confirmation before deleting supported records.
              </Typography>
            </Box>
          }
        />

        {/* Default history date range */}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Default history date range"
              value={preferenceForm.defaultHistoryDateRange}
              onChange={(e) =>
                updatePreference(
                  "defaultHistoryDateRange",
                  e.target.value as HistoryDateRange
                )
              }
              sx={{
                maxWidth: 320,
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiInputLabel-root": { fontSize: "0.8rem" },
              }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
              <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Notification information */}
        <Alert
          severity="info"
          sx={{ fontSize: "0.75rem", py: 0 }}
        >
          Notification delivery and quantity-based stock alerts are not
          currently supported by this application.
        </Alert>

        <Divider />

        {/* Appearance / Theme */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            {mode === "light" ? (
              <LightModeOutlinedIcon color="primary" />
            ) : (
              <DarkModeOutlinedIcon color="primary" />
            )}

            <Box>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Appearance
              </Typography>

              <Typography
                sx={{ fontSize: "0.73rem", color: "text.secondary" }}
              >
                Choose your preferred application theme.
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                size="small"
                checked={mode === "dark"}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label={mode === "dark" ? "Dark" : "Light"}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
