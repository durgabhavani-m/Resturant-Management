import {useState} from "react";
import {X} from "lucide-react";
import type {MenuCategory, MenuItem} from "../../types/menu";

interface MenuFormProps{
    onClose: () => void;
    onSubmit: (item: MenuItem) => void;
    initialItem?: MenuItem;
}

const MenuForm = ({onClose, onSubmit, initialItem,} : MenuFormProps) => {
    const[name, setName] = useState(initialItem?.name ?? "");
    const[description, setDescription] = useState(initialItem?.description ??"");
    const[price, setPrice] = useState(initialItem?.price.toString() ??"");
    const[category, setCategory] = useState<MenuCategory>(initialItem?.category ??"Starters");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!name.trim() || !price) {
            return;
        }

        const newItem:MenuItem = {
            id:initialItem?.id ?? crypto.randomUUID(),
            name: name.trim(),
            description:description.trim(),
            price:Number(price),
            category,
            available:initialItem?.available ?? true,
        };
        onSubmit(newItem);
    };

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Add Menu Item
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a new item to your restaurant menu
                        </p>
                    </div>

                    <button 
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <X size={20}/>
                    </button>
                </div>

                <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Item Name
                        </label>

                        <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Paneer Tikka"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"/>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Description
                        </label>

                        <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the menu item..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"/>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Price
                                </label>

                                <input 
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="280"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500"/>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Category
                                </label>

                                <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500">

                                <option>Starters</option>
                                <option>Main Course</option>
                                <option>Desserts</option>
                                <option>Beverages</option>

                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

                            <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Cancel
                            </button>

                            <button 
                            type="submit"
                            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700">
                               {initialItem ? "Save Changes" : "Add Item"}
                            </button>
                        </div>
                </form>
            </div>
        </div>
    );
};
export default MenuForm;