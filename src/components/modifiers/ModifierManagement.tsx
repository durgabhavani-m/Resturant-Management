import { useState } from "react";
import { usePersistentState } from "../../hooks/usePersistentState";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { useModifiers } from "../../context/ModifierContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import type {
  MenuModifierGroup,
  MenuModifierOption,
} from "../../types/menu";

interface OptionDraft {
  id: string;
  name: string;
  price: string;
}

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyOption = (): OptionDraft => ({
  id: createId(),
  name: "",
  price: "0",
});

const ModifierManagementPage = () => {
  const {
    modifierGroups,
    addModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
  } = useModifiers();
  const { preferences } = useAppPreferences();

  const [dialogOpen, setDialogOpen] = usePersistentState(
  "modifier_form_open",
  false
);
  const [editingId, setEditingId] = usePersistentState<string | null>(
  "modifier_form_editing_id",
  null
);
  const [groupName, setGroupName] = usePersistentState(
  "modifier_form_group_name",
  ""
);
  const [selectionType, setSelectionType] = usePersistentState<
  "single" | "multiple"
>("modifier_form_selection_type", "single");
  const [required, setRequired] = usePersistentState(
  "modifier_form_required",
  false
);
  const [options, setOptions] = usePersistentState<OptionDraft[]>(
  "modifier_form_options",
  [emptyOption()]
);
  const [error, setError] = useState("");

  const resetForm = () => {
    setDialogOpen(false);
    setEditingId(null);
    setGroupName("");
    setSelectionType("single");
    setRequired(false);
    setOptions([emptyOption()]);
    setError("");
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (group: MenuModifierGroup) => {
    setEditingId(group.id);
    setGroupName(group.name);
    setSelectionType(group.selectionType);
    setRequired(Boolean(group.required));
    setOptions(
      group.options.length
        ? group.options.map((option) => ({
            id: option.id,
            name: option.name,
            price: String(option.price),
          }))
        : [emptyOption()]
    );
    setError("");
    setDialogOpen(true);
  };

  const addOption = () => {
    setOptions((previous) => [...previous, emptyOption()]);
  };

  const updateOption = (
    id: string,
    field: "name" | "price",
    value: string
  ) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === id ? { ...option, [field]: value } : option
      )
    );
    setError("");
  };

  const removeOption = (id: string) => {
    setOptions((previous) => previous.filter((option) => option.id !== id));
    setError("");
  };

  const handleToggleAvailability = (group: MenuModifierGroup) => {
    const updatedGroup: MenuModifierGroup = {
      ...group,
      isAvailable: !(group.isAvailable ?? true),
    };
    updateModifierGroup(updatedGroup);
  }

  const handleSave = () => {
    const normalizedName = groupName.trim().replace(/\s+/g, " ");

    if (!normalizedName) {
      setError("Enter a modifier group name.");
      return;
    }

    const duplicate = modifierGroups.some(
      (group) =>
        group.id !== editingId &&
        group.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (duplicate) {
      setError("A modifier group with this name already exists.");
      return;
    }

    const filledOptions = options.filter((option) => option.name.trim());

    if (filledOptions.length === 0) {
      setError("Add at least one modifier option.");
      return;
    }
    if (
      options.some(
        (option) =>
          !option.name.trim() ||
          option.price.trim() === "" ||
          !Number.isFinite(Number(option.price)) ||
          Number(option.price) < 0
      )
    ) {
      setError(
        "Complete every option name and enter a valid, non-negative price."
      );
      return;
    }


    const normalizedOptionNames = filledOptions.map((option) =>
      option.name.trim().toLowerCase()
    );

    if (new Set(normalizedOptionNames).size !== normalizedOptionNames.length) {
      setError("Option names must be unique within a group.");
      return;
    }


    const savedOptions: MenuModifierOption[] = options.map((option) => ({
      id: option.id,
      name: option.name.trim(),
      price: Number(option.price),
    }));

    const group: MenuModifierGroup = {
      id: editingId ?? createId(),
      name: normalizedName,
      selectionType,
      required,
      options: savedOptions,
    };

    const success = editingId
      ? updateModifierGroup(group)
      : addModifierGroup(group);

    if (!success) {
      setError("Unable to save this group. Check its name and try again.");
      return;
    }

    resetForm();
  };

  const handleDelete = (group: MenuModifierGroup) => {
    if (
      preferences.confirmBeforeDelete &&
      !window.confirm(`Delete "${group.name}" and all its options?`)
    ) return;

    deleteModifierGroup(group.id);
    if (editingId === group.id) resetForm();
  };

  const panelTitle = editingId ? "Edit Modifier Group" : "Add Modifier Group";
  const inputAccentSx = {
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#F45B0B",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C2410C" },
  };


  const actionButtonSx = {
    borderColor: "#FFD0B0",
    color: "#C2410C",
    borderRadius: 1.5,
    textTransform: "none",
    fontWeight: 600,
    "&:hover": { borderColor: "#F45B0B", bgcolor: "#FFF3E8" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5, 
        }}
      >
        <Box>
          <Typography variant="h1">Modifier Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create and manage modifier groups for your menu items.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{
            bgcolor: "#F45B0B",
            "&:hover": { bgcolor: "#D94A00" },
            whiteSpace: "nowrap",
          }}
        >
          Add Modifier Group
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.35fr) minmax(360px, 1fr)" },
          alignItems: "start",
          gap: 2,
          minWidth: 0,
        }}
      >
        <Paper
        component="section"
        variant="outlined"
        sx={{
          minWidth: 0,
          p: 2,
          borderRadius: 3,
          borderColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
          display:"flex",
          flexDirection: "column",
          height: "calc(100vh - 180px)",
          overflow: "hidden",
          }}
          >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Modifier Groups
            </Typography>
            <Chip
              size="small"
              label={modifierGroups.length}
              sx={{ bgcolor: "#FFF3E8", color: "#C2410C", fontWeight: 700 }}
            />
          </Box>
          
          <Box
          sx={{
            flex:1,
            minHeight:0,
            overflowY: "auto",
            pr:0.5,
          }}
          >
          {modifierGroups.length === 0 ? (
            <Card
              variant="outlined"
              sx={{ borderColor: "#FFD0B0", borderRadius: 2, textAlign: "center" }}
            >
              <CardContent sx={{ py: 5, display: "flex", alignItems: "center", flexDirection: "column", gap: 1.25 }}>
                <TuneIcon sx={{ fontSize: 40, color: "#64748b" }} />
                <Typography variant="h6" sx={{ fontSize: "1rem" }}>No modifier groups yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create groups such as Spice Level or Add-ons to get started.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                  sx={{ ...actionButtonSx, mt: 0.5 }}
                >
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1}>
              {modifierGroups.map((group, index) => {
                const prices = group.options.map((option) => option.price);
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;

                return (
                  <Card
                    key={group.id}
                    variant="outlined"
                    sx={{
                      borderColor: "#FFD0B0",
                      borderRadius: 2,
                      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "grid",
                              placeItems: "center",
                              width: 34,
                              height: 34,
                              flexShrink: 0,
                              borderRadius: 1.25,
                              color: index % 2 === 0 ? "#C2410C" : "#F45B0B",
                              bgcolor: "#FFF3E8",
                            }}
                          >
                            <RestaurantMenuIcon fontSize="small" />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                              {group.name}
                            </Typography>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={group.selectionType === "single" ? "Single selection" : "Multiple selection"}
                                sx={{ height: 23, borderColor: "#FFD0B0", color: "#C2410C", bgcolor: "#FFF3E8" }}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={group.required ? "Required" : "Optional"}
                                sx={{
                                  height: 23,
                                  borderColor: group.required ? "#FFD0B0" : "#e2e8f0",
                                  color: group.required ? "#C2410C" : "#475569",
                                  bgcolor: group.required ? "#FFF3E8" : "#f8fafc",
                                }}
                              />
                            </Stack>

                            <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{mt:1}}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {(group.isAvailable ?? true) ? "Available" : "Unavailable"}
                              </Typography>

                              <Switch
                              size="small"
                              checked={group.isAvailable ?? true}
                              onChange={() => handleToggleAvailability(group)}
                              color="success"
                              inputProps={{
                                "aria-label" : `Toggle availability for ${group.name}`,
                              }}
                              />
                            </Stack>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => openEditDialog(group)}
                            sx={actionButtonSx}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => handleDelete(group)}
                            sx={{ borderColor: "#dc2626", color: "#dc2626", borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                      <Divider sx={{ my: 1.25, borderColor: "#eaf0f8" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="caption" color="text.secondary">
                          {group.options.length} {group.options.length === 1 ? "option" : "options"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
          </Box>
        </Paper>
        

        {dialogOpen && (
          <Paper
            component="section"
            variant="outlined"
            aria-labelledby="modifier-form-title"
            sx={{
              minWidth: 0,
              borderColor: "#FFD0B0",
              borderRadius: 2,
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
              display: "flex",
              flexDirection: "column",
              maxHeight: { xs: "none", lg: "calc(100dvh - 150px)" },
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", px: 2, py: 1.75, borderBottom: 1, borderColor: "#eaf0f8" }}>
              <Box>
                <Typography id="modifier-form-title" variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
                  {panelTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Set up the group and its available options.
                </Typography>
              </Box>
              <IconButton size="small" aria-label="Close form" onClick={resetForm}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ p: 2, overflowY: "auto", minHeight: 0 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Basic Information
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Group name"
                    placeholder="e.g. Spice Level"
                    value={groupName}
                    sx={inputAccentSx}
                    onChange={(event) => {
                      setGroupName(event.target.value);
                      setError("");
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Selection Type
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    value={selectionType}
                    onChange={(_event, value: "single" | "multiple" | null) => {
                      if (value) setSelectionType(value);
                    }}
                    aria-label="Selection type"
                    sx={{
                      "& .MuiToggleButton-root": {
                        textTransform: "none",
                        color: "text.secondary",
                        borderColor: "#FFD0B0",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        p: 1.25,
                      },
                      "& .Mui-selected": {
                        bgcolor: "#FFF3E8 !important",
                        color: "#C2410C !important",
                        borderColor: "#F45B0B !important",
                      },
                    }}
                  >
                    <ToggleButton value="single">
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <RadioButtonCheckedIcon fontSize="small" />
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="body2" fontWeight={600}>Single Selection</Typography>
                          <Typography variant="caption" color="text.secondary">Choose one option</Typography>
                        </Box>
                      </Stack>
                    </ToggleButton>
                    <ToggleButton value="multiple">
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <CheckBoxOutlineBlankIcon fontSize="small" />
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="body2" fontWeight={600}>Multiple Selection</Typography>
                          <Typography variant="caption" color="text.secondary">Choose many options</Typography>
                        </Box>
                      </Stack>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <FormControl>
                  <FormLabel sx={{ typography: "subtitle2", fontWeight: 700, color: "text.primary", "&.Mui-focused": { color: "text.primary" } }}>
                    Required
                  </FormLabel>
                  <RadioGroup
                    row
                    value={required ? "yes" : "no"}
                    onChange={(event) => setRequired(event.target.value === "yes")}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#F45B0B" } }} />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#F45B0B" } }} />} label="No" />
                  </RadioGroup>
                </FormControl>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>Options</Typography>
                    <Typography variant="caption" color="text.secondary">Price in ₹</Typography>
                  </Box>
                  <Stack spacing={1}>
                    {options.map((option, index) => (
                      <Box
                        key={option.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) 112px 32px",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <TextField
                          fullWidth
                          required
                          size="small"
                          label={`Option ${index + 1}`}
                          placeholder="e.g. Mild"
                          value={option.name}
                          sx={inputAccentSx}
                          onChange={(event) => updateOption(option.id, "name", event.target.value)}
                        />
                        <TextField
                          required
                          fullWidth
                          size="small"
                          type="number"
                          label="Price"
                          value={option.price}
                          onChange={(event) => updateOption(option.id, "price", event.target.value)}
                          sx={{
                        "& input[type=number]": {
                          MozAppearance: "textfield",
                        },
                        "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                          {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                      }}
                        />
                        <IconButton
                          size="small"
                          aria-label={`Remove option ${index + 1}`}
                          color="error"
                          disabled={options.length === 1}
                          onClick={() => removeOption(option.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addOption}
                    sx={{ ...actionButtonSx, mt: 1.25 }}
                  >
                    Add Option
                  </Button>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </Box>

            <Divider />
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 2, py: 1.5 }}>
              <Button onClick={resetForm} sx={{ color: "text.secondary", textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ bgcolor: "#F45B0B", "&:hover": { bgcolor: "#D94A00" }, textTransform: "none", fontWeight: 600 }}
              >
                Save
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ModifierManagementPage;
