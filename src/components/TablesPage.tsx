import {
  Search,
  Plus,
  X,
  MoreHorizontal,
  Users,
  CheckCircle2,
  Clock3,
  Sparkles,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import { useTable } from "../context/TableContext";
import type { RestaurantTable, TableStatus } from "../types/table";
import { useEffect, useMemo, useState } from "react";
import {useNavigate} from "react-router-dom";
import {createRecordId} from "../utils/recordIds";

const TABLE_NOTICE_STORAGE_KEY = "restaurant_table_notice";

const TablesPage = () => {

  const navigate = useNavigate();

  const {
    tables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
  } = useTable();

  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("Indoor");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tableNotice, setTableNotice] = useState<string | null>(() =>
    sessionStorage.getItem(TABLE_NOTICE_STORAGE_KEY)
  );
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [section, setSection] = useState("");
  const [formErrors, setFormErrors] = useState<{
    tableNumber?: string;
    capacity?: string;
    section?: string;
  }>({});

  useEffect(() => {
    if (tableNotice) {
      sessionStorage.removeItem(TABLE_NOTICE_STORAGE_KEY);
    }
  }, [tableNotice]);

  useEffect(() => {
    if (!tableNotice) return;
    const timeoutId = window.setTimeout(() => setTableNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [tableNotice]);


  const sections = useMemo(() => {
    return Array.from(
      new Set(tables.map((table) => table.section))
    );
  }, [tables]);


  const filteredTables = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesSearch =
        table.tableNumber.toString().includes(searchValue) ||
        table.section.toLowerCase().includes(searchValue);

      const matchesSection = table.section === selectedSection;

      return matchesSearch && matchesSection;
    });
  }, [tables, search, selectedSection]);


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

 
  const getTableShape = (capacity: number) => {
    if (capacity <= 2) {
      return {
        wrapper: "h-28 w-28",
        shape: "rounded-full",
      };
    }

    if (capacity <= 4) {
      return {
        wrapper: "h-32 w-32",
        shape: "rounded-2xl",
      };
    }

    if (capacity <= 6) {
      return {
        wrapper: "h-32 w-44",
        shape: "rounded-2xl",
      };
    }

    return {
      wrapper: "h-36 w-56",
      shape: "rounded-2xl",
    };
  };

 
  const getStatusStyles = (status: TableStatus) => {
    switch (status) {
      case "Available":
        return {
          border: "border-emerald-400",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };

      case "Occupied":
        return {
          border: "border-red-400",
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          icon: Users,
        };

      case "Reserved":
        return {
          border: "border-amber-400",
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
          icon: Clock3,
        };

      case "Cleaning":
        return {
          border: "border-blue-400",
          bg: "bg-blue-50",
          text: "text-blue-700",
          dot: "bg-blue-500",
          icon: Sparkles,
        };
    }
  };

 
  const handleSubmitTable = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      tableNumber?: string;
      capacity?: string;
      section?: string;
    } = {};

    const parsedTableNumber = Number(tableNumber);
    const parsedCapacity = Number(capacity);

    if (!tableNumber) {
      errors.tableNumber = "Table number is required.";
    } else if (parsedTableNumber <= 0) {
      errors.tableNumber = "Table number must be greater than 0.";
    }

    if (!capacity) {
      errors.capacity = "Capacity is required.";
    } else if (parsedCapacity <= 0) {
      errors.capacity = "Capacity must be greater than 0.";
    }

    if (!section.trim()) {
      errors.section = "Section is required.";
    }

    const duplicateTable = tables.some(
      (table) =>
        table.tableNumber === parsedTableNumber &&
        table.section === section.trim() &&
        table.id !== editingTable?.id
    );

    if (tableNumber && duplicateTable) {
      errors.tableNumber = `Table ${parsedTableNumber} already exists in ${section.trim()}.`;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (editingTable) {
      const updatedTable: RestaurantTable = {
        ...editingTable,
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: section.trim(),
      };

      updateTable(updatedTable);
    } else {
      const newTable: RestaurantTable = {
        id: createRecordId("TABLE"),
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: section.trim(),
        status: "Available",
      };

      addTable(newTable);
    }

    handleCloseForm();
  };

 
  const handleDeleteTable = (tableId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this table?"
    );

    if (!confirmed) return;

    deleteTable(tableId);

    setOpenMenuId(null);

    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

 
  const handleViewTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    setOpenMenuId(null);
  };

  
  const handleEditTable = (table: RestaurantTable) => {
    setEditingTable(table);
    setTableNumber(table.tableNumber.toString());
    setCapacity(table.capacity.toString());
    setSection(table.section);
    setFormErrors({});
    setShowForm(true);
    setOpenMenuId(null);
  };

 
  const handleStatusChange = (
    tableId: string,
    newStatus: TableStatus
  ) => {
    updateTableStatus(tableId, newStatus);

    const updatedTable = tables.find(
      (table) => table.id === tableId
    );

    if (updatedTable) {
      setSelectedTable({
        ...updatedTable,
        status: newStatus,
      });
    }

    if (newStatus === "Reserved" && updatedTable) {
      setTableNotice(`Table ${updatedTable.tableNumber} reserved.`);
    }
  };

 
  const handleOpenAddForm = () => {
    setEditingTable(null);
    setTableNumber("");
    setCapacity("");
    setSection(selectedSection);
    setFormErrors({});
    setShowForm(true);
  };

 
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTable(null);
    setTableNumber("");
    setCapacity("");
    setSection("");
    setFormErrors({});
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {tableNotice && (
        <div
          role="status"
          className="fixed right-5 top-5 z-100 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl"
        >
          <CheckCircle2 size={18} />
          {tableNotice}
          <button
            type="button"
            onClick={() => setTableNotice(null)}
            className="ml-2 text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss table notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tables
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor your restaurant floor.
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

   
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalTables}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Available
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {availableTables}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Occupied
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {occupiedTables}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Reserved
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {reservedTables}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Cleaning
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-700">
            {cleaningTables}
          </p>
        </div>
      </div>

     
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
         
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search table or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section) => {
              const sectionTables = tables.filter(
                (table) => table.section === section
              );
              const isActive = selectedSection === section;

            return (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}>
                {section}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                  ? "bg-wgite/20"
                  : "bg-gray-100 text-gray-500"
                }`}>
                  {sectionTables.length}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </div>


      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
     
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Restaurant Floor
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a table to view details and manage its current state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Available
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Occupied
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Reserved
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Cleaning
            </div>
          </div>
        </div>

  
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {filteredTables.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Search
                  size={24}
                  className="text-slate-400"
                />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                No tables found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Try changing your search or selecting another section.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedSection(section[0] || "Indoor");
                }}
                className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex min-h-64 flex-wrap items-center justify-center gap-8 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6">
              {filteredTables
              .filter((table) => table.section === selectedSection)
              .sort((a,b) => a.tableNumber -b.tableNumber)
              .map((table) => {
                const shape = getTableShape(table.capacity);
                const statusStyles = getStatusStyles(table.status);
                const StatusIcon = statusStyles.icon;
            
                        return (
                          <div
                            key={table.id}
                            className="relative flex flex-col items-center">
                       
                            <div className="absolute -right-5 -top-5 z-20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setOpenMenuId(
                                    openMenuId === table.id
                                      ? null
                                      : table.id
                                  );
                                }}
                                className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700">
                                <MoreHorizontal size={16} />
                              </button>

                              {openMenuId === table.id && (
                                <div className="absolute right-0 top-9 z-50 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => handleViewTable(table)}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                    <Eye size={16} />
                                    View Details
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditTable(table)
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                    <Pencil size={16} />
                                    Edit Table
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteTable(table.id)
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 size={16} />
                                    Delete Table
                                  </button>
                                </div>
                              )}
                            </div>

  
                            <button
                              type="button"
                              onClick={() => navigate(`/tables/${table.id}/order`)}
                              className={`${shape.wrapper} ${shape.shape} relative flex flex-col items-center justify-center border-2 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${statusStyles.border}`}>
                         
                              <span
                                className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white ${statusStyles.dot}`}
                              />

                              <span className="text-sm font-bold text-slate-900">
                                Table {table.tableNumber}
                              </span>

                              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <Users size={13} />

                                <span>
                                  {table.capacity} guests
                                </span>
                              </div>

                              <div
                                className={`mt-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles.bg} ${statusStyles.text}`}>
                                <StatusIcon size={11} />

                                {table.status}
                              </div>
                            </button>


                            <div className="mt-3 text-center">
                              <p className="text-xs font-medium text-slate-500">
                                {table.capacity} seat
                                {table.capacity !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
           </div>
      </div>
   
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTable(null)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
        
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Table {selectedTable.tableNumber}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedTable.section}
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
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Capacity
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Users size={18} />
                    {selectedTable.capacity}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Section
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedTable.section}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Current Status
                </p>

                <div
                  className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    getStatusStyles(
                      selectedTable.status
                    ).bg
                  } ${
                    getStatusStyles(
                      selectedTable.status
                    ).text
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      getStatusStyles(
                        selectedTable.status
                      ).dot
                    }`}
                  />

                  {selectedTable.status}
                </div>
              </div>


              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  Table Actions
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {selectedTable.status !== "Occupied" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedTable.id,
                          "Occupied"
                        )
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                      Mark Occupied
                    </button>
                  )}

                  {selectedTable.status !== "Cleaning" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedTable.id,
                          "Cleaning"
                        )
                      }
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                      Mark Cleaning
                    </button>
                  )}

                  {selectedTable.status !== "Available" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedTable.id,
                          "Available"
                        )
                      }
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                      Mark Available
                    </button>
                  )}

                  {selectedTable.status !== "Reserved" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedTable.id,
                          "Reserved"
                        )
                      }
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100">
                      Mark Reserved
                    </button>
                  )}
                </div>
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
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
         
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingTable
                    ? "Edit Table"
                    : "Add Table"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTable
                    ? "Update table configuration"
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

            <form onSubmit={handleSubmitTable}>
              <div className="space-y-5 p-6">
            
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Table Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,
                        tableNumber: undefined,
                      }));
                    }}
                    placeholder="Enter table number"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                      formErrors.tableNumber
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                  />

                  {formErrors.tableNumber && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formErrors.tableNumber}
                    </p>
                  )}
                </div>


                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Guest Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => {
                      setCapacity(e.target.value);

                      setFormErrors((prev) => ({
                        ...prev,
                        capacity: undefined,
                      }));
                    }}
                    placeholder="Number of guests"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                      formErrors.capacity
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Table size on the floor plan is based on this capacity.
                  </p>

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
                    onChange={(e) => {
                      setSection(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,
                        section: undefined,
                      }));
                    }}
                    placeholder="e.g. Main Room, Banquet Room, Outdoor"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                      formErrors.section
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                  />

                  {formErrors.section && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formErrors.section}
                    </p>
                  )}
                </div>
              </div>

  
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
                >
                  {editingTable
                    ? "Save Changes"
                    : "Add Table"}
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