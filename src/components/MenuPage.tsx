import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  ArrowUpNarrowWide,
  Check,
  ChevronDown,
  Plus,
  Search,
  Tags,
  X,
} from "lucide-react";

import MenuTable from "./menu/MenuTable";
import MenuForm from "./menu/MenuForm";
import type {MenuCategory} from "../types/menu";
import { useMenu } from "../context/MenuContext";
import type { MenuItem } from "../types/menu";

const sortOptions = [
  {value: "name-asc", label: "Name: A to Z", icon: ArrowDownAZ},
  {value: "name-desc", label: "Name: Z to A", icon: ArrowDownZA},
  {value: "price-asc", label: "Price: Low to High", icon: ArrowUpNarrowWide},
  {value: "price-desc", label: "Price: High to Low", icon: ArrowDownNarrowWide},
  {value: "category-asc", label: "Category: A to Z", icon: Tags},
] as const;

const MenuPage = () => {

  const {
    items,
    categories,
    addItem,
    updateItem,
    addCategory,
    deleteItem,
  } = useMenu();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [editingItem, setEditingItem] =useState<MenuItem | null>(null);

  const [deletingItem, setDeletingItem] =useState<MenuItem | null>(null);

  const [category, setCategory] = useState<MenuCategory | "All">("All");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeSortMenu = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortMenuOpen(false);
    };

    document.addEventListener("mousedown", closeSortMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeSortMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
  const activeSortOption = sortOptions.find((option) => option.value === sortOrder) ?? sortOptions[0];
  const ActiveSortIcon = activeSortOption.icon;

  const filteredItems = useMemo(() => items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === "All" ||
        item.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((first, second) => {
      switch (sortOrder) {
        case "name-desc":
          return second.name.localeCompare(first.name);
        case "price-asc":
          return first.price - second.price;
        case "price-desc":
          return second.price - first.price;
        case "category-asc":
          return first.category.localeCompare(second.category) || first.name.localeCompare(second.name);
        default:
          return first.name.localeCompare(second.name);
      }
    }),
  [items, search, category, sortOrder]);

  const handleAdd = (item: MenuItem): boolean => {
    if (!addItem(item)) return false;
    setShowForm(false);
    return true;
  };

  const handleEdit = (item: MenuItem): boolean => {
    if (!updateItem(item)) return false;
    setEditingItem(null);
    return true;
  };

  const handleAddCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCategory = newCategory.trim();
    if (!normalizedCategory || !addCategory(normalizedCategory)) {
      setCategoryError("Enter a new category name that is not already in the list.");
      return;
    }

    setCategory(normalizedCategory);
    setNewCategory("");
    setCategoryError("");
    setShowCategoryForm(false);
  };

  const handleDelete = (item: MenuItem) => {
    deleteItem(item.id);
    setDeletingItem(null);
  };


  return (
    <div className="flex h-full min-h-0 flex-col gap-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Menu
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your restaurant menu items5
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Tags size={18} />
            Add Category
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            <Plus size={18} />
            Add Menu Item
          </button>
        </div>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500"
          />

        </div>

        <select
        value={category}
        onChange={(e) => 
            setCategory(e.target.value as MenuCategory | "All")
        }
        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100">

            <option value="All">All Categories</option>
            {menuCategories.map((menuCategory) => (
              <option key={menuCategory} value={menuCategory}>{menuCategory}</option>
            ))}
        </select>

        <div ref={sortMenuRef} className="relative sm:ml-auto">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={sortMenuOpen}
            aria-label={`Sort menu items. Current sort: ${activeSortOption.label}`}
            onClick={() => setSortMenuOpen((open) => !open)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:w-auto ${
              sortMenuOpen ? "border-orange-400" : "border-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <ActiveSortIcon size={17} className="text-slate-500" />
              <span className="text-slate-500">Sort:</span>
              <span className="font-medium text-slate-900">{activeSortOption.label}</span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-400 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sortMenuOpen && (
            <div
              role="menu"
              aria-label="Sort menu items"
              className="absolute right-0 z-30 mt-2 w-full min-w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl sm:w-64"
            >
              <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">
                Sort menu items
              </p>
              {sortOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = sortOrder === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSortOrder(option.value);
                      setSortMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-orange-50 text-orange-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <OptionIcon size={17} className={isSelected ? "text-orange-600" : "text-slate-400"} />
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <Check size={16} className="text-orange-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
    </div>
</div>

      <MenuTable
        items={filteredItems}
        onEdit={(item) => setEditingItem(item)}
        onDelete={(item) => setDeletingItem(item)}
      />

      {showForm && (
        <MenuForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAdd}
          categories={menuCategories}
        />
      )}

      {editingItem && (
        <MenuForm
          initialItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEdit}
          categories={menuCategories}
        />
      )}

      {showCategoryForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setShowCategoryForm(false)}
        >
          <form
            onSubmit={handleAddCategory}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add Category</h2>
                <p className="mt-1 text-sm text-slate-500">Create a category for menu items.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close add category dialog"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="space-y-2 p-6">
              <label htmlFor="new-menu-category" className="block text-sm font-medium text-slate-700">
                Category name
              </label>
              <input
                id="new-menu-category"
                autoFocus
                required
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setCategoryError("");
                }}
                placeholder="e.g. Seasonal Specials"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              {categoryError && <p role="alert" className="text-sm text-red-600">{categoryError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="text-lg font-semibold text-slate-900">
                Delete Menu Item
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  {deletingItem.name}
                </span>
                ?
              </p>

            </div>


            <div className="flex justify-end gap-3 px-6 py-4">

              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={() => handleDelete(deletingItem)}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MenuPage;