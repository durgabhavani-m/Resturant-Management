import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CakeIcon from "@mui/icons-material/Cake";
import CategoryIcon from "@mui/icons-material/Category";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import SetMealIcon from "@mui/icons-material/SetMeal";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select,{type SelectChangeEvent} from "@mui/material/Select"; 

import { useMenu } from "../../context/MenuContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import type {
  MenuCategory,
  MenuCategoryMetadata,
  MenuCategoryStatus,
} from "../../types/menu";

const normalizeCategoryName = (category: string) =>
  category.trim().replace(/\s+/g, " ");

const normalizeCategoryKey = (category: string) =>
  normalizeCategoryName(category).toLowerCase();

const getCategoryVisual = (
  category: string
): { icon: ReactNode; color: string; background: string } => {
  const visualOptions = [
    { icon: <RestaurantIcon fontSize="small" />, color: "#2563eb", background: "#eff6ff" },
    { icon: <SetMealIcon fontSize="small" />, color: "#059669", background: "#ecfdf5" },
    { icon: <LocalCafeIcon fontSize="small" />, color: "#7c3aed", background: "#f5f3ff" },
    { icon: <LocalBarIcon fontSize="small" />, color: "#db2777", background: "#fdf2f8" },
    { icon: <LunchDiningIcon fontSize="small" />, color: "#d97706", background: "#fffbeb" },
    { icon: <CakeIcon fontSize="small" />, color: "#e11d48", background: "#fff1f2" },
    { icon: <LocalPizzaIcon fontSize="small" />, color: "#0f766e", background: "#f0fdfa" },
    { icon: <CategoryIcon fontSize="small" />, color: "#475569", background: "#f1f5f9" },
  ];
  const normalized = category.toLowerCase();
  const semanticIndex = [
    ["dessert", "sweet", "cake", "ice cream"],
    ["drink", "beverage", "coffee", "tea", "juice"],
    ["bar", "cocktail"],
    ["pizza"],
    ["starter", "appetizer", "snack"],
    ["seafood", "fish", "sushi"],
    ["main", "meal", "food", "dinner", "lunch"],
  ].findIndex((keywords) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );
  const fallbackIndex =
    [...normalized].reduce((hash, character) => hash + character.charCodeAt(0), 0) %
    visualOptions.length;

  return visualOptions[semanticIndex >= 0 ? semanticIndex : fallbackIndex];
};

