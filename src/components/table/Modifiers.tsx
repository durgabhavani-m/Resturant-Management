import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

import type { MenuModifierGroup } from "../../types/menu";
import type { SelectedModifier } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";


interface ModifiersProps {
  open: boolean;
  itemName: string;
  basePrice: number;
  currencyCode: string;
  groups: MenuModifierGroup[];
  storageKey: string;
  onClose: () => void;
  onConfirm: (
    modifiers: SelectedModifier[],
    totalPrice: number
  ) => void;
}

const Modifiers = ({
  open,
  itemName,
  basePrice,
  currencyCode,
  groups,
  storageKey,
  onClose,
  onConfirm,
}: ModifiersProps) => {
  const [selected, setSelected] = useState<
    Record<string, string[]>
  >(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch {
      // Continue if local storage is unavailable.
    }
  }, [selected, storageKey]);

  const handleSelect = (
    group: MenuModifierGroup,
    optionId: string,
    checked: boolean
  ) => {
    setSelected((previous) => {
      const current = previous[group.id] ?? [];

      const next =
        group.selectionType === "single"
          ? checked
            ? [optionId]
            : []
          : checked
            ? [...current, optionId]
            : current.filter((id) => id !== optionId);

      return {
        ...previous,
        [group.id]: next,
      };
    });

    setError("");
  };

  const selectedModifiers: SelectedModifier[] = groups.flatMap(
    (group) =>
      (selected[group.id] ?? []).flatMap((optionId) => {
        const option = group.options.find(
          (item) => item.id === optionId
        );

        return option
          ? [
              {
                groupId: group.id,
                groupName: group.name,
                optionId: option.id,
                name: option.name,
                price: option.price,
              },
            ]
          : [];
      })
  );

  const totalPrice =
    basePrice +
    selectedModifiers.reduce(
      (total, modifier) => total + modifier.price,
      0
    );

  const handleConfirm = () => {
    const missingRequiredGroup = groups.find(
      (group) =>
        group.required &&
        (selected[group.id] ?? []).length === 0
    );

    if (missingRequiredGroup) {
      setError(`Please select ${missingRequiredGroup.name}.`);
      return;
    }

    onConfirm(selectedModifiers, totalPrice);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Customize {itemName}
      </DialogTitle>

      <DialogContent dividers>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Base price: {formatCurrency(basePrice, currencyCode)}
        </Typography>

        {groups.map((group) => (
          <Box key={group.id} sx={{ mb: 3 }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>
              {group.name}
              {group.required ? " *" : ""}
            </Typography>

            {group.selectionType === "single" ? (
              <RadioGroup
                value={selected[group.id]?.[0] ?? ""}
                onChange={(event) =>
                  handleSelect(group, event.target.value, true)
                }
              >
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={`${option.name}${
                      option.price > 0
                        ? ` (+${formatCurrency(option.price, currencyCode)})`
                        : option.price < 0
                            ? ` (-${formatCurrency(Math.abs(option.price), currencyCode)})`
                          : ""
                    }`}
                  />
                ))}
              </RadioGroup>
            ) : (
              <Box>
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        checked={(
                          selected[group.id] ?? []
                        ).includes(option.id)}
                        onChange={(event) =>
                          handleSelect(
                            group,
                            option.id,
                            event.target.checked
                          )
                        }
                      />
                    }
                    label={`${option.name}${
                      option.price > 0
                        ? ` (+${formatCurrency(option.price, currencyCode)})`
                        : option.price < 0
                            ? ` (-${formatCurrency(Math.abs(option.price), currencyCode)})`
                          : ""
                    }`}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: 1,
            borderColor: "divider",
            pt: 2,
          }}
        >
          <Typography fontWeight="bold">
            Item price
          </Typography>
          <Typography fontWeight="bold">
            {formatCurrency(totalPrice, currencyCode)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Add to Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modifiers;