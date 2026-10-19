
import {
  Alert,
  Box,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { RestaurantSettings } from "../../context/ResturantContext";

interface Props {
  form: RestaurantSettings;
  updateField: <K extends keyof RestaurantSettings>(
    field: K,
    value: RestaurantSettings[K]
  ) => void;
}

const fieldSx = {
  "& .MuiInputBase-root": { fontSize: "0.8rem" },
  "& .MuiInputLabel-root": { fontSize: "0.8rem" },
  "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
};

export default function BillingTaxSection({ form, updateField }: Props) {
  return (
    <Paper id="billing-tax" component="section" variant="outlined"
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, scrollMarginTop: 16 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <ReceiptLongOutlinedIcon color="primary" fontSize="small" />
        <Box>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Billing & Tax
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            Configure currency, tax, and invoice details
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.75 }} />

      <Grid container spacing={1.5} alignItems="center">
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select fullWidth required size="small" label="Currency"
            value={form.billing.currency}
            onChange={(e) => updateField("billing", {
              ...form.billing, currency: e.target.value,
            })} sx={fieldSx}>
            <MenuItem value="INR">INR — Indian Rupee</MenuItem>
            <MenuItem value="USD">USD — US Dollar</MenuItem>
            <MenuItem value="EUR">EUR — Euro</MenuItem>
            <MenuItem value="GBP">GBP — British Pound</MenuItem>
            <MenuItem value="CAD">CAD — Canadian Dollar</MenuItem>
            <MenuItem value="AUD">AUD — Australian Dollar</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlLabel
            control={<Switch size="small" checked={form.billing.taxEnabled}
              onChange={(e) => updateField("billing", {
                ...form.billing, taxEnabled: e.target.checked,
              })} />}
            label={<Typography sx={{ fontSize: "0.78rem" }}>
              Enable tax on new bills
            </Typography>}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" label="Tax label"
            value={form.billing.taxLabel}
            onChange={(e) => updateField("billing", {
              ...form.billing, taxLabel: e.target.value,
            })} sx={fieldSx} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" type="number" label="Tax rate (%)"
            value={form.billing.taxRate}
            onChange={(e) => updateField("billing", {
              ...form.billing, taxRate: Number(e.target.value),
            })}
            slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
            sx={fieldSx} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField required fullWidth size="small" label="Invoice prefix"
            value={form.billing.invoicePrefix}
            onChange={(e) => updateField("billing", {
              ...form.billing, invoicePrefix: e.target.value,
            })} sx={fieldSx} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlLabel
            control={<Switch size="small" checked={form.billing.showTaxBreakdown}
              onChange={(e) => updateField("billing", {
                ...form.billing, showTaxBreakdown: e.target.checked,
              })} />}
            label={<Typography sx={{ fontSize: "0.78rem" }}>
              Show tax breakdown on bills
            </Typography>}
          />
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 1.5, fontSize: "0.75rem", py: 0 }}>
        These settings apply to new bills. Currency changes do not convert previously
        saved amounts. Confirm the applicable tax rate for your business.
      </Alert>
    </Paper>
  );
}
