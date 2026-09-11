import {Search, Plus, X, MoreHorizontal} from "lucide-react";
import {useState, useEffect, useRef} from "react";
import type {Reservation,ReservationStatus} from "../types/reservation";
import {useTable} from "../context/TableContext";

const RESERVATION_STORAGE_KEY = "reservation_customers";

const initialReservations: Reservation[] = [
  {
    id: "1",
    customerName: "Rahul Sharma",
    phone: "9876543210",
    date: "2026-08-31",
    time: "19:00",
    guests: 4,
    tableNumber: 5,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    customerName: "Priya Patel",
    phone: "9876543211",
    date: "2026-09-01",
    time: "20:00",
    guests: 2,
    tableNumber: 3,
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    customerName: "Amit Kumar",
    phone: "9876543212",
    date: "2026-09-02",
    time: "18:30",
    guests: 6,
    tableNumber: 8,
    status: "Completed",
    createdAt: new Date().toISOString(),
  },
];

const Reservationspage = () => {
    const{tables,updateTableStatus} = useTable();
    const [search, setSearch] =useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [reservation, setReservation] = useState<Reservation[]>(() => {
        const storedReservation = localStorage.getItem(RESERVATION_STORAGE_KEY);

        if(storedReservation) {
            return JSON.parse(storedReservation)
        }
        return initialReservations;
    });
    const [status, setStatus] = useState<ReservationStatus | "All">("All");
    const [showForm, setShowForm] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [guests, setGuests] = useState("");
    const [tableNumber, setTableNumber] =useState("");
    const [reservationMessage, setReservationMessage] = useState<{
        type: "success" | "error";
        message:String;
    } | null>(null);
    const previousTablesRef = useRef(tables);
      
    const availableTables = tables.filter((table) => {
        const isCurrentTable = editingReservation?.tableNumber === table.tableNumber;
        const isAvailable = table.status === "Available";
        const hasCapacity = guests
        ? table.capacity >= Number(guests)
        : true;

        return (isAvailable || isCurrentTable) && hasCapacity;
    })

    console.log("All TABLES:",tables);
    console.log("AVAILABLE TABLES:",availableTables);

    useEffect(() => {
        localStorage.setItem(RESERVATION_STORAGE_KEY,JSON.stringify(reservation))
    },[reservation]);
useEffect(() => {
    const previousTables = previousTablesRef.current;

    tables.forEach((currentTable) => {
        const previousTable = previousTables.find(
            (table) => table.id === currentTable.id
        );

        if (
            previousTable &&
            previousTable.status !== currentTable.status
        ) {
            const relatedReservation = reservation.find(
                (item) =>
                    item.tableNumber === currentTable.tableNumber &&
                    (
                        item.status === "Pending" ||
                        item.status === "Confirmed"
                    )
            );

            if (relatedReservation) {
                setReservationMessage({
                    type:
                        currentTable.status === "Available"
                            ? "success"
                            : "error",
                    message: `Table ${currentTable.tableNumber} status changed to ${currentTable.status}. Reservation for ${relatedReservation.customerName} is affected.`,
                });
            }
        }
    });

    previousTablesRef.current = tables;
}, [tables, reservation]);
 
    const filteredReservations = reservation.filter((reservation) => {
        const matchesSearch = reservation.customerName.toLowerCase().includes(search.toLowerCase()) ||
        reservation.phone.includes(search);

        const matchesStatus = status === "All" || reservation.status === status;

        return matchesSearch && matchesStatus;
    })

    const handleEditResservation = (item: Reservation) => {
        setEditingReservation(item);

        setCustomerName(item.customerName);
        setPhone(item.phone);
        setDate(item.date);
        setTime(item.time);
        setGuests(String(item.guests));
        setTableNumber(
            item.tableNumber != undefined
            ? String(item.tableNumber)
            :""
        );
        setOpenMenuId(null);
        setShowForm(true);
    }

    const handleViewReservation = (item: Reservation) => {
        setSelectedReservation(item);
        setOpenMenuId(null);
    };


    const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (
        !customerName.trim() ||
        !phone.trim() ||
        !date ||
        !time ||
        !guests ||
        !tableNumber
    ) {
        return;
    }
    if (editingReservation) {

        const selectedTable = tables.find(
            (table) => table.tableNumber === Number(tableNumber)
        );

        if (!selectedTable) {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not available.`,
            });
            return;
        }
        if (
            editingReservation.tableNumber !== Number(tableNumber) &&
            selectedTable.status !== "Available"
        ) {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not available.`,
            });
            return;
        }

        if (selectedTable.capacity < Number(guests)) {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not suitable for ${guests} guests.`,
            });
            return;
        }

        const updatedReservation: Reservation = {
            ...editingReservation,
            customerName: customerName.trim(),
            phone: phone.trim(),
            date,
            time,
            guests: Number(guests),
            tableNumber: Number(tableNumber),
            status: editingReservation.status,
        };

        setReservation((prev) =>
            prev.map((item) =>
                item.id === editingReservation.id
                    ? updatedReservation
                    : item
            )
        );
        if (
            editingReservation.tableNumber !== Number(tableNumber)
        ) {
            const oldTable = tables.find(
                (table) =>
                    table.tableNumber === editingReservation.tableNumber
            );

            if (oldTable) {
                updateTableStatus(oldTable.id, "Available");
            }

            updateTableStatus(selectedTable.id, "Reserved");
        }

    } else {

        const selectedTable = tables.find(
            (table) => table.tableNumber === Number(tableNumber)
        );

        if (!selectedTable) {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not available.`,
            });
            return;
        }
        if (selectedTable.status !== "Available") {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not available.`,
            });
            return;
        }
        if (selectedTable.capacity < Number(guests)) {
            setReservationMessage({
                type: "error",
                message: `Table ${tableNumber} is not suitable for ${guests} guests.`,
            });
            return;
        }

        const newReservation: Reservation = {
            id: crypto.randomUUID(),
            customerName: customerName.trim(),
            phone: phone.trim(),
            date,
            time,
            guests: Number(guests),
            tableNumber: Number(tableNumber),
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        setReservation((prev) => [...prev, newReservation]);

        updateTableStatus(selectedTable.id, "Reserved");

        setReservationMessage({
            type: "success",
            message: `Reservation added successfully. Table ${selectedTable.tableNumber} is now reserved.`,
        });
    }

    setCustomerName("");
    setPhone("");
    setDate("");
    setTime("");
    setGuests("");
    setTableNumber("");
    setShowForm(false);
    setEditingReservation(null);
};

    const handleCancelReservation = (id:string) => {
        const reservationToCancel = reservation.find(
            (item) => item.id === id
        );
        if(!reservationToCancel)return;

        setReservation((prev) => 
        prev.map((item) => 
        item.id === id
        ? {...item,status:"Cancelled"}
        : item
    ));

    const table = tables.find(
        (item) => item.tableNumber === reservationToCancel.tableNumber
    );

    if(table) {
        updateTableStatus(table.id,"Available");
    }
    }

    const handleCompleteReservation = (id:string) => {
        const reservationToComplete = reservation.find(
            (item) => item.id === id
        );

        if(!reservationToComplete)return;

        setReservation((prev) => 
        prev.map((item) => 
        item.id === id
        ? {...item,status:"Completed"}
        : item));

        const table = tables.find(
            (item) => item.tableNumber === reservationToComplete.tableNumber
        );

        if(table){
            updateTableStatus(table.id,"Available");
        }
        setOpenMenuId(null);
    }

    const handleDeleteReservation = (reservationId: string) => {
        const confirmed = window.confirm(
           "Are you sure you want to delete this reservation?" 
        );

        if(!confirmed) return;

        const reservationToDelete = reservation.find(
            (item) => item.id === reservationId
        )

        if(!reservationToDelete)return;

        setReservation((prev) => 
            prev.filter((item) => item.id !== reservationId)
        );

        const table = tables.find((item) => item.tableNumber === reservationToDelete.tableNumber);

        if(table && (
            reservationToDelete.status === "Pending" || 
            reservationToDelete.status === "Confirmed")
        ) {
            updateTableStatus(table.id,"Available");
        }
        setOpenMenuId(null);
    }
 
    return (
        <div className="space-y-6">

            {reservationMessage && (
                <div className="fixed right-5 top-5 z=[100] w-full max-w-sm">
                    <div className={`rounded-xl border bg:white p-4 shadow-xl ${
                        reservationMessage.type === "success"
                        ? "border-emerald-200"
                        : "border-red-200"
                    }`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className={`text-sm font-semibold ${
                                    reservationMessage.type === "success"
                                    ? "text-emerald-700"
                                    : "text-red-700"
                                }`}>
                                    {reservationMessage.type === "success"
                                    ? "Reservation Successful"
                                    : "Reservation Failed"}  
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {reservationMessage.message}
                                </p>
                            </div>

                            <button
                            type="button"
                            onClick={() => setReservationMessage(null)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray hover:text-gray-600">
                                <X size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Reservations
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage restaurant reservations
                    </p>
                </div>

                <button
                type="button"
                onClick ={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700">
                    <Plus size={18}/>
                    Add Reservation
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white -4">

                <div className="flex flex-col gap-3 sm:flex-row">

                    <div className="relative max-w-md flex-1">

                        <Search size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                        <input
                        type="text"
                        placeholder="search reservations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                    </div>

                    <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReservationStatus | "All")}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500">

                        <option value="All">All</option>
                        <option value="pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-200">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                    Date
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                    Time
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                  Guests
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                   Table
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                   Status
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                   Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {filteredReservations.map((reservation) => (
                                <tr key={reservation.id}
                                className="transition hover: bg-slate-50">

                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">
                                            {reservation.customerName}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {reservation.phone}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {reservation.date}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {reservation.time}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {reservation.guests}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {reservation.tableNumber
                                        ? `# ${reservation.tableNumber}`
                                        : "Not assigned"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={ `rounded-full px-2.5 py-1 text-xs font-medium ${
                                            reservation.status === "Confirmed"
                                            ? "bg-emerald-50 text=emerald-600"
                                            : reservation.status === "Pending"
                                            ? "bg-amber-50 text-amber-600"
                                            : reservation.status === "Completed"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-red-50 text-red-600"
                                        }` }>
                                            {reservation.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        
                                        <div className="relative inline-block">

                                            <button
                                            type="button"
                                            title="Actions"
                                            onClick={() => 
                                                setOpenMenuId(
                                                    openMenuId === reservation.id ? null : reservation.id
                                                )
                                            }
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                                                <MoreHorizontal size={20}/>
                                            </button>

                                            {openMenuId === reservation.id && (
                                            <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">

                                                <button
                                                type="button"
                                                onClick={() => handleViewReservation(reservation)}
                                                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                    View Details
                                                </button>

                                                <button
                                                type="button"
                                                onClick={() => handleEditResservation(reservation)}
                                                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                    Edit
                                                </button>

                                                {(reservation.status === "Pending" || 
                                                    reservation.status === "Confirmed") && (
                                                        <>
                                                        <button
                                                        type="button"
                                                        onClick={()=>handleCancelReservation(reservation.id)}
                                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                                            Cancel
                                                        </button>

                                                        <button
                                                        type="button"
                                                        onClick={() => handleCompleteReservation(reservation.id)}
                                                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                            Complete
                                                        </button>
                                                        </>
                                                    )
                                                }

                                                <button
                                                type="button"
                                                onClick={() => handleDeleteReservation(reservation.id)}
                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                                    Delete
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredReservations.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                    No reservation found.
                </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                onClick={() => setShowForm(false)}>

                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingReservation ? "Edit Reservation" : "Add Reservation"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingReservation 
                                    ? "Update reservation information"
                                    : "Create a new resturnat reservation"}
                                </p>
                            </div>

                            <button type="button"
                            onClick={() => setShowForm(false)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleAddReservation} 
                        className="space-y-5 p-6">
                            <div >
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Customer Name
                                </label>

                                <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Phone
                                </label>

                                <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone Number..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Date
                                </label>

                                <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Time
                                </label>
                                
                                <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>

                            <div>
                                <label className="mb-2 text-sm font-medium text-slate-700">
                                    Number of Guests
                                </label>

                                <input
                                type="number"
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                placeholder="Enter number of guests"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>

                            <div>
                                <label className="mb-2 text-sm font-medium text-slate-700">
                                    Table Number
                                </label>
                                
                                {availableTables.length > 0 ?(
                                <select
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                    <option value=" ">Select Table</option>
                                    
                                    {availableTables.map((table) => (
                                        <option key={table.id} value={table.tableNumber}>
                                            Table {table.tableNumber} - {table.capacity} Seats - {table.section}
                                        </option>
                                    ))}
                                </select>
                                ) : (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                                        No tables available for {guests || 0} guests.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                    Cancel
                                </button>

                                <button
                                type="submit"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                    {editingReservation ? "Update Reservation" : "Add Reservation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedReservation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                onClick={() => setSelectedReservation(null)}>

                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Reservation Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Reservation information
                                </p>
                                </div>

                                <button
                                type="button"
                                onClick={() => setSelectedReservation(null)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                    <X size = {20}/>
                                </button>
                            </div>

                            <div className="space-y-5 p-6">

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Customer
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {selectedReservation.customerName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                       Phone
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900">
                                        {selectedReservation.phone}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-5">

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Date
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900">
                                        {selectedReservation.date}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                       Time
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900">
                                        {selectedReservation.time}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Guests
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900">
                                        {selectedReservation.guests}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                       Table
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900">
                                        {selectedReservation.tableNumber
                                        ? `Table ${selectedReservation.tableNumber}`
                                        : "Not assigned"}
                                    </p>
                                </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Status
                                    </p>

                                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                        selectedReservation.status === "Confirmed"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : selectedReservation.status === "Pending"
                                        ? "bg-amber-50 text-amber-600"
                                        : selectedReservation.status === "Completed"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-red-50 text-red-600"
                                    }`}>
                                        {selectedReservation.status}
                                    </span>
                                </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                            <button
                            type="button"
                            onClick={() => setSelectedReservation(null)}
                            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
export default Reservationspage;