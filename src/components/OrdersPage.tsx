import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useOrder } from "../context/OrderContext";
import type { Order, OrderStatus } from "../types/order";
import { useTable } from "../context/TableContext";


import {usePersistentState} from "../hooks/usePersistentState";

const getStatusColor = (status: OrderStatus): "success" | "error" | "info" | "warning" => {
  if (status === "Completed") return "success";
  if (status === "Cancelled") return "error";
  if (status === "Preparing") return "info";
  return "warning";
};

const OrdersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { orders, updateOrder } = useOrder();
  const { tables, updateTableStatus } = useTable();
  const [search, setSearch] = usePersistentState(
  "orders_page_search",
  ""
   );

  const [status, setStatus] = usePersistentState<OrderStatus | "All">(
  "orders_page_status",
  "All"
  );

  const [section, setSection] = usePersistentState<string>(
  "orders_page_section",
  "All"
  );

  const [dateRange, setDateRange] = usePersistentState<string>(
  "orders_page_date_range",
  "All Time"
  );

  const [customStart, setCustomStart] = usePersistentState(
  "orders_page_custom_start",
  ""
  );

  const [customEnd, setCustomEnd] = usePersistentState(
  "orders_page_custom_end",
  ""
 );
  const [selectedOrder, setSelectedOrder] = usePersistentState<Order | null>("orders_page_Selected_order",null);
  const [editingOrder, setEditingOrder] = usePersistentState<Order | null>("orders_age_editing_order",null);

  useEffect(() => {
  const navigationState = location.state as
    | { showAllOrders?: boolean }
    | null;

  if (navigationState?.showAllOrders) {
    setSearch("");
    setStatus("All");
    setSection("All");
    setDateRange("All Time");
    setCustomStart("");
    setCustomEnd("");

    // Clear the navigation flag after resetting filters
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }
}, [
  location.key
]);

  const filteredOrders = orders.filter((order) => {

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All" || order.status === status;

    const matchesSection = section === "All" || 
    (order.orderType == "Dine In" &&
      order.tableSection ===  section);

      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0,0,0,0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() -1);

      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() -6);

      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 29);

      let matchesDate = true;

      if(dateRange === "Today"){
        matchesDate =
        orderDate >= today && orderDate < tomorrow;
      }else if(dateRange === "Yesterday"){
        matchesDate = 
        orderDate >= yesterday && orderDate < today;
      }else if(dateRange === "Last 7 Days"){
        matchesDate = 
        orderDate >= last7Days && orderDate < tomorrow;
      }else if(dateRange === "Last 30 Days"){
        matchesDate = 
        orderDate >= last30Days && orderDate < tomorrow;
      }else if (
        dateRange === "Custom Range" &&
        customStart &&
        customEnd
      ){
        const start = new Date(`${customStart}T00:00:00`);
        const end = new Date(`${customEnd}T00:00:00`);
        end.setDate(end.getDate() + 1);

        matchesDate = orderDate >= start && orderDate < end;
      }

    return (matchesSearch && matchesStatus &&
     matchesSection && matchesDate);
  })
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 0 }}>
      <Box>
        <Typography variant="h1">Orders</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage Resturant Orders
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 360, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
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
          <TextField
            select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "All")}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Preparing">Preparing</MenuItem>
            <MenuItem value="Ready">Ready</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
          select
          size="small"
          label="Section"
          value={section}
          onChange={(event) => setSection(event.target.value)}
          sx={{minWidth:180}}
          >
            <MenuItem value="All">All Sections</MenuItem>
            <MenuItem value="Indoor">Indoor</MenuItem>
            <MenuItem value="Outdoor">Outdoor</MenuItem>
            <MenuItem value="Private">Private</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper 
      variant="outlined"
      sx={{
        px:2,
        py:1.5,
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        gap:2,
        flexWrap:"wrap",
      }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Order History
          </Typography>
          <Typography variant="caption" color="text.secondary">
            View Orders by date
          </Typography>
        </Box>

        <TextField
        select
        size="small"
        label="Date range"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        sx={{minWidth:180}}
        >
          <MenuItem value="All Time">All Time</MenuItem>
          <MenuItem value="Today">Today</MenuItem>
          <MenuItem value="Yesterday">Yesterday</MenuItem>
          <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
          <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
          <MenuItem value="Custom Range">Custom Range</MenuItem>
        </TextField>

        {dateRange === "Custom Range" && (
          <Box
          sx={{
            display:"flex",
            gap:1.5,
            flexWrap:"wrap",
          }}
          >
            <TextField
            size="small"
            label="From"
            type="date"
            value={customStart}
            onChange={(e) => {
              const newStart = e.target.value;
              setCustomStart(newStart);

              if(customEnd && newStart > customEnd){
                setCustomEnd("")
              }
            }}
            slotProps={{inputLabel:{shrink:true}}}
            />

            <TextField
            size="small"
            label="To"
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            slotProps={{
              inputLabel:{shrink:true},
              htmlInput:{
                min:customStart || undefined,
              },
            }}
            />
          </Box>
        )}
      </Paper>

      <Paper
        variant="outlined"
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => handleViewOrder(order)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {order.orderNumber}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{order.customerName}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {order.orderType === "Dine In"
                      ? order.tableSection || "-"
                      : order.orderType === "Takeaway"
                      ? "Takeaway"
                      : "-"
                      }
                    </Typography>
                    </TableCell>

                    <TableCell>
                       <Typography variant="caption" color="text.secondary" display="block">
                        {order.orderType}
                       </Typography>

                    {order.tableNumber && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Table {order.tableNumber}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {order.items.reduce((total, item) => total + item.quantity, 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{order.total}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredOrders.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No orders found
            </Typography>
          </Box>
        )}
      </Paper>


      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Box>
                <Typography 
                 sx={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  pr: 5,
                }}
                >Order {selectedOrder.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedOrder(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedOrder.customerName}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedOrder.orderType}
                  </Typography>
                </Box>

                {selectedOrder.tableNumber && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Table
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedOrder.tableNumber}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography 
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                    selectedOrder.status === "Completed"
                    ? "success.main"
                    : selectedOrder.status === "Cancelled"
                    ? "error.main"
                    : "warning.dark",
                  }}>
                    {selectedOrder.status}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Order Items
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {selectedOrder.items.map((item) => (
                  <Box
                    key={item.menuItemId}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity} × ₹{item.price}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{item.quantity * item.price}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2.5,
                  pt: 2,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={600}>Total</Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700}>
                  ₹{selectedOrder.total}
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                color="inherit"
                onClick={() => setSelectedOrder(null)}
                sx={{ bgcolor: "text.primary", color: "common.white", "&:hover": { bgcolor: "grey.800" } }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        {editingOrder && (
          <>
            <DialogTitle
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Box>
                <Typography variant="h3">Edit Order</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {editingOrder.orderNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setEditingOrder(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={editingOrder.customerName}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customerName: e.target.value,
                    })
                  }
                />

                {editingOrder.orderType === "Dine In" && (
                  <TextField
                    select
                    fullWidth
                    label="Table Number"
                    value={
                      editingOrder.tableNumber && editingOrder.tableSection
                        ? `${editingOrder.tableSection}::${editingOrder.tableNumber}`
                        : ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setEditingOrder({
                          ...editingOrder,
                          tableNumber: undefined,
                          tableSection: undefined,
                        });
                        return;
                      }
                      const [selectedSection, selectedNumber] = e.target.value.split("::");

                      setEditingOrder({
                        ...editingOrder,
                        tableSection: selectedSection,
                        tableNumber: Number(selectedNumber),
                      });
                    }}
                  >
                    <MenuItem value="">Select table</MenuItem>
                    {tables
                      .filter(
                        (table) =>
                          table.status === "Available" ||
                          (table.tableNumber === editingOrder.tableNumber &&
                            table.section === editingOrder.tableSection)
                      )
                      .sort((a, b) => {
                        if (a.section === b.section) {
                          return a.tableNumber - b.tableNumber;
                        }
                        return a.section.localeCompare(b.section);
                      })
                      .map((table) => (
                        <MenuItem
                          key={table.id}
                          value={`${table.section}::${table.tableNumber}`}
                        >
                          {table.section} - Table{table.tableNumber}
                        </MenuItem>
                      ))}
                  </TextField>
                )}

                <TextField
                  select
                  fullWidth
                  label="Order Type"
                  value={editingOrder.orderType}
                  onChange={(e) => {
                    const newOrderType = e.target.value as Order["orderType"];
                    setEditingOrder({
                      ...editingOrder,
                      orderType: newOrderType,
                      tableNumber: newOrderType === "Dine In" ? editingOrder.tableNumber : undefined,
                      tableSection: newOrderType === "Dine In" ? editingOrder.tableSection : undefined,
                    });
                  }}
                >
                  <MenuItem value="Dine In">Dine In</MenuItem>
                  <MenuItem value="Takeaway">Takeaway</MenuItem>
                  <MenuItem value="Delivery">Delivery</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      status: e.target.value as OrderStatus,
                      orderStatus: e.target.value as OrderStatus,
                    })
                  }
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Preparing">Preparing</MenuItem>
                  <MenuItem value="Ready">Ready</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setEditingOrder(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  const originalOrder = orders.find((order) => order.id === editingOrder.id);
                  if (
                    originalOrder?.tableNumber &&
                    originalOrder?.tableSection &&
                    (editingOrder.orderType !== "Dine In" ||
                      originalOrder.tableNumber != editingOrder.tableNumber ||
                      originalOrder.tableSection !== editingOrder.tableSection)
                  ) {
                    const oldTable = tables.find(
                      (table) =>
                        table.tableNumber === originalOrder.tableNumber &&
                        table.section === originalOrder.tableSection
                    );
                    if (oldTable) {
                      updateTableStatus(oldTable.id, "Available");
                    }
                  }
                  if (
                    editingOrder.orderType === "Dine In" &&
                    editingOrder.tableNumber &&
                    editingOrder.tableSection
                  ) {
                    const newTable = tables.find(
                      (table) =>
                        table.tableNumber === editingOrder.tableNumber &&
                        table.section === editingOrder.tableSection
                    );
                    if (newTable) {
                      updateTableStatus(newTable.id, "Reserved");
                    }
                  }
                  updateOrder(editingOrder);
                  setEditingOrder(null);
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
