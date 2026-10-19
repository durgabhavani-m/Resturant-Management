import { useState, useEffect } from "react";
import type { FormEvent, MouseEvent } from "react";
import {
  Box,
  Alert,
  Typography,
  Paper,
  TextField,
  MenuItem,
} from "@mui/material";

import type { Reservation, ReservationStatus } from "../../types/reservation";
import { useTable } from "../../context/TableContext";
import { useOrder } from "../../context/OrderContext";
import { useBilling } from "../../context/BillingContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import { getNextRecordId, normalizeRecordId } from "../../utils/recordIds";

import { usePersistentState } from "../../hooks/usePersistentState";

import ReservationHeader from "./ReservationHeader";
import ReservationFilters from "./ReservationFilters";
import ReservationTable from "./ReservationTable";
import ReservationDialogs from "./ReservationDialogs";

const RESERVATION_STORAGE_KEY = "reservation_customers";
const TABLE_NOTICE_STORAGE_KEY = "restaurant_table_notice";

const initialReservations: Reservation[] = [
  {
    id: "RESERVATION-1",
    customerName: "Rahul Sharma",
    phone: "9876543210",
    date: "2026-08-31",
    time: "19:00",
    guests: 4,
    tableNumber: 5,
    tableSection: "Indoor",
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "RESERVATION-2",
    customerName: "Priya Patel",
    phone: "9876543211",
    date: "2026-09-01",
    time: "20:00",
    guests: 2,
    tableNumber: 3,
    tableSection: "Outdoor",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "RESERVATION-3",
    customerName: "Amit Kumar",
    phone: "9876543212",
    date: "2026-09-02",
    time: "18:30",
    guests: 6,
    tableNumber: 8,
    tableSection: "Private",
    status: "Completed",
    createdAt: new Date().toISOString(),
  },
];

