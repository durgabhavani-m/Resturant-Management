
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LayersIcon from "@mui/icons-material/Layers";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTable } from "../../context/TableContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import type { RestaurantTable, TableStatus } from "../../types/table";
import { getNextRecordId } from "../../utils/recordIds";
import TableFloor from "./TableFloor";
import TableSummary from "./TablesSummary";

const TABLE_NOTICE_STORAGE_KEY = "restaurant_table_notice";
const TABLE_PAGE_STATE_KEY = "restaurant_table_page_state";
const SECTIONS_STORAGE_KEY = "restaurant_sections";

const DEFAULT_SECTIONS = ["Indoor", "Outdoor", "Private"];

const TablesPage = () => {
  const navigate = useNavigate();

  const {
    tables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
  } = useTable();

  const { preferences } = useAppPreferences();

  const [initialPageState] = useState(() => {
    try {
      const saved = localStorage.getItem(TABLE_PAGE_STATE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Restore saved sections, including sections with no tables.
  const [sections, setSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SECTIONS_STORAGE_KEY);
      const savedSections: unknown = saved
        ? JSON.parse(saved)
        : [];

      const validSavedSections = Array.isArray(savedSections)
        ? savedSections.filter(
            (item): item is string =>
              typeof item === "string" && item.trim() !== ""
          )
        : [];

      const combined = [
        ...DEFAULT_SECTIONS,
        ...validSavedSections,
      ];

      return combined.filter(
        (item, index) =>
          combined.findIndex(
            (section) =>
              section.toLowerCase() === item.toLowerCase()
          ) === index
      );
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionError, setSectionError] = useState("");

  const [search, setSearch] = useState<string>(
    () => initialPageState.search ?? ""
  );

  const [selectedSection, setSelectedSection] = useState<string>(
    () => initialPageState.selectedSection ?? "Indoor"
  );

  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [menuAnchorEl, setMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [showForm, setShowForm] = useState<boolean>(
    () => initialPageState.showForm ?? false
  );

  const [tableNotice, setTableNotice] = useState<string | null>(() =>
    sessionStorage.getItem(TABLE_NOTICE_STORAGE_KEY)
  );

  const [editingTableId, setEditingTableId] = useState<string | null>(
    () => initialPageState.editingTableId ?? null
  );

  const editingTable =
    tables.find((table) => table.id === editingTableId) ?? null;

  const [tableNumber, setTableNumber] = useState<string>(
    () => initialPageState.tableNumber ?? ""
  );

  const [capacity, setCapacity] = useState<string>(
    () => initialPageState.capacity ?? ""
  );

  const [section, setSection] = useState<string>(
    () => initialPageState.section ?? ""
  );

  const [formErrors, setFormErrors] = useState<{
    tableNumber?: string;
    capacity?: string;
    section?: string;
  }>({});

  // Include sections already used by existing tables.
  // This also supports sections created before section storage existed.
  useEffect(() => {
    const missingSections = tables
      .map((table) => table.section.trim())
      .filter(
        (tableSection) =>
          tableSection !== "" &&
          !sections.some(
            (existing) =>
              existing.toLowerCase() === tableSection.toLowerCase()
          )
      );

    if (missingSections.length > 0) {
      setSections((previous) => {
        const updated = [...previous];

        missingSections.forEach((newSection) => {
          if (
            !updated.some(
              (existing) =>
                existing.toLowerCase() === newSection.toLowerCase()
            )
          ) {
            updated.push(newSection);
          }
        });

        return updated;
      });
    }
  }, [tables, sections]);

  // Persist section names separately from table records.
  useEffect(() => {
    try {
      localStorage.setItem(
        SECTIONS_STORAGE_KEY,
        JSON.stringify(sections)
      );
    } catch (error) {
      console.error("Failed to save sections:", error);
    }
  }, [sections]);

  // Persist table-page filters and unfinished form state.
  useEffect(() => {
    try {
      localStorage.setItem(
        TABLE_PAGE_STATE_KEY,
        JSON.stringify({
          search,
          selectedSection,
          showForm,
          editingTableId,
          tableNumber,
          capacity,
          section,
        })
      );
    } catch (error) {
      console.error("Failed to save table page state:", error);
    }
  }, [
    search,
    selectedSection,
    showForm,
    editingTableId,
    tableNumber,
    capacity,
    section,
  ]);

  // Remove the stored notice after it has been loaded.
  useEffect(() => {
    if (tableNotice) {
      sessionStorage.removeItem(TABLE_NOTICE_STORAGE_KEY);
    }
  }, [tableNotice]);

  // Automatically hide table notifications after five seconds.
  useEffect(() => {
    if (!tableNotice) return;

    const timeoutId = window.setTimeout(
      () => setTableNotice(null),
      5000
    );

    return () => window.clearTimeout(timeoutId);
  }, [tableNotice]);

  // Filter tables by search text and selected section.
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

  // Summary counts passed to TablesSummary.
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

  const closeActionMenu = () => {
    setOpenMenuId(null);
    setMenuAnchorEl(null);
  };

  // Add a new section with duplicate-name validation.
  const handleAddSection = () => {
    const name = newSectionName.trim();

    if (!name) {
      setSectionError("Please enter a section name.");
      return;
    }

    const alreadyExists = sections.some(
      (existing) =>
        existing.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setSectionError("This section already exists.");
      return;
    }

    setSections((previous) => [...previous, name]);

    // Select the new section so the user can immediately use it.
    setSelectedSection(name);
    setSection(name);

    setNewSectionName("");
    setSectionError("");
    setShowSectionForm(false);
  };

  // Validate and save a new table or an edited table.
  const handleSubmitTable = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      tableNumber?: string;
      capacity?: string;
      section?: string;
    } = {};

    const parsedTableNumber = Number(tableNumber);
    const parsedCapacity = Number(capacity);
    const trimmedSection = section.trim();

    if (!tableNumber.trim()) {
      errors.tableNumber = "Table number is required.";
    } else if (
      !Number.isInteger(parsedTableNumber) ||
      parsedTableNumber <= 0
    ) {
      errors.tableNumber =
        "Table number must be a positive whole number.";
    }

    if (!capacity.trim()) {
      errors.capacity = "Capacity is required.";
    } else if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      errors.capacity =
        "Capacity must be a positive whole number.";
    }

    if (!trimmedSection) {
      errors.section = "Section is required.";
    } else if (
      !sections.some(
        (item) =>
          item.toLowerCase() === trimmedSection.toLowerCase()
      )
    ) {
      errors.section = "Please select a valid section.";
    }

    const duplicateTable = tables.some(
      (table) =>
        table.tableNumber === parsedTableNumber &&
        table.section.toLowerCase() === trimmedSection.toLowerCase() &&
        table.id !== editingTable?.id
    );

    if (tableNumber.trim() && duplicateTable) {
      errors.tableNumber =
        `Table ${parsedTableNumber} already exists in ${trimmedSection}.`;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (editingTable) {
      const updatedTable: RestaurantTable = {
        ...editingTable,
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: trimmedSection,
      };

      updateTable(updatedTable);
    } else {
      const newTable: RestaurantTable = {
        id: getNextRecordId(
          "TABLE",
          tables.map((table) => table.id)
        ),
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity,
        section: trimmedSection,
        status: "Available",
      };

      addTable(newTable);
    }

    setSelectedSection(trimmedSection);
    handleCloseForm();
  };

  const handleDeleteTable = (tableId: string) => {
    if (
      preferences.confirmBeforeDelete &&
      !window.confirm("Are you sure you want to delete this table?")
    ) {
      return;
    }

    deleteTable(tableId);
    closeActionMenu();

    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const handleViewTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    closeActionMenu();
  };

  const handleOpenTable = (table: RestaurantTable) => {
    if (table.status === "Cleaning") {
      handleViewTable(table);
      return;
    }

    navigate(`/tables/${table.id}/order`);
  };

  const handleEditTable = (table: RestaurantTable) => {
    setEditingTableId(table.id);
    setTableNumber(table.tableNumber.toString());
    setCapacity(table.capacity.toString());
    setSection(table.section);
    setFormErrors({});
    setShowForm(true);
    closeActionMenu();
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

      if (newStatus === "Reserved") {
        const message = `Table ${updatedTable.tableNumber} reserved.`;
        sessionStorage.setItem(TABLE_NOTICE_STORAGE_KEY, message);
        setTableNotice(message);
      }
    }
  };

  const handleOpenAddForm = () => {
    setEditingTableId(null);
    setTableNumber("");
    setCapacity("");
    setSection(
      sections.includes(selectedSection)
        ? selectedSection
        : sections[0] ?? ""
    );
    setFormErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTableId(null);
    setTableNumber("");
    setCapacity("");
    setSection("");
    setFormErrors({});
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        minHeight: 0,
      }}
    >
      {tableNotice && (
        <Alert
          severity="success"
          onClose={() => setTableNotice(null)}
          sx={{
            position: "fixed",
            right: 20,
            top: 20,
            zIndex: 1300,
            boxShadow: 3,
          }}
        >
          {tableNotice}
        </Alert>
      )}

      {/* Page heading and action buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h1">Tables</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage and monitor your restaurant floor.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LayersIcon />}
            onClick={() => {
              setNewSectionName("");
              setSectionError("");
              setShowSectionForm(true);
            }}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Add Section
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddForm}
          >
            Add Table
          </Button>
        </Box>
      </Box>

      {/* Summary cards */}
      <TableSummary
        totalTables={totalTables}
        availableTables={availableTables}
        occupiedTables={occupiedTables}
        reservedTables={reservedTables}
        cleaningTables={cleaningTables}
      />

      {/* Search */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search table or section..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          sx={{ maxWidth: { lg: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Paper>

      {/* Table floor */}
      <TableFloor
        tables={filteredTables}
        selectedSection={selectedSection}
        sections={sections}
        onSectionChange={setSelectedSection}
        openMenuId={openMenuId}
        menuAnchorEl={menuAnchorEl}
        onOpenTable={handleOpenTable}
        onViewTable={handleViewTable}
        onEditTable={handleEditTable}
        onDeleteTable={handleDeleteTable}
        onOpenMenu={(tableId, anchor) => {
          setOpenMenuId(tableId);
          setMenuAnchorEl(anchor);
        }}
        onCloseMenu={closeActionMenu}
        onTablePositionChange={(tableId, x, y) => {
          const table = tables.find((item) => item.id === tableId);

          if (table) {
            updateTable({ ...table, x, y });
          }
        }}
      />

      {/* Add Section dialog */}
      <Dialog
        open={showSectionForm}
        onClose={() => setShowSectionForm(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Section</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="normal"
            label="Section Name"
            placeholder="e.g. Rooftop"
            value={newSectionName}
            onChange={(event) => {
              setNewSectionName(event.target.value);
              setSectionError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddSection();
              }
            }}
            error={Boolean(sectionError)}
            helperText={sectionError || "Enter a unique section name."}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowSectionForm(false)}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSection}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table details dialog */}
      <Dialog
        open={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        maxWidth="xs"
        fullWidth
      >
        {selectedTable && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pr: 1,
              }}
            >
              <Box>
                <Typography variant="h3">
                  Table {selectedTable.tableNumber}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedTable.section}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setSelectedTable(null)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
                    <CardContent
                      sx={{ py: 2, "&:last-child": { pb: 2 } }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Capacity
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PeopleIcon fontSize="small" />
                        <Typography variant="h6" fontWeight={600}>
                          {selectedTable.capacity}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
                    <CardContent
                      sx={{ py: 2, "&:last-child": { pb: 2 } }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Section
                      </Typography>

                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                      >
                        {selectedTable.section}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Current Status
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedTable.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor:
                          selectedTable.status === "Available"
                            ? "#ecfdf5"
                            : selectedTable.status === "Occupied"
                              ? "#fef2f2"
                              : selectedTable.status === "Reserved"
                                ? "#fffbeb"
                                : "#eff6ff",
                        color:
                          selectedTable.status === "Available"
                            ? "#047857"
                            : selectedTable.status === "Occupied"
                              ? "#b91c1c"
                              : selectedTable.status === "Reserved"
                                ? "#b45309"
                                : "#1d4ed8",
                      }}
                    />
                  </Box>

                  {selectedTable.status === "Cleaning" && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1.5, color: "#1d4ed8" }}
                    >
                      This table is being cleaned. Mark it Available when
                      cleaning is complete to start a new order.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ mb: 1 }}
              >
                Table Actions
              </Typography>

              <Grid container spacing={1}>
                {selectedTable.status !== "Occupied" && (
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        handleStatusChange(selectedTable.id, "Occupied")
                      }
                      sx={{
                        borderColor: "#fecaca",
                        bgcolor: "#fef2f2",
                        color: "#b91c1c",
                        "&:hover": {
                          bgcolor: "#fee2e2",
                          borderColor: "#fca5a5",
                        },
                      }}
                    >
                      Mark Occupied
                    </Button>
                  </Grid>
                )}

                {selectedTable.status !== "Cleaning" && (
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        handleStatusChange(selectedTable.id, "Cleaning")
                      }
                      sx={{
                        borderColor: "#bfdbfe",
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        "&:hover": {
                          bgcolor: "#dbeafe",
                          borderColor: "#93c5fd",
                        },
                      }}
                    >
                      Mark Cleaning
                    </Button>
                  </Grid>
                )}

                {selectedTable.status !== "Available" && (
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        handleStatusChange(selectedTable.id, "Available")
                      }
                      sx={{
                        borderColor: "#a7f3d0",
                        bgcolor: "#ecfdf5",
                        color: "#047857",
                        "&:hover": {
                          bgcolor: "#d1fae5",
                          borderColor: "#6ee7b6",
                        },
                      }}
                    >
                      Mark Available
                    </Button>
                  </Grid>
                )}

                {selectedTable.status !== "Reserved" && (
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        handleStatusChange(selectedTable.id, "Reserved")
                      }
                      sx={{
                        borderColor: "#fde68a",
                        bgcolor: "#fffbeb",
                        color: "#b45309",
                        "&:hover": {
                          bgcolor: "#fef3c7",
                          borderColor: "#fcd34d",
                        },
                      }}
                    >
                      Mark Reserved
                    </Button>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                onClick={() => setSelectedTable(null)}
                sx={{
                  bgcolor: "grey.900",
                  "&:hover": { bgcolor: "grey.800" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit table dialog */}
      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontSize: "1.5rem", lineHeight: 1.3 }}
            >
              {editingTable ? "Edit Table" : "Add Table"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {editingTable
                ? "Update table configuration"
                : "Create a new restaurant table"}
            </Typography>
          </Box>

          <IconButton onClick={handleCloseForm} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmitTable}>
          <DialogContent
            dividers
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <TextField
              label="Table Number"
              type="number"
              fullWidth
              value={tableNumber}
              onChange={(event) => {
                setTableNumber(event.target.value);
                setFormErrors((previous) => ({
                  ...previous,
                  tableNumber: undefined,
                }));
              }}
              placeholder="Enter table number"
              error={Boolean(formErrors.tableNumber)}
              helperText={formErrors.tableNumber}
              inputProps={{ min: 1 }}
            />

            <Box>
              <TextField
                label="Guest Capacity"
                type="number"
                fullWidth
                value={capacity}
                onChange={(event) => {
                  setCapacity(event.target.value);
                  setFormErrors((previous) => ({
                    ...previous,
                    capacity: undefined,
                  }));
                }}
                placeholder="Number of guests"
                error={Boolean(formErrors.capacity)}
                helperText={formErrors.capacity}
                inputProps={{ min: 1 }}
              />

              {!formErrors.capacity && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 0.75, display: "block" }}
                >
                  Table size on the floor plan is based on this capacity.
                </Typography>
              )}
            </Box>

            <TextField
              select
              label="Section"
              fullWidth
              value={section}
              onChange={(event) => {
                setSection(event.target.value);
                setFormErrors((previous) => ({
                  ...previous,
                  section: undefined,
                }));
              }}
              error={Boolean(formErrors.section)}
              helperText={formErrors.section}
            >
              {sections.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>

          <CardActions
            sx={{
              justifyContent: "flex-end",
              px: 3,
              py: 2,
              gap: 1,
            }}
          >
            <Button variant="outlined" onClick={handleCloseForm}>
              Cancel
            </Button>

            <Button type="submit" variant="contained" color="primary">
              {editingTable ? "Save Changes" : "Add Table"}
            </Button>
          </CardActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TablesPage;
