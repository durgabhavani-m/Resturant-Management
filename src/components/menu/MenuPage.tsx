import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";

import MenuTable from "./MenuTable";
import MenuForm from "./MenuForm";
import type {
  MenuCategory,
  MenuItem as MenuItemType,
} from "../../types/menu";
import { useMenu } from "../../context/MenuContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import { usePersistentState } from "../../hooks/usePersistentState";

type SortDirection = "asc" | "desc";
type SortColumn = "item" | "price";

const MenuPage = () => {
  const { items, categories, addItem, updateItem, deleteItem } = useMenu();
  const { preferences } = useAppPreferences();

  const [search, setSearch] = usePersistentState("menu_page_search","");
  const [showForm, setShowForm] = usePersistentState("menu_page_form_open",false);

 const [editingItemId, setEditingItemId] =
  usePersistentState<string | number | null>(
    "menu_page_editing_item_id",
    null
  );

 const editingItem =
  items.find((item) => String(item.id) === String(editingItemId)) ?? null;

  const [deletingItem, setDeletingItem] = useState<MenuItemType | null>(null);
  const [category, setCategory] = usePersistentState<MenuCategory | "All">("menu_page_category","All");
  const [foodType, setFoodType] = usePersistentState<"All" | "Veg" | "Non-Veg">("menu_page_food_type", "All");
  const [itemSortDirection, setItemSortDirection] = usePersistentState<SortDirection>("menu_page_item_sort","asc");
  const [priceSortDirection, setPriceSortDirection] = usePersistentState<SortDirection>("menu_page_price_sort","asc");
  const [activeSortColumn, setActiveSortColumn] = usePersistentState<SortColumn>("menu_page_active_sort_column","item");

  const menuCategories = useMemo(() => {
    const uniqueCategories = new Map<string, MenuCategory>();
    [...categories, ...items.map((item) => item.category)].forEach((value) => {
      const label = value.trim().replace(/\s+/g, " ");
      const key = label.toLowerCase();
      if (label && !uniqueCategories.has(key)) uniqueCategories.set(key, label);
    });
    return Array.from(uniqueCategories.values()).sort((first, second) =>
      first.localeCompare(second)
    );
  }, [categories, items]);

  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
          const matchesCategory =
            category === "All" || item.category.toLowerCase() === category.toLowerCase();

          const matchesFoodType = foodType === "All" || item.foodType === foodType;

;          return matchesSearch && matchesCategory && matchesFoodType;
        })
        .sort((first, second) => {
          if (activeSortColumn === "price") {
            return priceSortDirection === "asc"
              ? first.price - second.price
              : second.price - first.price;
          }
          return itemSortDirection === "asc"
            ? first.name.localeCompare(second.name)
            : second.name.localeCompare(first.name);
        }),
    [
      items,
      search,
      category,
      foodType,
      activeSortColumn,
      itemSortDirection,
      priceSortDirection,
    ]
  );

  const toggleItemSort = () => {
    setItemSortDirection((direction) =>
      direction === "asc" ? "desc" : "asc"
    );
    setActiveSortColumn("item");
  };

  const togglePriceSort = () => {
    setPriceSortDirection((direction) =>
      direction === "asc" ? "desc" : "asc"
    );
    setActiveSortColumn("price");
  };

  const handleAdd = (item: MenuItemType): boolean => {
    if (!addItem(item)) return false;
    setShowForm(false);
    return true;
  };

  const handleEdit = (item: MenuItemType): boolean => {
    if (!updateItem(item)) return false;
    setEditingItemId(null);
    return true;
  };

  const handleDelete = (item: MenuItemType) => {
    deleteItem(item.id);
    setDeletingItem(null);
  };

  const requestDelete = (item: MenuItemType) => {
    if (!preferences.confirmBeforeDelete) {
      handleDelete(item);
      return;
    }
    setDeletingItem(item);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%", minHeight: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h1">Menu</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your restaurant menu items
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add Menu Item
          </Button>
        </Box>
      </Box>

      <Box sx={{display: "flex", gap: 1, overflow: "auto", pb:0.5, "&::-webkit-scrollbar":{
        display:"none",
      },
      scrollbarWidth: "none",
    }}
    >
      <Button
      variant={category === "All" ? "contained" : "outlined"}
      onClick={() => setCategory("All")}
      sx={{borderRadius:3, whiteSpace: "nowrap", minWidth: "auto",}}>
        All
      </Button>

      {menuCategories.map((menuCategory) => (
        <Button
        key={menuCategory}
        variant={category === menuCategory ? "contained" : "outlined"}
        onClick={() => setCategory(menuCategory)}
        sx={{borderRadius:3, whiteSpace: "nowrap", minWidth: "auto",}}>
          {menuCategory}
        </Button>
      ))}
    </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search menu items..."
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
                  aria-label="clear search"
                  edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
          select
          size="small"
          value={foodType}
          onChange={(e) => 
            setFoodType(e.target.value as "All" | "Veg" | "Non-Veg")
          }
          aria-label="Filter by food type"
          sx={{minWidth:170}}
          >
          <MenuItem value="All">All Food Types</MenuItem>
          <MenuItem value="Veg">Veg</MenuItem>
          <MenuItem value="Non-Veg">Non-Veg</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <MenuTable
        items={filteredItems}
        itemSortDirection={itemSortDirection}
        priceSortDirection={priceSortDirection}
        activeSortColumn={activeSortColumn}
        onItemSort={toggleItemSort}
        onPriceSort={togglePriceSort}
        onEdit={(item) => setEditingItemId(item.id)}
        onDelete={requestDelete}
      />

      {showForm && (
        <MenuForm onClose={() => setShowForm(false)} onSubmit={handleAdd} categories={menuCategories} />
      )}

      {editingItem && (
        <MenuForm
          initialItem={editingItem}
          onClose={() => setEditingItemId(null)}
          onSubmit={handleEdit}
          categories={menuCategories}
        />
      )}

      <Dialog open={Boolean(deletingItem)} onClose={() => setDeletingItem(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deletingItem?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingItem(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deletingItem && handleDelete(deletingItem)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPage;
