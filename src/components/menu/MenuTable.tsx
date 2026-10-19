import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TableSortLabel from "@mui/material/TableSortLabel";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";

import type { MenuItem as MenuItemType } from "../../types/menu";
import { useMenu } from "../../context/MenuContext";
import { useModifiers } from "../../context/ModifierContext";
import { usePersistentState } from "../../hooks/usePersistentState";

type SortDirection = "asc" | "desc";
type SortColumn = "item" | "price";

interface MenuTableProps {
  items: MenuItemType[];
  itemSortDirection: SortDirection;
  priceSortDirection: SortDirection;
  activeSortColumn: SortColumn;
  onItemSort: () => void;
  onPriceSort: () => void;
  onEdit: (item: MenuItemType) => void;
  onDelete: (item: MenuItemType) => void;
}

const MenuTable = ({
  items,
  itemSortDirection,
  priceSortDirection,
  activeSortColumn,
  onItemSort,
  onPriceSort,
  onEdit,
  onDelete,
}: MenuTableProps) => {
  const { categoryMetadata } = useMenu();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<MenuItemType | null>(null);
  const [selectedItemId, setSelectedItemId] = usePersistentState<
  string | number | null
>("menu_table_selected_item_id", null);

const selectedItem =
  items.find((item) => String(item.id) === String(selectedItemId)) ?? null;

  const { modifierGroups} = useModifiers();

  const openMenu = (event: React.MouseEvent<HTMLElement>, item: MenuItemType) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  return (
    <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell>

                <TableSortLabel
                  active={activeSortColumn === "item"}
                  direction={itemSortDirection}
                  onClick={onItemSort}
                  aria-label={`Sort item names ${itemSortDirection === "asc" ? "ascending" : "descending"}`}
                >
                  Item
                </TableSortLabel>

              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>
                <TableSortLabel
                  active={activeSortColumn === "price"}
                  direction={priceSortDirection}
                  onClick={onPriceSort}
                  aria-label={`Sort prices ${priceSortDirection === "asc" ? "ascending" : "descending"}`}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {item.foodType && (
                      <Box
                        role="img"
                        aria-label={
                          item.foodType === "Veg"
                            ? "Vegetarian"
                            : "Non-vegetarian"
                        }
                        title={
                          item.foodType === "Veg"
                            ? "Vegetarian"
                            : "Non-vegetarian"
                        }
                        sx={{
                          width: 14,
                          height: 14,
                          border: "1.5px solid",
                          borderColor:
                            item.foodType === "Veg" ? "success.main" : "error.main",
                          borderRadius: 0.25,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "0 0 auto",
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor:
                              item.foodType === "Veg"
                                ? "success.main"
                                : "error.main",
                          }}
                        />
                      </Box>
                    )}
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{item.category}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>₹{item.price}</Typography>
                </TableCell>
                <TableCell>
                  {(() => {
                    const categoryKey = item.category
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLowerCase();

                    const isCategoryUnavailable = 
                        categoryMetadata[categoryKey]?.status === "Inactive";

                    const status = isCategoryUnavailable
                    ? "Category Unavailable"
                    : item.stockStatus === "Out of Stock"
                    ? "Out of Stock"
                    : "Available";

                    return (
                      <Chip
                      label={status}
                      color={
                        status === "Available"
                        ? "success"
                        : "error"
                      }
                      size="small"
                      />
                    )
                  })()} 
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => openMenu(e, item)}>
                    <MoreHorizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {items.length === 0 && (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">No menu items found.</Typography>
        </Box>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuItem){
              setSelectedItemId(menuItem.id);
            }
            closeMenu();
          }}
        >
          View Details
        </MenuItem>
  
          <MenuItem
          onClick={() => {
            if (menuItem) onEdit(menuItem);
            closeMenu();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuItem) onDelete(menuItem);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog 
      open={Boolean(selectedItemId && selectedItem)} 
      onClose={() => setSelectedItemId(null)} 
      fullWidth 
      maxWidth="sm">
        {selectedItem && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="h3">{selectedItem.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Menu Item Details
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedItemId(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <DetailRow label="Name" value={selectedItem.name} />
              <DetailRow label="Category" value={selectedItem.category} />
              <DetailRow label="Price" value={`₹${selectedItem.price}`} highlight />
              <DetailRow
                label="Stock Status"
                value={(() => {
                  const categoryKey = selectedItem.category
                  .trim()
                  .replace(/\s+/g,"")
                  .toLowerCase();

                  const isCategoryUnavailable = 
                  categoryMetadata[categoryKey]?.status === "Inactive";

                  if(isCategoryUnavailable){
                    return "Category Unavailable";
                  }

                  return selectedItem.stockStatus === "Out of Stock"
                  ? "Out of Stock"
                  : "Available";
                })()}
              />

              <DetailRow
                label="Availability"
                value={selectedItem.isAvailable ? "Available" : "Unavailable"}
              />

              <Box sx={{ mt:2 }}>
                <Typography
                variant="body2"
                color="text.secondary"
                sx={{mb:1}}>
                  Modifier Groups
                </Typography>

                <Box sx={{display: "flex", flexwrap: "wrap", gap:1}}>
                  {modifierGroups
                  .filter((group) => 
                  (selectedItem.modifierGroupIds ?? []).includes(group.id) &&
                  (group.isAvailable ?? true)
                  )
                  .map((group) => (
                    <Chip
                    key={group.id}
                    label={group.name}
                    size="small"
                    variant="outlined"
                    />
                  ))
                  }
                </Box>

                {modifierGroups.filter((group) => 
                (selectedItem.modifierGroupIds ?? []).includes(group.id)
                ).length === 0 && (
                  <Typography variant="body2" color="text.secondary" >
                    No modifier groups assigned
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body2">{selectedItem.description}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => setSelectedItemId(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

const DetailRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color={highlight ? "primary.main" : "text.primary"}>
      {value}
    </Typography>
  </Box>
);

export default MenuTable;
