import { useMemo, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { useBilling } from "../context/BillingContext";
import { useOrder } from "../context/OrderContext";
import { useRestaurant } from "../context/ResturantContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { formatCurrency } from "../utils/formatCurrency";
import type { Bill, PaymentMethod, PaymentStatus } from "../types/billing";

const BILLING_FILTERS_STORAGE_KEY = "restaurant_billing_filters";

const getStatusColor = (status: PaymentStatus): "success" | "warning" | "default" => {
  if (status === "Paid") return "success";
  if (status === "Pending") return "warning";
  return "default";
};

const BillingPage = () => {
  const { bills, deleteBill, updatePaymentStatus } = useBilling();
  const { orders, updateOrder } = useOrder();
  const { settings } = useRestaurant();
  const { preferences } = useAppPreferences();

  
const [initialFilters] = useState(() => {
  try {
    const saved = localStorage.getItem(BILLING_FILTERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});

const [search, setSearch] = useState<string>(
  () => initialFilters.search ?? ""
);

const [status, setStatus] = useState<PaymentStatus | "All">(
  () => initialFilters.status ?? "All"
);

const [dateRange, setDateRange] = useState<string>(
  () => initialFilters.dateRange ?? preferences.defaultHistoryDateRange
);

const [customStart, setCustomStart] = useState<string>(
  () => initialFilters.customStart ?? ""
);

const [customEnd, setCustomEnd] = useState<string>(
  () => initialFilters.customEnd ?? ""
);


  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  useEffect(() => {
  localStorage.setItem(
    BILLING_FILTERS_STORAGE_KEY,
    JSON.stringify({
      search,
      status,
      dateRange,
      customStart,
      customEnd,
    })
  );
}, [search, status, dateRange, customStart, customEnd]);

  const filteredBills = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
     
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billNumber.toLowerCase().includes(normalizedSearch) ||
        bill.orderNumber.toLowerCase().includes(normalizedSearch) ||
        bill.customerName.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        status === "All" || bill.paymentStatus === status;

        const billDate = new Date(bill.createdAt);
        billDate.setHours(0,0,0,0);

        const today = new Date();
        today.setHours(0,0,0,0);

        const yesterday = new Date(today);
        yesterday .setDate(today.getDate() - 1);

        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);

        const last30Days =  new Date(today);
        last30Days.setDate(today.getDate() - 29);

        let matchesDate = true;

        if(dateRange === "Today"){
          matchesDate = billDate.getTime() === today.getTime();
        }else if (dateRange === "Yesterday"){
          matchesDate = billDate.getTime() === yesterday.getTime();
        }else if (dateRange === "Last 7 Days"){
          matchesDate = billDate >= last7Days && billDate <= today;
        }else if (dateRange === "Last 30 Days"){
          matchesDate = billDate >= last30Days && billDate <= today;
        }else if (dateRange === "Custom Range"){
          if(customStart){
            const startDate = new Date(`${customStart}T00:00:00`);
            matchesDate = billDate >= startDate;
          }

          if(customEnd){
            const endDate = new Date(`${customEnd}T00:00:00`);
            endDate.setHours(23,59,59,999);
            matchesDate = matchesDate && billDate <= endDate;
          }
        }

       return matchesSearch && matchesStatus && matchesDate;
      });
    }, [bills, search, status, dateRange, customStart, customEnd]);

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  );

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending"
  );

  const totalsByCurrency = (items: Bill[]) => {
    const totals = new Map<string, number>();
    items.forEach((bill) => {
      const currency = bill.currencyCode ?? "INR";
      totals.set(currency, (totals.get(currency) ?? 0) + bill.total);
    });
    return Array.from(totals, ([currency, amount]) => ({ currency, amount }));
  };

  const collectedByCurrency = totalsByCurrency(paidBills);
  const pendingByCurrency = totalsByCurrency(pendingBills);

  const handlePayBill = () => {
    if (!payingBill || !paymentMethod || payingBill.paymentStatus !== "Pending") {
      return;
    }

    updatePaymentStatus(payingBill.id, "Paid", paymentMethod);
    const order = orders.find((item) => item.id === payingBill.orderId);
    if (order) {
      updateOrder({ ...order, paymentStatus: "Paid" });
    }
    setPayingBill(null);
    setPaymentMethod("");
  };

  const handleDeleteBill = () => {
    if (!deletingBill) return;
    deleteBill(deletingBill.id);
    setDeletingBill(null);
  };

  const requestDeleteBill = (bill: Bill) => {
    setOpenMenuId(null);
    if (!preferences.confirmBeforeDelete) {
      deleteBill(bill.id);
      return;
    }
    setDeletingBill(bill);
  };

  const viewingOrder = viewingBill
    ? orders.find((item) => item.id === viewingBill.orderId)
    : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 0 }}>
      {/* Header */}
      <Box>
        <Typography variant="h1">Billing</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage restaurant bills and payments
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Total Bills
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {totalBills}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Paid Bills
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 1 }}>
              {paidBills.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Collected
            </Typography>
            <Box sx={{ mt: 1 }}>
              {collectedByCurrency.length > 0
                ? collectedByCurrency.map(({ currency, amount }) => (
                    <Typography key={currency} variant="h6" fontWeight={700}>
                      {formatCurrency(amount, currency)}
                    </Typography>
                  ))
                : <Typography variant="h6" fontWeight={700}>{formatCurrency(0, settings.billing.currency)}</Typography>}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper variant="outlined" sx={{ p: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Pending Amount
            </Typography>
            <Box sx={{ mt: 1 }}>
              {pendingByCurrency.length > 0
                ? pendingByCurrency.map(({ currency, amount }) => (
                    <Typography key={currency} variant="h6" fontWeight={700} color="primary.main">
                      {formatCurrency(amount, currency)}
                    </Typography>
                  ))
                : <Typography variant="h6" fontWeight={700} color="primary.main">{formatCurrency(0, settings.billing.currency)}</Typography>}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Billing Date Filter */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Billing History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter bills by date
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            select
            size="small"
            label="Date Range"
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Yesterday">Yesterday</MenuItem>
            <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
            <MenuItem value="Custom Range">Custom Range</MenuItem>
          </TextField>

          {dateRange === "Custom Range" && (
            <>
              <TextField
                size="small"
                label="From"
                type="date"
                value={customStart}
                onChange={(event) => {
                  const newStart = event.target.value;
                  setCustomStart(newStart);

                  if(customEnd && newStart && customEnd < newStart){
                    setCustomEnd("");
                  }
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                size="small"
                label="To"
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                slotProps={{
                   inputLabel: { shrink: true },
                   htmlInput:{
                    min: customStart || undefined,
                   }
                   }}
              />
            </>
          )}
        </Box>
      </Paper>


      {/* Billing Table */}
      <Paper
        variant="outlined"
        sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
      >
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            justifyContent: "space-between",
            gap: 2,
            p: 2.5,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bill, order or customer..."
            sx={{ maxWidth: { md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton 
                  size="small"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  edge="end">
                    <CloseIcon fontSize="small"/>
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Select
            size="small"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as PaymentStatus | "All")
            }
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="All">All Payments</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>
        </Box>
        

        {/* Table */}
        <TableContainer sx={{ flex: 1, minHeight: 0 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Bill
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Order
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Customer
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Payment Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Method
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Created
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", color: "text.secondary" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No bills found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow key={bill.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{bill.billNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {bill.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {bill.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {formatCurrency(bill.total, bill.currencyCode ?? "INR")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.paymentStatus}
                        size="small"
                        color={getStatusColor(bill.paymentStatus)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {bill.paymentMethod ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ position: "relative", display: "inline-block" }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenMenuId(openMenuId === bill.id ? null : bill.id)
                          }
                          aria-label={`Actions for ${bill.billNumber}`}
                        >
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                        {openMenuId === bill.id && (
                          <Paper
                            elevation={3}
                            sx={{
                              position: "absolute",
                              right: 0,
                              zIndex: 30,
                              mt: 1,
                              width: 176,
                              py: 0.5,
                            }}
                          >
                            <Button
                              fullWidth
                              startIcon={<VisibilityIcon fontSize="small" />}
                              onClick={() => {
                                setViewingBill(bill);
                                setOpenMenuId(null);
                              }}
                              sx={{
                                justifyContent: "flex-start",
                                px: 2,
                                py: 1,
                                color: "text.primary",
                                fontWeight: 400,
                              }}
                            >
                              View Bill
                            </Button>
                            {bill.paymentStatus === "Pending" && (
                              <Button
                                fullWidth
                                startIcon={<CreditCardIcon fontSize="small" />}
                                onClick={() => {
                                  setPayingBill(bill);
                                  setPaymentMethod("");
                                  setOpenMenuId(null);
                                }}
                                sx={{
                                  justifyContent: "flex-start",
                                  px: 2,
                                  py: 1,
                                  color: "text.primary",
                                  fontWeight: 400,
                                }}
                              >
                                Pay Bill
                              </Button>
                            )}
                            <Button
                              fullWidth
                              startIcon={<DeleteIcon fontSize="small" />}
                              onClick={() => {
                                requestDeleteBill(bill);
                              }}
                              sx={{
                                justifyContent: "flex-start",
                                px: 2,
                                py: 1,
                                color: "error.main",
                                fontWeight: 400,
                              }}
                            >
                              Delete Bill
                            </Button>
                          </Paper>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Bill Dialog */}
      <Dialog
        open={Boolean(viewingBill)}
        onClose={() => setViewingBill(null)}
        maxWidth="sm"
        fullWidth
      >
        {viewingBill && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pr: 1 }}>
              <Box>
                <Typography variant="h2">{settings.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Payment receipt
                </Typography>
              </Box>
              <IconButton
                onClick={() => setViewingBill(null)}
                aria-label="Close bill"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 2, mb: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Bill Number</Typography>
                  <Typography variant="body2" fontWeight={500}>{viewingBill.billNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Order Number</Typography>
                  <Typography variant="body2" fontWeight={500}>{viewingBill.orderNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body2" fontWeight={500}>{viewingBill.customerName}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(viewingBill.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Typography fontWeight={600} sx={{ mb: 2 }}>Items</Typography>
              {viewingOrder ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {viewingOrder.items.map((item, index) => (
                    <Box
                      key={`${item.menuItemId}-${index}`}
                      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity} × {formatCurrency(item.price, item.currencyCode ?? viewingBill.currencyCode ?? "INR")}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(item.quantity * item.price, item.currencyCode ?? viewingBill.currencyCode ?? "INR")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  The original order is no longer available.
                </Typography>
              )}

              <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider", display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(viewingBill.subtotal, viewingBill.currencyCode ?? "INR")}
                  </Typography>
                </Box>
                {(viewingBill.showTaxBreakdown ?? true) && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">{viewingBill.taxLabel ?? "Tax"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(viewingBill.tax, viewingBill.currencyCode ?? "INR")}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(viewingBill.discount, viewingBill.currencyCode ?? "INR")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <Typography fontWeight={600}>Total</Typography>
                  <Typography fontWeight={600}>
                    {formatCurrency(viewingBill.total, viewingBill.currencyCode ?? "INR")}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                <Typography variant="body2" fontWeight={500}>{viewingBill.paymentStatus}</Typography>
              </Box>
              <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                <Typography variant="body2" fontWeight={500}>{viewingBill.paymentMethod ?? "—"}</Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Pay Bill Dialog */}
      <Dialog
        open={Boolean(payingBill)}
        onClose={() => setPayingBill(null)}
        maxWidth="xs"
        fullWidth
      >
        {payingBill && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
              Pay Bill
              <IconButton
                onClick={() => setPayingBill(null)}
                aria-label="Close payment dialog"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Bill Number</Typography>
                  <Typography variant="body2" fontWeight={500}>{payingBill.billNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Order Number</Typography>
                  <Typography variant="body2" fontWeight={500}>{payingBill.orderNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body2" fontWeight={500}>{payingBill.customerName}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="body2" fontWeight={500}>Total Amount</Typography>
                  <Typography fontWeight={700}>
                    {formatCurrency(payingBill.total, payingBill.currencyCode ?? "INR")}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                Payment Method
              </Typography>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod | "")
                }
              >
                <MenuItem value="">
                  <em>Select payment method</em>
                </MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="outlined" onClick={() => setPayingBill(null)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handlePayBill}
                disabled={!paymentMethod}
              >
                Mark as Paid
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Bill Dialog */}
      <Dialog
        open={Boolean(deletingBill)}
        onClose={() => setDeletingBill(null)}
        maxWidth="xs"
        fullWidth
      >
        {deletingBill && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pr: 1 }}>
              <Box>
                Delete Bill
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 400 }}>
                  Delete {deletingBill.billNumber}? The order will not be affected.
                </Typography>
              </Box>
              <IconButton
                onClick={() => setDeletingBill(null)}
                aria-label="Close delete confirmation"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="outlined" onClick={() => setDeletingBill(null)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDeleteBill}>
                Delete Bill
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BillingPage;