const CategoryManagementPage = () => {
  const {
    categories,
    categoryMetadata,
    items,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenu();
  const { preferences } = useAppPreferences();
const [search, setSearch] = usePersistentState(
  "category_page_search",
  ""
);
  
const [page, setPage] = usePersistentState(
  "category_page_current_page",
  0
);

  const [rowsPerPage, setRowsPerPage] = usePersistentState(
  "category_page_rows_per_page",
  10
);

 const [categoryDialogOpen, setCategoryDialogOpen] = usePersistentState(
  "category_page_form_open",
  false
)
  const [editingCategory, setEditingCategory] =
  usePersistentState<MenuCategory | null>(
    "category_page_editing_category",
    null
  );
  const [categoryName, setCategoryName] = usePersistentState(
  "category_page_form_name",
  ""
);
  const [categoryDescription, setCategoryDescription] = usePersistentState(
  "category_page_form_description",
  ""
);
  const [categoryStatus, setCategoryStatus] =
  usePersistentState<MenuCategoryStatus | "">(
    "category_page_form_status",
    ""
  );
  const [categoryFormError, setCategoryFormError] = useState("");
  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionCategory, setActionCategory] = useState<MenuCategory | null>(null);

  const [deletingCategory, setDeletingCategory] =
  usePersistentState<MenuCategory | null>(
    "category_page_deleting_category",
    null
  );

  const [replacementCategory, setReplacementCategory] =
  usePersistentState(
    "category_page_replacement_category",
    ""
  );
  const [deleteError, setDeleteError] = useState("");

  const [statusFilter, setStatusFilter] = usePersistentState<
  "All" | MenuCategoryStatus>("category_page_status_filter", "All");

  const [viewingCategory, setViewingCategory] =
  usePersistentState<MenuCategory | null>(
    "category_page_viewing_category",
    null
  );

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((category) =>{
          const matchesSearch = category.toLowerCase().includes(search.trim().toLowerCase());

          const status = categoryMetadata[normalizeCategoryKey(category)]?.status;

          const matchesStatus = statusFilter === "All" || status === statusFilter;

          return matchesSearch && matchesStatus;
        })
        .sort((first, second) => first.localeCompare(second)),
        [categories, categoryMetadata, search, statusFilter]
      );

  const pageCategories = visibleCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getItemCount = (category: string) =>
    items.filter(
      (item) =>
        normalizeCategoryKey(item.category) === normalizeCategoryKey(category)
    ).length;

  const openAddDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryStatus("");
    setCategoryFormError("");
    setCategoryDialogOpen(true);
  };

  const openEditDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryName(category);
    const metadata = categoryMetadata[normalizeCategoryKey(category)];
    setCategoryDescription(metadata?.description ?? "");
    setCategoryStatus(metadata?.status ?? "");
    setCategoryFormError("");
    setCategoryDialogOpen(true);
    setActionAnchor(null);
    setActionCategory(null);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryStatus("");
    setCategoryFormError("");
  };

  const handleSaveCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = normalizeCategoryName(categoryName);

    if (!normalizedName) {
      setCategoryFormError("Enter a category name.");
      return;
    }
    if (!categoryStatus) {
      setCategoryFormError("Choose a category status.");
      return;
    }

    const metadata: MenuCategoryMetadata = {
      ...(categoryDescription.trim()
        ? { description: categoryDescription.trim() }
        : {}),
      status: categoryStatus,
    };
    const saved = editingCategory
      ? updateCategory(editingCategory, normalizedName, metadata)
      : addCategory(normalizedName, metadata);

    if (!saved) {
      setCategoryFormError(
        "A category with this name already exists, or the category could not be saved."
      );
      return;
    }

    closeCategoryDialog();
  };

  const openActions = (
    event: MouseEvent<HTMLElement>,
    category: MenuCategory
  ) => {
    setActionAnchor(event.currentTarget);
    setActionCategory(category);
  };

  const closeActions = () => {
    setActionAnchor(null);
    setActionCategory(null);
  };

  const openDeleteDialog = () => {
    if (!actionCategory) return;
    if (!preferences.confirmBeforeDelete && getItemCount(actionCategory) === 0) {
      const categoryToDelete = actionCategory;
      if (deleteCategory(categoryToDelete)) {
        const filteredCountAfterDelete = visibleCategories.some(
          (category) => normalizeCategoryKey(category) === normalizeCategoryKey(categoryToDelete)
        )
          ? visibleCategories.length - 1
          : visibleCategories.length;
        const lastPage = Math.max(0, Math.ceil(filteredCountAfterDelete / rowsPerPage) - 1);
        setPage((currentPage) => Math.min(currentPage, lastPage));
      }
      closeActions();
      return;
    }
    setDeletingCategory(actionCategory);
    setReplacementCategory("");
    setDeleteError("");
    closeActions();
  };

  const closeDeleteDialog = () => {
    setDeletingCategory(null);
    setReplacementCategory("");
    setDeleteError("");
  };

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;

    if (!deleteCategory(deletingCategory, replacementCategory || undefined)) {
      setDeleteError(
        "Choose a different existing category for the menu items before deleting."
      );
      return;
    }

    const filteredCountAfterDelete = visibleCategories.some(
      (category) => normalizeCategoryKey(category) === normalizeCategoryKey(deletingCategory)
    )
      ? visibleCategories.length - 1
      : visibleCategories.length;
    const lastPage = Math.max(
      0,
      Math.ceil(filteredCountAfterDelete / rowsPerPage) - 1
    );
    setPage((currentPage) => Math.min(currentPage, lastPage));
    closeDeleteDialog();
  };

  const deletingItemCount = deletingCategory
    ? getItemCount(deletingCategory)
    : 0;
  const replacementOptions = categories.filter(
    (category) =>
      normalizeCategoryKey(category) !==
      normalizeCategoryKey(deletingCategory ?? "")
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 3 },
        height: {
          xs: "calc(100dvh - 112px)",
          md: "calc(100dvh - 128px)",
        },
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h1">Category Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Organize your menu items with categories. Add, edit or remove
            categories as needed.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add Category
        </Button>
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}
      >
        <Box sx={{display:"flex", gap:2, flexDirection: {xs:"column", sm:"row"},
        }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search categories..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
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
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                aria-label="Clear search"
                edge="end">
                  <CloseIcon fontSize="small"/>
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <FormControl 
        size="small"
        sx={{minWidth: {xs:"100%",sm:190}}}
        >
          <InputLabel id="category-status-filter-label">
          Status
          </InputLabel>

          <Select 
          labelId="category-status-filter-label"
          label="Status"
          value={statusFilter}
          onChange={(event: SelectChangeEvent<"All" | MenuCategoryStatus>) => {
            const value = event.target.value;

            if(value === "All" || value === "Active" || value === "Inactive"){
            setStatusFilter(value);
            setPage(0);
            }
          }}>
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          minWidth: 0,
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell
                  align="center"
                  sx={{ width: 64, fontWeight: 700, color: "text.secondary" }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{ minWidth: 210, fontWeight: 700, color: "text.secondary" }}
                >
                  Category Name
                </TableCell>
                <TableCell
                  sx={{ minWidth: 240, fontWeight: 700, color: "text.secondary" }}
                >
                  Description
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ width: 120, fontWeight: 700, color: "text.secondary" }}
                >
                  Items
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ width: 140, fontWeight: 700, color: "text.secondary" }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ width: 88, fontWeight: 700, color: "text.secondary" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageCategories.map((category, index) => {
                const visual = getCategoryVisual(category);
                const metadata = categoryMetadata[normalizeCategoryKey(category)];
                const status = metadata?.status;

                return (
                  <TableRow
                    key={category}
                    hover
                    sx={{ "& td": { borderColor: "divider", py: 1.75 } }}
                  >
                    <TableCell align="center" sx={{ color: "text.secondary" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: visual.color,
                            bgcolor: visual.background,
                            flexShrink: 0,
                          }}
                        >
                          {visual.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={metadata?.description ? "text.primary" : "text.disabled"}
                      >
                        {metadata?.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                      size="small" 
                      label={getItemCount(category)} 
                      variant="outlined" 
                      clickable
                      onClick={() => setViewingCategory(category)}
                      aria-label={`View menu items in ${category}`}
                      sx={{cursor: "pointer"}}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={status ?? "Not set"}
                        color={
                          status === "Active"
                            ? "success"
                            : status === "Inactive"
                              ? "default"
                              : "default"
                        }
                        variant={status ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label={`Actions for ${category}`}
                        onClick={(event) => openActions(event, category)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibleCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {categories.length === 0
                          ? "No categories yet. Add a category to organize menu items."
                          : "No categories match your search."}
                      </Typography>
                      {categories.length === 0 && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={openAddDialog}
                        >
                          Add Category
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={visibleCategories.length}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: 1,
            borderColor: "divider",
            ".MuiTablePagination-toolbar": {
              minHeight: 64,
              px: { xs: 1, sm: 2 },
            },
          }}
        />
      </Paper>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={closeActions}
      >
        <MenuItem
          onClick={() => {
            if (actionCategory) openEditDialog(actionCategory);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onClick={openDeleteDialog} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={categoryDialogOpen}
        onClose={closeCategoryDialog}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCategory}>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 1,
              }}
            >
              <TextField
                fullWidth
                autoFocus
                required
                label="Category Name"
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setCategoryFormError("");
                }}
                error={Boolean(categoryFormError)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
              />
              <TextField
                fullWidth
                select
                required
                label="Status"
                value={categoryStatus}
                onChange={(event) => {
                  setCategoryStatus(
                    event.target.value as MenuCategoryStatus | ""
                  );
                  setCategoryFormError("");
                }}
                error={Boolean(categoryFormError && !categoryStatus)}
                helperText={
                  categoryFormError ||
                  (!categoryStatus ? "Select Active or Inactive." : "")
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
              {categoryFormError && categoryStatus && (
                <Alert severity="error">{categoryFormError}</Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeCategoryDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Category
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
      open={Boolean(viewingCategory)}
      onClose={() => setViewingCategory(null)}
      fullWidth
      maxWidth="sm"
      >
        <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        >
          <Box>
            <Typography variant="h6">
              {viewingCategory}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Menu items assigned to this category
            </Typography>
          </Box>

          <IconButton
          onClick={() => setViewingCategory(null)}
          aria-label="Close menu items"
          >
            <CloseIcon/>
          </IconButton>
        </DialogTitle>
        </Dialog>

        <Dialog
        open={Boolean(viewingCategory)}
        onClose={() => setViewingCategory(null)}
        fullWidth
        maxWidth="sm"
        >
          
          <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
           }}
          >
          <Box>
          <Typography variant="h6">
            {viewingCategory}
          </Typography>
          <Typography variant="body2" color="text.secondary">
              Menu items assigned to this category
          </Typography>
          </Box>

          <IconButton
            onClick={() => setViewingCategory(null)}
            aria-label="Close menu items"
          >
             <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {viewingCategory && (
         <>
            {items.filter(
              (item) =>
              normalizeCategoryKey(item.category) ===
              normalizeCategoryKey(viewingCategory)
            ).length > 0 ? (
             <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {items
              .filter(
                (item) =>
                  normalizeCategoryKey(item.category) ===
                  normalizeCategoryKey(viewingCategory)
              )
              .map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600}>
                      {item.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.description || "No description"}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography fontWeight={600}>
                      ₹{item.price}
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        item.stockStatus === "Out of Stock"
                          ? "Out of Stock"
                          : item.isAvailable === false
                            ? "Unavailable"
                            : "Available"
                      }
                      color={
                        item.stockStatus === "Out of Stock" ||
                        item.isAvailable === false
                          ? "error"
                          : "success"
                      }
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              ))}
          </Box>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            No menu items assigned to this category.
          </Typography>
          )}
         </>
        )}
       </DialogContent>

       <DialogActions>
        <Button onClick={() => setViewingCategory(null)}>
          Close
        </Button>
        </DialogActions>
        </Dialog>



      <Dialog
        open={Boolean(deletingCategory)}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent dividers>
          {deletingItemCount > 0 ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>{deletingCategory}</strong> is assigned to{" "}
                {deletingItemCount} menu item(s). Choose a category to reassign
                them to before deleting.
              </Typography>
              <TextField
                select
                fullWidth
                required
                label="Move menu items to"
                value={replacementCategory}
                onChange={(event) => {
                  setReplacementCategory(event.target.value);
                  setDeleteError("");
                }}
                error={Boolean(deleteError)}
                helperText={deleteError}
              >
                {replacementOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </>
          ) : (
            <Typography variant="body2">
              Are you sure you want to delete <strong>{deletingCategory}</strong>?
            </Typography>
          )}
          {replacementOptions.length === 0 && deletingItemCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Create another category before deleting this one.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deletingItemCount > 0 && replacementOptions.length === 0}
            onClick={handleDeleteCategory}
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagementPage;
