import { useState } from "react";
import { Plus, Search } from "lucide-react";

import MenuTable from "./menu/MenuTable";
import MenuForm from "./menu/MenuForm";
import type {MenuCategory} from "../types/menu";
import { useMenu } from "../context/MenuContext";
import type { MenuItem } from "../types/menu";

const MenuPage = () => {

  const {
    items,
    addItem,
    updateItem,
    deleteItem,
  } = useMenu();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingItem, setEditingItem] =useState<MenuItem | null>(null);

  const [deletingItem, setDeletingItem] =useState<MenuItem | null>(null);

  const [category, setCategory] = useState<MenuCategory | "All">("All");


  const filteredItems = items.filter((item) =>{
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
});

  const handleAdd = (item: MenuItem) => {
    addItem(item);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    updateItem(item);
    setEditingItem(null);
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
            Manage your restaurant menu items
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700" >
          <Plus size={18} />
          Add Menu Item
        </button>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 sm:flex-row">

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
            <option value="Starters">Starters</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
            <option value="Beverages">Beverages</option>
        </select>
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
        />
      )}

      {editingItem && (
        <MenuForm
          initialItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEdit}
        />
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