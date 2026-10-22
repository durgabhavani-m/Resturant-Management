import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Select from "@mui/material/Select";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import type { RestaurantTable, TableStatus } from "../../types/table";

interface TableFloorProps {
  tables: RestaurantTable[];
  selectedSection: string;
  sections: string[];
  onSectionChange: (section: string) => void;
  openMenuId: string | null;
  menuAnchorEl: HTMLElement | null;
  onOpenTable: (table: RestaurantTable) => void;
  onViewTable: (table: RestaurantTable) => void;
  onEditTable: (table: RestaurantTable) => void;
  onDeleteTable: (tableId: string) => void;
  onOpenMenu: (tableId: string, anchor: HTMLElement) => void;
  onCloseMenu: () => void;
  onTablePositionChange: (
    tableId: string,
    x: number,
    y: number
  ) => void;
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
  sections,
  openMenuId,
  menuAnchorEl,
  onOpenTable,
  onViewTable,
  onEditTable,
  onDeleteTable,
  onSectionChange,
  onOpenMenu,
  onCloseMenu,
  onTablePositionChange,
}: TableFloorProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const dragRef = useRef<{
    tableId: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const suppressClickRef = useRef(false);

  const [draggingTableId, setDraggingTableId] =
    useState<string | null>(null);

  const handleTableMouseDown = (
    event: ReactMouseEvent<HTMLButtonElement>,
    table: RestaurantTable,
    index: number
  ) => {
    if (event.button !== 0) return;

    // Do not start dragging when opening an order.
    event.preventDefault();

    const defaultX = 32 + (index % 3) * 250;
    const defaultY = 32 + Math.floor(index / 3) * 210;

    dragRef.current = {
      tableId: table.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: table.x ?? defaultX,
      startY: table.y ?? defaultY,
      moved: false,
    };

    suppressClickRef.current = false;
    setDraggingTableId(table.id);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaX = event.clientX - drag.startMouseX;
      const deltaY = event.clientY - drag.startMouseY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        drag.moved = true;
      }

      if (!drag.moved) return;

      suppressClickRef.current = true;

      onTablePositionChange(
        drag.tableId,
        Math.max(0, drag.startX + deltaX),
        Math.max(0, drag.startY + deltaY)
      );
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        suppressClickRef.current = dragRef.current.moved;
      }

      dragRef.current = null;
      setDraggingTableId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onTablePositionChange]);


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
          position: isFullScreen ? "fixed" : "relative",
          inset: isFullScreen ? 0 : "auto",
          zIndex: isFullScreen ? 1300 : "auto",
          width: isFullScreen ? "100vw" : "auto",
          height: isFullScreen ? "100dvh" : "auto",
          flex: isFullScreen ? "none" : 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: isFullScreen ? 0 : undefined,
          bgcolor: "background.paper",
        }}
      >
        {/* Floor header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", lg: "flex-end" },
              gap: 1.5,
              flex: 1,
              minWidth: 0,
            }}
          >
            {isFullScreen && (
              <IconButton
                aria-label="Back to tables page"
                onClick={() => setIsFullScreen(false)}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            <Box>
              <Typography
                variant="h1"
                sx={{ fontSize: "2rem", lineHeight: 1.2 }}
              >
                Restaurant Floor
              </Typography>

              {!isFullScreen && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  Select a table to view details and manage its current state.
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >

            <Box 
            sx={{
              display: "flex", 
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: { xs: "flex-start", lg: "flex-end" },
              gap: { xs: 1.5, sm: 2 },
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption">{item.label}</Typography>
              </Box>
            ))}
            </Box>

            <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.5,
              width: "100%",
            }}
            >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="floor-section-label">Section</InputLabel>
              <Select
              labelId="floor-section-label"
              value={selectedSection}
              label="Section"
              onChange={(event) => onSectionChange(event.target.value)}
              >
                {(sections ?? []).map((section) => (
                  <MenuItem key={section} value={section}>
                    {section}
                    </MenuItem>
                ))}
                </Select>
                </FormControl>

                {!isFullScreen && (
                <IconButton
                aria-label="Open floor in full screen"
                title="Full screen"
                onClick={() => setIsFullScreen(true)}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                )}
              </Box>
          </Box>
        </Box>

        {/* Floor canvas */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
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
                sx={{
                  fontSize: 40,
                  color: "text.disabled",
                  mb: 1.5,
                }}
              />

              <Typography variant="subtitle2" fontWeight={600}>
                No tables found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Try selecting another section.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                 position: "relative",
                 minWidth: 900,
                 minHeight: 600,
                 width: "100%",
                 borderRadius: 2,
                 border: isFullScreen ? 0 : "1px dashed",
                 borderColor: "divider",
                 bgcolor: isFullScreen
                   ? "grey.50"
                   : "rgba(255,255,255,0.6)",
                 }}
             >
              {sectionTables.map((table, index) => {
                const shape = getTableShape(table.capacity);
                const styles = getStatusStyles(table.status);
                const StatusIcon = styles.icon;

                const defaultX = 32 + (index % 3) * 250;
                const defaultY = 32 + Math.floor(index / 3) * 210;

                return (
                  <Box
                    key={table.id}
                    sx={{
                      position: "absolute",
                      left: table.x ?? defaultX,
                      top: table.y ?? defaultY,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      zIndex: draggingTableId === table.id ? 10 : 1,
                      cursor:
                         draggingTableId === table.id ? "grabbing" : "grab",
                      userSelect: "none",
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
                            onOpenMenu(
                              table.id,
                              event.currentTarget
                            );
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
                      onMouseDown={(event) => 
                        handleTableMouseDown(event, table, index)
                      }
                      onClick={() => {
                        if(suppressClickRef.current){
                          suppressClickRef.current = false;
                          return;
                        }
                        onOpenTable(table);
                      }}
                      aria-label={`Table ${table.tableNumber}, ${table.status}`}
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
                        boxShadow: draggingTableId === table.id ? 4 : 1,
                        textTransform: "none",
                        color: "text.primary",
                        touchAction: "none",
                        "&:hover": {
                        boxShadow: 3,
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
                        icon={
                          <StatusIcon
                            sx={{ fontSize: "11px !important" }}
                          />
                        }
                        label={table.status}
                        size="small"
                        sx={{
                          mt: 1,
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor: styles.bg,
                          color: styles.text,
                          "& .MuiChip-icon": {
                            color: styles.text,
                          },
                        }}
                      />
                    </Button>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ mt: 1.5 }}
                    >
                      {table.capacity} seat
                      {table.capacity !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Table actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(openMenuId) && Boolean(menuAnchorEl)}
        onClose={onCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
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
