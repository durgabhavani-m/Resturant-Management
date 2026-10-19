import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { OrderItem } from "../../types/order";
import type { PaymentMethod } from "../../types/billing";
import { formatCurrency } from "../../utils/formatCurrency";

interface TableOrderCartProps {
  items: OrderItem[];
  total: number;
  taxAmount: number;
  billTotal: number;
  taxLabel: string;
  currencyCode: string;
  showTaxBreakdown: boolean;
  tableLabel: string;
  orderNumber: string;
  isBillingOpen: boolean;
  paymentMethod: PaymentMethod | "";
  paymentError: string;
  isProcessingPayment: boolean;
  paymentReceipt: {
    billNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
  } | null;
  onIncrease: (item: OrderItem) => void;
  onDecrease: (item: OrderItem) => void;
  onRemove: (item: OrderItem) => void;
  onOpenBilling: () => void;
  onCloseBilling: () => void;
  onSelectPayment: (method: PaymentMethod) => void;
  onCompletePayment: () => void;
}

const TableOrderCart = ({
  items,
  total,
  taxAmount,
  billTotal,
  taxLabel,
  currencyCode,
  showTaxBreakdown,
  tableLabel,
  orderNumber,
  isBillingOpen,
  paymentMethod,
  paymentError,
  isProcessingPayment,
  paymentReceipt,
  onIncrease,
  onDecrease,
  onRemove,
  onOpenBilling,
  onCloseBilling,
  onSelectPayment,
  onCompletePayment,
}: TableOrderCartProps) => {
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
          height: { xs: "auto", lg: "calc(100vh - 210px)" },
          maxHeight: { xs: "none", lg: "calc(100vh - 210px)" },
          minHeight: 0,
          boxSizing: "border-box",
          position: { lg: "sticky" },
          top: { lg: 16 },
          overflow: "hidden",
        }}
      >
      {/* Cart heading */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Current Order
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
        </Typography>
      </Box>

      <Divider />

      {/* Scrollable items section */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          py: 1,
          pr: 0.5,
        }}
      >
        {items.length === 0 ? (
          <Box
            sx={{
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary" textAlign="center">
              No items added yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((item, index) => (
              <ListItem
                key={`${item.menuItemId}-${index}`}
                disableGutters
                sx={{
                  py: 1.5,
                  pr: 0,
                  alignItems: "flex-start",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ListItemText
                    sx={{ my: 0 }}
                    primary={
                      <Typography
                        fontWeight={600}
                        sx={{
                          overflowWrap: "anywhere",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        {item.modifiers?.length ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {item.modifiers
                              .map((modifier) => modifier.name)
                              .join(", ")}
                          </Typography>
                        ) : null}

                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {formatCurrency(item.price, item.currencyCode ?? currencyCode)} each
                        </Typography>

                        <Typography
                          component="span"
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {formatCurrency(item.price * item.quantity, item.currencyCode ?? currencyCode)}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Quantity controls */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    flexShrink: 0,
                  }}
                >
                  <IconButton
                    size="small"
                    aria-label={`Decrease ${item.name} quantity`}
                    onClick={() => onDecrease(item)}
                    sx={{
                      color: "primary.main",
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography component="span" fontWeight={700}>
                      −
                    </Typography>
                  </IconButton>

                  <Typography
                    sx={{
                      minWidth: 22,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {item.quantity}
                  </Typography>

                  <IconButton
                    size="small"
                    aria-label={`Increase ${item.name} quantity`}
                    onClick={() => onIncrease(item)}
                    sx={{
                      color: "primary.main",
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography component="span" fontWeight={700}>
                      +
                    </Typography>
                  </IconButton>

                  <IconButton
                    size="small"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onRemove(item)}
                    sx={{ color: "text.secondary", ml: 0.25 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Fixed footer: subtotal and billing button */}
      <Box
        sx={{
          flexShrink: 0,
          pt: 2,
          mt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography color="text.secondary">
            Subtotal
          </Typography>

          <Typography variant="h6" fontWeight={700}>
            {formatCurrency(total, currencyCode)}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          disabled={items.length === 0}
          onClick={onOpenBilling}
          sx={{
            py: 1.4,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          Proceed to Billing
        </Button>
      </Box>
      </Paper>

      <Dialog
        open={isBillingOpen || Boolean(paymentReceipt)}
        onClose={onCloseBilling}
        fullWidth
        maxWidth="xs"
      >
        {paymentReceipt ? (
          <>
            <DialogTitle>Payment complete</DialogTitle>
            <DialogContent>
              <Alert severity="success">
                Bill {paymentReceipt.billNumber} paid successfully using{" "}
                {paymentReceipt.paymentMethod}.
              </Alert>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  gap: 2,
                }}
              >
                <Typography color="text.secondary">Amount paid</Typography>
                <Typography fontWeight={700}>
                  {formatCurrency(paymentReceipt.total, currencyCode)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseBilling}>Close</Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Proceed to Billing</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">Table</Typography>
                  <Typography fontWeight={600}>{tableLabel}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">Order</Typography>
                  <Typography fontWeight={600}>{orderNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">Items</Typography>
                  <Typography fontWeight={600}>{totalQuantity}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>{formatCurrency(total, currencyCode)}</Typography>
                </Box>
                {showTaxBreakdown && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography color="text.secondary">{taxLabel}</Typography>
                    <Typography fontWeight={600}>{formatCurrency(taxAmount, currencyCode)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography fontWeight={600}>Total</Typography>
                  <Typography fontWeight={700}>{formatCurrency(billTotal, currencyCode)}</Typography>
                </Box>
                <TextField
                  select
                  fullWidth
                  required
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(event) =>
                    onSelectPayment(event.target.value as PaymentMethod)
                  }
                >
                  <MenuItem value="" disabled>
                    Select payment method
                  </MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                {paymentError && <Alert severity="error">{paymentError}</Alert>}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={onCloseBilling} disabled={isProcessingPayment}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onCompletePayment}
                disabled={
                  !paymentMethod ||
                  items.length === 0 ||
                  isProcessingPayment
                }
              >
                {isProcessingPayment ? "Processing..." : "Complete Payment"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default TableOrderCart;
