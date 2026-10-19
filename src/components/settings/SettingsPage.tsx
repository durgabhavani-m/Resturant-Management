import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import RestaurantProfileSection, {
  days,
} from "./RestaurantProfileSection";
import BillingTaxSection from "./BillingTaxSection";
import PreferencesSection from "./PreferencesSection";

import type {
  OpeningDay,
  OpeningHours,
  RestaurantSettings,
} from "../../context/ResturantContext";

import {
  useRestaurant,
} from "../../context/ResturantContext";


import {
  useAppPreferences,
} from "../../context/AppPreferencesContext";

import type {
  AppPreferences,
} from "../../context/AppPreferencesContext";


type SettingsTab = "restaurant" | "billing" | "preferences";

const tabs: {
  value: SettingsTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "restaurant",
    label: "Restaurant Profile",
    icon: <StorefrontOutlinedIcon fontSize="small" />,
  },
  {
    value: "billing",
    label: "Billing & Tax",
    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
  },
  {
    value: "preferences",
    label: "Preferences",
    icon: <TuneOutlinedIcon fontSize="small" />,
  },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useRestaurant();
  const { preferences, updatePreferences } = useAppPreferences();

  const [activeTab, setActiveTab] =
    useState<SettingsTab>("restaurant");

  const [form, setForm] = useState<RestaurantSettings>(settings);
  const [preferenceForm, setPreferenceForm] = useState(preferences);
  const [copyFromDay, setCopyFromDay] =
    useState<OpeningDay>("Monday");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    setPreferenceForm(preferences);
  }, [preferences]);

  const updateField = <K extends keyof RestaurantSettings>(
    field: K,
    value: RestaurantSettings[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSaveMessage("");
  };

  const updateHours = (
    day: OpeningDay,
    patch: Partial<OpeningHours>
  ) => {
    setForm((current) => ({
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: {
          ...current.openingHours[day],
          ...patch,
        },
      },
    }));
    setSaveMessage("");
  };

  const handleCopyHours = () => {
    const source = form.openingHours[copyFromDay];

    setForm((current) => ({
      ...current,
      openingHours: Object.fromEntries(
        days.map((day) => [
          day,
          { ...source },
        ])
      ) as RestaurantSettings["openingHours"],
    }));

    setSaveMessage("");
  };

  const handleApplyHoursToOpenDays = () => {
    const source = form.openingHours[copyFromDay];

    setForm((current) => ({
      ...current,
      openingHours: Object.fromEntries(
        days.map((day) => [
          day,
          current.openingHours[day].open
            ? { ...source, open: true }
            : current.openingHours[day],
        ])
      ) as RestaurantSettings["openingHours"],
    }));

    setSaveMessage("");
  };

  
  const handlePreferenceChange = <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => {
    setPreferenceForm((current) => ({
      ...current,
      [key]: value,
    }));

    setSaveMessage("");
  };

  const handleSave = () => {
    updateSettings(form);
    updatePreferences(preferenceForm);

    setSaveMessage("Settings saved successfully.");
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "background.default",
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.4rem", md: "1.65rem" },
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                Settings
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.82rem",
                  color: "text.secondary",
                }}
              >
                Manage your restaurant details, billing, and preferences.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={handleSave}
              sx={{
                px: 2.5,
                py: 1,
                fontSize: "0.82rem",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Save Changes
            </Button>
          </Box>

          {saveMessage && (
            <Alert
              severity="success"
              onClose={() => setSaveMessage("")}
            >
              {saveMessage}
            </Alert>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 0.75,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
            }}
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab.value;

              return (
                <Button
                  key={tab.value}
                  startIcon={tab.icon}
                  onClick={() => setActiveTab(tab.value)}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "0 1 auto" },
                    justifyContent: "center",
                    px: 2,
                    py: 1.1,
                    borderRadius: 2,
                    fontSize: "0.8rem",
                    color: selected
                      ? "primary.main"
                      : "text.secondary",
                    bgcolor: selected
                      ? "action.selected"
                      : "transparent",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Paper>

          <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
            {tabs.find((tab) => tab.value === activeTab)?.label}
          </Typography>

          {activeTab === "restaurant" && (
            <RestaurantProfileSection
              form={form}
              updateField={updateField}
              updateHours={updateHours}
              copyFromDay={copyFromDay}
              setCopyFromDay={setCopyFromDay}
              handleCopyHours={handleCopyHours}
              handleApplyHoursToOpenDays={handleApplyHoursToOpenDays}
            />
          )}

          {activeTab === "billing" && (
            <BillingTaxSection
              form={form}
              updateField={updateField}
            />
          )}

          {activeTab === "preferences" && (
            <PreferencesSection
              preferenceForm={preferenceForm}
              updatePreference={handlePreferenceChange}
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