const ReservationsPage = () => {
  const { tables, updateTableStatus } = useTable();
  const { orders } = useOrder();
  const { bills } = useBilling();
  const { preferences } = useAppPreferences();

  const [search, setSearch] = usePersistentState("reservations_page_search","");
  const [section, setSection] = usePersistentState("reservations_page_section","All");
  const [dateRange, setDateRange] = usePersistentState<string>("reservations_page_date_range",preferences.defaultHistoryDateRange);
  const [customStart, setCustomStart] = usePersistentState("reservations_page_custom_start","");
  const [customEnd, setCustomEnd] = usePersistentState("reservations_page_custom_end","");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [reservation, setReservation] = useState<Reservation[]>(() => {
    const storedReservation = localStorage.getItem(RESERVATION_STORAGE_KEY);

    if (storedReservation) {
      const parsedReservations = JSON.parse(storedReservation) as Reservation[];
      return parsedReservations.map((item) => ({
        ...item,
        id: normalizeRecordId(item.id, "RESERVATION"),
      }));
    }

    return initialReservations;
  });

  const [status, setStatus] = usePersistentState
  <
  ReservationStatus | "All"
  >("reservations_page_status","All");

  const [showForm, setShowForm] = usePersistentState("reservations_page_form_open",false);

  const [editingReservation, setEditingReservation] =
  usePersistentState<Reservation | null>("reservations_page_editing",null);

  const [selectedReservation, setSelectedReservation] =
  usePersistentState<Reservation | null>("reservations_page_selected", null);

  const [customerName, setCustomerName] = usePersistentState("reservations_page_customer_name","");
  const [phone, setPhone] = usePersistentState("reservations_page_phone","");
  const [date, setDate] = usePersistentState("reservations_page_date","");
  const [time, setTime] = usePersistentState("reservations_page_time","");
  const [guests, setGuests] = usePersistentState("reservations_page_guests","");
  const [tableNumber, setTableNumber] = usePersistentState("reservations_page_table_number","");
  const [tableSection, setTableSection] = usePersistentState("reservations_page_table_section","");
  const [reservationMessage, setReservationMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectableTables = tables.filter(
    (table) => 
      table.status === "Available" &&
      (!guests || table.capacity >= Number(guests))
  );

  const menuReservation =
    reservation.find((item) => item.id === openMenuId) ?? null;

  const closeActionsMenu = () => {
    setOpenMenuId(null);
    setMenuAnchorEl(null);
  };

  useEffect(() => {
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(reservation));
  }, [reservation]);

  useEffect(() => {
    const tablesBeingReserved = new Set<string>();

    reservation.forEach((item) => {
      if (item.status !== "Pending" && item.status !== "Confirmed") {
        return;
      }

      const table = tables.find(
        (candidate) =>
          candidate.tableNumber === item.tableNumber &&
          candidate.section === item.tableSection
      );
      if (!table) return;

      const paidOrder = orders.find(
        (order) => 
          order.tableNumber === table.tableNumber &&
          order.tableSection === table.section &&
          order.paymentStatus === "Paid"
      );

      const hasPaidBill = 
      paidOrder &&
      bills.some(
        (bill) => 
          bill.orderId === paidOrder.id &&
          bill.paymentStatus === "Paid"
      );

      if (
        table.status === "Cleaning" && 
        hasPaidBill
      ) {
        setReservation((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? { ...candidate, status: "Completed" }
              : candidate
          )
        );

        setReservationMessage({
          type: "success",
          message: `Billing completed for Table ${table.tableNumber}. Reservation completed.`,
        });

        return;
      }

      if(
        item.status === "Pending" &&
        table.status === "Available" &&
        table.capacity >= item.guests &&
        !tablesBeingReserved.has(table.id)
      ){
        tablesBeingReserved.add(table.id);

        setReservation((current) => 
          current.map((candidate) => 
            candidate.id === item.id
              ? {...candidate, status:"Confirmed"}
              : candidate
        ));
        updateTableStatus(table.id, "Reserved");

        sessionStorage.setItem(
          TABLE_NOTICE_STORAGE_KEY,
          `Table ${table.tableNumber} reserved.`
        );
        setReservationMessage({
          type: "success",
          message: `Reservation confirmed. Table ${table.tableNumber} is reserved for ${item.customerName}.`,
        });
      }
    });
  }, [reservation, tables, orders, bills, updateTableStatus]);

  const filteredReservations = reservation.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search);

    const matchesStatus = 
    status === "All" || item.status === status;

    const matchesSection = 
    section === "All" || item.tableSection === section;

    const [year, month, day] = item.date.split("-").map(Number);
    const bookingDate = new Date(year, month - 1, day);
    bookingDate.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);

    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 29);

    let matchesDate = true;

    if(dateRange === "Today"){
      matchesDate = bookingDate.getTime() === today.getTime();
    }else if (dateRange === "Yesterday"){
      matchesDate = bookingDate.getTime() === yesterday.getTime();
    }else if (dateRange === "Last 7 Days"){
      matchesDate = bookingDate >= last7Days && bookingDate <= today;
    }else if (dateRange === "Last 30 Days"){
      matchesDate = bookingDate >= last30Days && bookingDate <= today;
    }else if (dateRange === "Custom Range"){
      const [sy, sm,sd] = customStart.split("-").map(Number);
      const startDate = new Date(sy, sm - 1, sd);
      matchesDate = bookingDate >= startDate;
    }

    if(customEnd) {
      const [ey, em, ed] = customEnd.split("-").map(Number);
      const endDate = new Date(ey, em - 1, ed);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = 
      matchesDate && bookingDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesSection && matchesDate;
  });

  const handleEditResservation = (item: Reservation) => {
    setEditingReservation(item);
    setCustomerName(item.customerName);
    setPhone(item.phone);
    setDate(item.date);
    setTime(item.time);
    setGuests(String(item.guests));
    setTableNumber(item.tableNumber != undefined ? String(item.tableNumber) : "");
    setTableSection(item.tableSection);
    setOpenMenuId(null);
    setMenuAnchorEl(null);
    setShowForm(true);
  };

  const handleViewReservation = (item: Reservation) => {
    setSelectedReservation(item);
    setOpenMenuId(null);
    setMenuAnchorEl(null);
  };

  const handleAddReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !customerName.trim() ||
      !phone.trim() ||
      !date ||
      !time ||
      !guests ||
      !tableNumber ||
      !tableSection
    ) {
      setReservationMessage({
        type: "error",
        message: "Complete all required fields and select an available table.",
      });
      return;
    }

    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setReservationMessage({
        type: "error",
        message: "Guest count must be at least one.",
      });
      return;
    }

    if (editingReservation) {
      const selectedTable = tables.find(
        (table) =>
          table.tableNumber === Number(tableNumber) &&
          table.section === tableSection
      );

      if (!selectedTable) {
        setReservationMessage({
          type: "error",
          message: `Table ${tableNumber} is not available.`,
        });
        return;
      }

      if(selectedTable.status === "Cleaning"){
        setReservationMessage({
          type: "error",
          message: `Table ${selectedTable.tableNumber} is currently being cleaned and cannot be reserved.`,
        });
        return;
      }

      const tableChanged =
        editingReservation.tableNumber !== Number(tableNumber) ||
        editingReservation.tableSection !== tableSection;

      if (selectedTable.capacity < Number(guests)) {
        setReservationMessage({
          type: "error",
          message: `Table ${selectedTable.tableNumber} is not suitable for ${guests} guests.`,
        });
        return;
      }

      const canConfirm =
        selectedTable.status === "Available" ||
        (!tableChanged &&
          (selectedTable.status === "Reserved" ||
            selectedTable.status === "Occupied"));

      const updatedReservation: Reservation = {
        ...editingReservation,
        customerName: customerName.trim(),
        phone: phone.trim(),
        date,
        time,
        guests: Number(guests),
        tableNumber: Number(tableNumber),
        tableSection,
        status: canConfirm ? "Confirmed" : "Pending",
      };

      setReservation((current) =>
        current.map((item) =>
          item.id === editingReservation.id ? updatedReservation : item
        )
      );

      if (tableChanged) {
        const oldTable = tables.find(
          (table) =>
            table.tableNumber === editingReservation.tableNumber &&
            table.section === editingReservation.tableSection
        );

        if (oldTable?.status === "Reserved") {
          updateTableStatus(oldTable.id, "Available");
        }
      }

      if (selectedTable.status === "Available" && canConfirm) {
        updateTableStatus(selectedTable.id, "Reserved");
        sessionStorage.setItem(
          TABLE_NOTICE_STORAGE_KEY,
          `Table ${selectedTable.tableNumber} reserved.`
        );
      }

      setReservationMessage({
        type: "success",
        message: canConfirm
          ? `Reservation confirmed. Table ${selectedTable.tableNumber} is reserved for ${customerName}.`
          : `Reservation is pending because Table ${selectedTable.tableNumber} is ${selectedTable.status.toLowerCase()}.`,
      });
    } else {
      const selectedTable = tables.find(
        (table) =>
          table.tableNumber === Number(tableNumber) &&
          table.section === tableSection
      );

      if (!selectedTable) {
        setReservationMessage({
          type: "error",
          message: `Table ${tableNumber} is not available.`,
        });
        return;
      }

      if (selectedTable.capacity < Number(guests)) {
        setReservationMessage({
          type: "error",
          message: `Table ${selectedTable.tableNumber} is not suitable for ${guests} guests.`,
        });
        return;
      }

      const newReservation: Reservation = {
        id: getNextRecordId("RESERVATION", reservation.map((reservation) => reservation.id)),
        customerName: customerName.trim(),
        phone: phone.trim(),
        date,
        time,
        guests: Number(guests),
        tableNumber: Number(tableNumber),
        tableSection: selectedTable.section,
        status: selectedTable.status === "Available" ? "Confirmed" : "Pending",
        createdAt: new Date().toISOString(),
      };

      setReservation((current) => [...current, newReservation]);

      if (selectedTable.status === "Available") {
        updateTableStatus(selectedTable.id, "Reserved");
        sessionStorage.setItem(
          TABLE_NOTICE_STORAGE_KEY,
          `Table ${selectedTable.tableNumber} reserved.`
        );
        setReservationMessage({
          type: "success",
          message: `Reservation confirmed. Table ${selectedTable.tableNumber} is reserved for ${customerName}.`,
        });
      } else {
        setReservationMessage({
          type: "success",
          message: `Reservation saved as pending. Table ${selectedTable.tableNumber} is currently ${selectedTable.status.toLowerCase()}.`,
        });
      }
    }

    setCustomerName("");
    setPhone("");
    setDate("");
    setTime("");
    setGuests("");
    setTableNumber("");
    setTableSection("");
    setShowForm(false);
    setEditingReservation(null);
  };

  const handleConfirmReservation = (id: string) => {
    const reservationToConfirm = reservation.find((item) => item.id === id);
    if (!reservationToConfirm) return;

    if (reservationToConfirm.status !== "Pending") return;

    const table = tables.find(
      (item) =>
        item.tableNumber === reservationToConfirm.tableNumber &&
        item.section === reservationToConfirm.tableSection
    );

    if (!table) {
      setReservationMessage({
        type: "error",
        message: "The reserved table could not be found.",
      });
      return;
    }

    if (table.status !== "Available") {
      setReservationMessage({
        type: "error",
        message: `Reservation remains pending. Table ${table.tableNumber} is currently ${table.status.toLowerCase()}.`,
      });
      setOpenMenuId(null);
      setMenuAnchorEl(null);
      return;
    }

    updateTableStatus(table.id, "Reserved");
    setReservation((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Confirmed" } : item
      )
    );
    setReservationMessage({
      type: "success",
      message: `Reservation confirmed successfully. Table ${table.tableNumber} is reserved for ${reservationToConfirm.customerName}.`,
    });
    sessionStorage.setItem(
      TABLE_NOTICE_STORAGE_KEY,
      `Table ${table.tableNumber} reserved.`
    );
    setOpenMenuId(null);
    setMenuAnchorEl(null);
  };

  const handleCancelReservation = (id: string) => {
    const reservationToCancel = reservation.find((item) => item.id === id);
    if (!reservationToCancel) return;

    setReservation((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Cancelled" } : item
      )
    );

    const table = tables.find(
      (item) =>
        item.tableNumber === reservationToCancel.tableNumber &&
        item.section === reservationToCancel.tableSection
    );

    if (table?.status === "Reserved") {
      updateTableStatus(table.id, "Available");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReservation(null);
  };

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, reservationId: string) => {
    setOpenMenuId(reservationId);
    setMenuAnchorEl(event.currentTarget);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        gap: 3,
      }}
    >
      {reservationMessage && (
        <Box
          sx={{
            position: "fixed",
            right: 20,
            top: 20,
            zIndex: 1300,
            width: "100%",
            maxWidth: 400,
            px: { xs: 2, sm: 0 },
          }}
        >
          <Alert
            severity={reservationMessage.type}
            onClose={() => setReservationMessage(null)}
            sx={{ boxShadow: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {reservationMessage.type === "success"
                ? "Reservation Successful"
                : "Reservation Failed"}
            </Typography>
            <Typography variant="body2">{reservationMessage.message}</Typography>
          </Alert>
        </Box>
      )}

      <ReservationHeader onAddReservation={() => setShowForm(true)} />

      <ReservationFilters
        search={search}
        status={status}
        section={section}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSectionChange={setSection}
      />

      <Paper
      elevation={0}
      sx={{
         p: 2,
         mb: 2,
         border: "1px solid",
         borderColor: "divider",
         borderRadius: 2,
         display: "flex",
         alignItems: "center",
         justifyContent: "space-between",
         flexWrap: "wrap",
         gap: 2,
      }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Reservation History
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
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
            onChange={(event) => setCustomStart(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
           />

           <TextField
            size="small"
            label="To"
            type="date"
            value={customEnd}
            onChange={(event) => setCustomEnd(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
           />
         </>
         )}
        </Box>
      </Paper>

      <ReservationTable
        reservations={filteredReservations}
        openMenuId={openMenuId}
        menuAnchorEl={menuAnchorEl}
        menuReservation={menuReservation}
        onToggleMenu={handleMenuOpen}
        onCloseMenu={closeActionsMenu}
        onView={handleViewReservation}
        onEdit={handleEditResservation}
        onConfirm={handleConfirmReservation}
        onCancel={handleCancelReservation}
      />

      <ReservationDialogs
        showForm={showForm}
        editingReservation={editingReservation}
        selectedReservation={selectedReservation}
        customerName={customerName}
        phone={phone}
        date={date}
        time={time}
        guests={guests}
        tableNumber={tableNumber}
        tableSection={tableSection}
        selectableTables={selectableTables}
        onCloseForm={handleCloseForm}
        onCloseDetails={() => setSelectedReservation(null)}
        onCustomerNameChange={setCustomerName}
        onPhoneChange={setPhone}
        onDateChange={setDate}
        onTimeChange={setTime}
        onGuestsChange={setGuests}
        onTableChange={(nextTableSection, nextTableNumber) => {
          setTableSection(nextTableSection);
          setTableNumber(nextTableNumber);
        }}
        onSubmit={handleAddReservation}
      />
    </Box>
  );
};

export default ReservationsPage;
