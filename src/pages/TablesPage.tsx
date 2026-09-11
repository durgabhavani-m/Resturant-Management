import { Search, Plus, X, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {useTable} from "../context/TableContext";
import type { RestaurantTable, TableStatus} from "../types/table";

const TablesPage = () => {
  const {
    tables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
  } = useTable();
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] =useState<RestaurantTable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] =useState<RestaurantTable | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [section, setSection] = useState("");
  const [statusTable, setStatusTable] = useState<TableStatus>("Available");
  const [tableFilter, setTableFilter] = useState<TableStatus | "All">("All");
  const [capacityFilter, setCapacityFilter] = useState<number | "All">("All");
  const [sortBy, setSortBy] = useState<"tableNumber" | "capacity" | "section" | "status">("tableNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "dsc">("asc");
  const [formErrors, setFormErrors] = useState<{
    tableNumber?:string;
    capacity?:string;
    section?:string;
  }>({});


  const filteredTables = tables.filter((table) => {

    const searchValue = search.trim().toLowerCase();

    const matchesSearch = 
    table.tableNumber.toString().includes(searchValue) ||
    table.section.toLowerCase().includes(searchValue);

    const matchesStatus =
      tableFilter === "All" ||
      table.status === tableFilter;

      const matchesCapacity = 
      capacityFilter === "All" ||
      table.capacity >= capacityFilter;

    return matchesSearch && matchesStatus && matchesCapacity;
  })
  .sort((a, b) => {
    let comparison = 0;

    if(sortBy === "tableNumber"){
      comparison  = a.tableNumber - b.tableNumber;
    }
    if(sortBy === "capacity"){
      comparison = a.capacity - b.capacity;
    }
    if(sortBy === "section"){
      comparison = a.section.localeCompare(b.section);
    }
    if(sortBy === "status"){
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalTables = tables.length;

   const availableTables = tables.filter(
    (table) => table.status === "Available"
  ).length;

   const occupiedTables = tables.filter(
    (table) => table.status === "Occupied"
  ).length;

  const reservedTables = tables.filter(
    (table) => table.status === "Reserved"
  ).length;

  const cleaningTables = tables.filter(
    (table) => table.status === "Cleaning"
  ).length;

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();

    const errors:{
        tableNumber?:string;
        capacity?:string;
        section?:string;
    } = {};

    const parsedTableNumber = Number(tableNumber);
    const parsedCapacity = Number(capacity);

    if(!tableNumber) {
        errors.tableNumber = "Table number is required.";
    }else if(parsedTableNumber <= 0){
        errors.tableNumber = "Table number must be greater than 0.";
    }

    if(!capacity){
        errors.capacity = "Capacity is required.";
    }else if(parsedCapacity <= 0){
        errors.capacity = "Capacity must be greater than 0.";
    }

    if(!section.trim()){
        errors.section = "Section is required.";
    }

    const duplicateTable = tables.some(
        (table) => 
        table.tableNumber === parsedTableNumber && 
        table.id !== editingTable?.id
    );

    if(tableNumber && duplicateTable){
        errors.tableNumber = `Table ${parsedTableNumber} already exists.`;
    }

    setFormErrors(errors);

    if(Object.keys(errors).length > 0){
        return;
    }

    if (editingTable) {
      const updatedTable: RestaurantTable = {
        ...editingTable,
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: section.trim(),
        status: statusTable,
      };

      updateTable(updatedTable);
    } else {
      const newTable: RestaurantTable = {
        id: crypto.randomUUID(),
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: section.trim(),
        status: statusTable,
      };

      addTable(newTable);
    }

    setTableNumber("");
    setCapacity("");
    setSection("");
    setStatusTable("Available");
    setFormErrors({});
    setShowForm(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this table?"
    );

    if (!confirmed) return;

    deleteTable(tableId);

    setOpenMenuId(null);
    setOpenStatusId(null);
  };

  const handleViewTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    setOpenMenuId(null);
    setOpenStatusId(null);
  };

  const handleEditTable = (table: RestaurantTable) => {
    setEditingTable(table);

    setTableNumber(table.tableNumber.toString());
    setCapacity(table.capacity.toString());
    setSection(table.section);
    setStatusTable(table.status);

    setShowForm(true);

    setOpenMenuId(null);
    setOpenStatusId(null);
  };

  const handleStatusChange = (
    tableId: string,
    newStatus: TableStatus
  ) => {
    updateTableStatus(tableId, newStatus)

    setOpenMenuId(null);
    setOpenStatusId(null);
  };

  const handleOpenAddForm = () => {
    setEditingTable(null);
    setTableNumber("");
    setCapacity("");
    setSection("");
    setStatusTable("Available");
    setFormErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTable(null);
    setTableNumber("");
    setCapacity("");
    setSection("");
    setStatusTable("Available");
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tables
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage restaurant tables and their current status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700">
          <Plus size={18} />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-center text-slate-900">
            Total Tables
          </p>

          <p className="mt-2 text-2xl text-center font-bold text-slate-900">
            {totalTables}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-center text-slate-900">
            Available
          </p>

          <p className="mt-2 text-2xl text-center font-bold text-emerald-600">
            {availableTables}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-center text-slate-900">
            Occupied
          </p>

          <p className="mt-2 text-2xl text-center font-bold text-red-600">
            {occupiedTables}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-center text-slate-900">
            Reserved
          </p>

          <p className="mt-2 text-2xl text-center font-bold text-amber-600">
            {reservedTables}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-md text-center font-bold text-slate-900">
            Cleaning
          </p>

          <p className="mt-2 text-2xl text-center font-bold text-blue-600">
            {cleaningTables}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by table or section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
        value={capacityFilter}
        onChange={(e) => 
          setCapacityFilter(
            e.target.value === "All"
            ? "All"
            : Number(e.target.value)
          )
        }
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"> 
        <option value="All">All Capacities</option>
        <option value="2">2+ Guests</option>
        <option value="4">4+ Guests</option>
        <option value="6">6+ Guests</option>
        <option value="8">8+ Guests</option>
        </select>
      </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={tableFilter}
          onChange={(e) =>
            setTableFilter(
              e.target.value as TableStatus | "All"
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Reserved">Reserved</option>
          <option value="Cleaning">Cleaning</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm font-medium text-slate-600">
            Sort By
          </label>

          <select 
          value={sortBy}
          onChange={(e) => 
            setSortBy(
            e.target.value as
            | "tableNumber"
            | "capacity"
            | "section"
            | "status"
          )
        }
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
          <option value="tableNumber">Table Number</option>
          <option value="capacity">Capacity</option>
          <option value="section">Section</option>
          <option value="status">Status</option>
          </select>

          <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "dsc")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
            <option value="asc">Ascending</option>
            <option value="dsc">Descending</option>
          </select>
        </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Table
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Capacity
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Section
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search size={22}
                          className="text-slate-400"/>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        No tables found
                      </h3>

                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        No tables match your current search or status filter.
                      </p>

                      {(search || tableFilter ||capacityFilter !== "All" ) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setTableFilter("All")
                            setCapacityFilter("All");
                          }}
                          className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700">
                          Clear search and filters
                        </button>
                      )}

                      {!search &&
                        tableFilter === "All" && (
                          <button
                            type="button"
                            onClick={handleOpenAddForm}
                            className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700">
                            Add Table
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => (
                  <tr
                    key={table.id}
                    className="transition hover:bg-slate-50">

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Table {table.tableNumber}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {table.capacity} Guests
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {table.section}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          table.status === "Available"
                            ? "bg-emerald-50 text-emerald-600"
                            : table.status === "Occupied"
                            ? "bg-red-50 text-red-600"
                            : table.status === "Reserved"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {table.status}
                      </span>
                    </td>

                    <td className="relative px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(
                            openMenuId === table.id
                              ? null
                              : table.id
                          );
                          setOpenStatusId(null);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <MoreHorizontal size={20} />
                      </button>

                      {openMenuId === table.id && (
                        <div className="absolute right-6 top-12 z-50 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewTable(table)
                            }
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEditTable(table)
                            }
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" >
                            Edit
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStatusId(
                                  openStatusId === table.id
                                    ? null
                                    : table.id
                                )
                              }
                              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <span>Change Status</span>
                              <span className="text-slate-400">
                                ›
                              </span>
                            </button>

                            {openStatusId === table.id && (
                              <div className="absolute right-full top-full mr-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {(
                                  [
                                    "Available","Occupied", "Reserved","Cleaning",
                                  ] as TableStatus[]
                                ).map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => {
                                      handleStatusChange( table.id,status );
                                    }}
                                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                                      table.status === status
                                        ? "font-semibold text-orange-600"
                                        : "text-slate-700"
                                    }`} >
                                    {status}
                                    {table.status === status}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteTable(table.id)
                            }
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTable(null)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Table Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information about table{" "}
                  {selectedTable.tableNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Table Number
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  Table {selectedTable.tableNumber}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Capacity
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {selectedTable.capacity} Guests
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Section
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {selectedTable.section}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selectedTable.status === "Available"
                      ? "bg-emerald-50 text-emerald-600"
                      : selectedTable.status === "Occupied"
                      ? "bg-red-50 text-red-600"
                      : selectedTable.status === "Reserved"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                  {selectedTable.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={handleCloseForm}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingTable ? "Edit Table" : "Add Table"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTable
                    ? "Update restaurant table information"
                    : "Create a new restaurant table"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTable}>
              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Table Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) =>{
                      setTableNumber(e.target.value)
                      setFormErrors((prev) => ({
                        ...prev,tableNumber:undefined,
                      }));
                    }}
                    placeholder="Enter table number"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        formErrors.tableNumber 
                     ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                     : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}/>

                    {formErrors.tableNumber && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {formErrors.tableNumber}
                        </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) =>{
                      setCapacity(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,capacity:undefined,
                      }))
                    }}
                    placeholder="Number of guests"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        formErrors.capacity
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}/>

                    {formErrors.capacity && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {formErrors.capacity}
                        </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Section
                  </label>

                  <input
                    type="text"
                    value={section}
                    onChange={(e) =>{
                      setSection(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,section:undefined,
                      }));
                    }}
                    placeholder="e.g. Indoor, Outdoor, Private"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        formErrors.section
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}/>

                    {formErrors.section && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {formErrors.section}
                        </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={statusTable} 
                    onChange={(e) =>
                      setStatusTable(
                        e.target.value as TableStatus
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                    <option value="Available">
                      Available
                    </option>

                    <option value="Occupied">
                      Occupied
                    </option>

                    <option value="Reserved">
                      Reserved
                    </option>

                    <option value="Cleaning">
                      Cleaning
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700">
                  {editingTable ? "Save Changes" : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;