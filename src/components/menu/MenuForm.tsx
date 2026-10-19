import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";

import type {
  FoodType,
  MenuCategory,
  MenuItem as MenuItemType,
  MenuStockStatus,
} from "../../types/menu";
import { useModifiers } from "../../context/ModifierContext";
import { usePersistentState } from "../../hooks/usePersistentState";

interface MenuFormProps {
  onClose: () => void;
  onSubmit: (item: MenuItemType) => boolean;
  categories: MenuCategory[];
  initialItem?: MenuItemType;
}

const MenuForm = ({
  onClose,
  onSubmit,
  categories,
  initialItem,
}: MenuFormProps) => {
  const { modifierGroups } = useModifiers();

  const formKey = initialItem
  ? `menu_form_edit_${initialItem.id}`
  : "menu_form_new";

 const [name, setName] = usePersistentState(
  `${formKey}_name`,
  initialItem?.name ?? ""
);
  const [description, setDescription] = usePersistentState(
  `${formKey}_description`,
  initialItem?.description ?? ""
);
  const [price, setPrice] = usePersistentState(
  `${formKey}_price`,
  initialItem?.price?.toString() ?? ""
);

 const [category, setCategory] = usePersistentState<MenuCategory>(
  `${formKey}_category`,
  initialItem?.category ?? ("" as MenuCategory)
);

 const [foodType, setFoodType] = usePersistentState<FoodType | "">(
  `${formKey}_food_type`,
  initialItem?.foodType ?? ""
);

  const [stockStatus, setStockStatus] =
  usePersistentState<MenuStockStatus>(
    `${formKey}_stock_status`,
    initialItem?.stockStatus ?? "Available"
  );

  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = usePersistentState<
    string[]
  >(
    `${formKey}_modifier_group_ids`,
    () =>
      initialItem?.modifierGroupIds ??
      modifierGroups
        .filter((group) =>
          initialItem?.modifierGroups?.some(
            (legacyGroup) =>
              legacyGroup.id === group.id ||
              legacyGroup.name.trim().toLowerCase() ===
                group.name.trim().toLowerCase()
          )
        )
        .map((group) => group.id)
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !price || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setFormError("Enter an item name and a valid non-negative price.");
      return;
    }

    if (!foodType) {
      setFormError("Select a food type.");
      return;
    }

    const validModifierGroupIds = selectedModifierGroupIds.filter((groupId) =>
      modifierGroups.some(
        (group) => group.id === groupId && (group.isAvailable ?? true))
    );

    const newItem: MenuItemType = {
      id: initialItem?.id ?? "",
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      foodType,
      stockStatus,
      isAvailable: initialItem?.isAvailable ?? true,
      modifierGroupIds: validModifierGroupIds,
      ...(initialItem?.modifierGroups
        ? { modifierGroups: initialItem.modifierGroups }
        : {}),
    };

    if (!onSubmit(newItem)) {
      setFormError("An item with this name already exists in the menu.");
      return;
    }

    setFormError("");
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {initialItem ? "Edit Menu Item" : "Add Menu Item"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Set up the menu item and assign its modifier groups.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 2, sm: 2.5 }, height: "100%" }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Menu Item Details
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Item Name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setFormError("");
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Price"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      select
                      label="Category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      {categories.map((menuCategory) => (
                        <MenuItem key={menuCategory} value={menuCategory}>
                          {menuCategory}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      required
                      select
                      label="Food Type"
                      value={foodType}
                      onChange={(event) => {
                        setFoodType(event.target.value as FoodType | "");
                        setFormError("");
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select food type
                      </MenuItem>
                      <MenuItem value="Veg">Veg</MenuItem>
                      <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      required
                      select
                      label="Stock Status"
                      value={stockStatus}
                      onChange={(event) =>
                        setStockStatus(event.target.value as MenuStockStatus)
                      }
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 2, sm: 2.5 }, height: "100%" }}
              >
                <Typography
                variant="h5"
                sx={{
                  fontSize: "22px",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  }}
                  >
                     Modifier Groups
                  </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, mb: 2 }}
                >
                  Assigned groups provide customization options during ordering.
                </Typography>

                <FormControl fullWidth>
                  <InputLabel 
                  id="menu-modifier-groups-label"
                  >
                    Modifier Groups
                  </InputLabel>
                  <Select
                    labelId="menu-modifier-groups-label"
                    multiple
                    value={selectedModifierGroupIds.filter((groupId) =>
                      modifierGroups.some((group) => group.id === groupId)
                    )}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedModifierGroupIds(
                        typeof value === "string" ? value.split(",") : value
                      );
                      setFormError("");
                    }}
                    input={<OutlinedInput label="Modifier Groups" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((groupId) => {
                          const group = modifierGroups.find(
                            (item) => item.id === groupId
                          );

                          return group ? (
                            <Chip
                              key={group.id}
                              label={group.name}
                              size="small"
                              onDelete={(event) => {
                                event.stopPropagation();

                                setSelectedModifierGroupIds((prev) => 
                                prev.filter((id) => id !== group.id)
                              );
                              setFormError("");
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {modifierGroups
                    .filter((group) => group.isAvailable ?? true)
                    .map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {modifierGroups.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1.5 }}
                  >
                    No modifier groups are available yet. Create groups in
                    Modifier Management to assign them here.
                  </Typography>
                )}

                {selectedModifierGroupIds.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1.5 }}
                  >
                    {selectedModifierGroupIds.filter((groupId) =>
                      modifierGroups.some((group) => group.id === groupId)
                    ).length}{" "}
                    group(s) assigned
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialItem ? "Save Changes" : "Add Item"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MenuForm;