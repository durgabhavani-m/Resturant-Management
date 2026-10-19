
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import type { SvgIconComponent } from "@mui/icons-material";

import type { RestaurantTable, TableStatus } from "../../types/table";

interface TableFloorProps {
  tables: RestaurantTable[];
  selectedSection: string;
  openMenuId: string | null;
  menuAnchorEl: HTMLElement | null;
  onOpenTable: (table: RestaurantTable) => void;
  onViewTable: (table: RestaurantTable) => void;
  onEditTable: (table: RestaurantTable) => void;
  onDeleteTable: (tableId: string) => void;
  onOpenMenu: (
    tableId: string,
    anchor: HTMLElement
  ) => void;
  onCloseMenu: () => void;
}

const getTableShape = (capacity: number) => {
  if (capacity <= 2) {
    return { width: 112, height: 112, borderRadius: "50%" };
  }

  if (capacity <= 4) {
    return { width: 128, height: 128, borderRadius: 2 };
  }

  if (capacity <= 6) {
    return { width: 176, height: 128, borderRadius: 2 };
  }

  return { width: 224, height: 144, borderRadius: 2 };
};

const getStatusStyles = (
  status: TableStatus
): {
  border: string;
  bg: string;
  text: string;
  dot: string;
  icon: SvgIconComponent;
} => {
  switch (status) {
    case "Available":
      return {
        border: "#34d399",
        bg: "#ecfdf5",
        text: "#047857",
        dot: "#10b981",
        icon: CheckCircleIcon,
      };

    case "Occupied":
      return {
        border: "#f87171",
        bg: "#fef2f2",
        text: "#b91c1c",
        dot: "#ef4444",
        icon: PeopleIcon,
      };

    case "Reserved":
      return {
        border: "#fbbf24",
        bg: "#fffbeb",
        text: "#b45309",
        dot: "#f59e0b",
        icon: AccessTimeIcon,
      };

    case "Cleaning":
      return {
        border: "#60a5fa",
        bg: "#eff6ff",
        text: "#1d4ed8",
        dot: "#3b82f6",
        icon: AutoAwesomeIcon,
      };
  }
};

const TableFloor = ({
  tables,
  selectedSection,
  openMenuId,
  menuAnchorEl,
  onOpenTable,
  onViewTable,
  onEditTable,
  onDeleteTable,
  onOpenMenu,
  onCloseMenu,
}: TableFloorProps) => {
  const sectionTables = tables
    .filter((table) => table.section === selectedSection)
    .sort((a, b) => a.tableNumber - b.tableNumber);

  const menuTable =
    tables.find((table) => table.id === openMenuId) ?? null;

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography 
            variant="h1"
            sx={{ fontSize: "2rem", lineHeight: 1.2 }}
            >
                Restaurant Floor
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Select a table to view details and manage its current state.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {[
              { label: "Available", color: "#10b981" },
              { label: "Occupied", color: "#ef4444" },
              { label: "Reserved", color: "#f59e0b" },
              { label: "Cleaning", color: "#3b82f6" },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="caption">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            bgcolor: "grey.50",
            p: { xs: 2, sm: 3 },
          }}
        >
          {sectionTables.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 256,
                textAlign: "center",
              }}
            >
              <SearchIcon
                sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }}
              />
              <Typography variant="subtitle2" fontWeight={600}>
                No tables found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Try selecting another section.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                minHeight: 256,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                bgcolor: "rgba(255,255,255,0.6)",
                p: 3,
              }}
            >
              {sectionTables.map((table) => {
                const shape = getTableShape(table.capacity);
                const styles = getStatusStyles(table.status);
                const StatusIcon = styles.icon;

                return (
                  <Box
                    key={table.id}
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        zIndex: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        aria-label={`Actions for table ${table.tableNumber}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          if (openMenuId === table.id) {
                            onCloseMenu();
                          } else {
                            onOpenMenu(table.id, event.currentTarget);
                          }
                        }}
                        sx={{
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          boxShadow: 1,
                          "&:hover": { bgcolor: "grey.50" },
                        }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Button
                      onClick={() => onOpenTable(table)}
                      aria-label={
                        table.status === "Cleaning"
                          ? `View cleaning status for Table ${table.tableNumber}`
                          : `Open order for Table ${table.tableNumber}`
                      }
                      sx={{
                        width: shape.width,
                        height: shape.height,
                        borderRadius: shape.borderRadius,
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: 2,
                        borderColor: styles.border,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        textTransform: "none",
                        color: "text.primary",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                          bgcolor: "background.paper",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          right: -4,
                          top: -4,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: styles.dot,
                          border: 2,
                          borderColor: "common.white",
                        }}
                      />

                      <Typography variant="body2" fontWeight={700}>
                        Table {table.tableNumber}
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption">
                          {table.capacity} guests
                        </Typography>
                      </Box>

                      <Chip
                        icon={<StatusIcon sx={{ fontSize: "11px !important" }} />}
                        label={table.status}
                        size="small"
                        sx={{
                          mt: 1,
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor: styles.bg,
                          color: styles.text,
                          "& .MuiChip-icon": { color: styles.text },
                        }}
                      />
                    </Button>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ mt: 1.5 }}
                    >
                      {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(openMenuId) && Boolean(menuAnchorEl)}
        onClose={onCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (menuTable) onViewTable(menuTable);
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuTable) onEditTable(menuTable);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Table
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuTable) onDeleteTable(menuTable.id);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete Table
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableFloor;
