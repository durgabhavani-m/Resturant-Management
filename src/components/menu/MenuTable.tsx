import {MoreHorizontal, X} from "lucide-react";
import type {MenuItem} from "../../types/menu";
import {useMenu} from "../../context/MenuContext";
import {useState} from "react";

interface MenuTableProps{
    items:MenuItem[];
    onEdit:(item:MenuItem) => void;
    onDelete:(item:MenuItem) => void;

}

const MenuTable = ({items, onEdit, onDelete} : MenuTableProps) => {
    const {toggleAvailability} = useMenu();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] =useState<MenuItem | null>(null);

    return(
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="overflow-x-auto">

                <table className="w-full min-w-200">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Item
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Category
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Price
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Status
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {items.map((item)=>(
                            <tr 
                            key={item.id}
                            className="transition hover:bg-slate-50">

                                <td className="px-6 py-4">

                                    <p className="font-medium text-slate-900">
                                        {item.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {item.description}
                                    </p>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {item.category}
                                </td>

                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                    ₹{item.price}
                                </td>

                                <td className="px-6 py-4">

                                    <button
                                    type="button"
                                    onClick={() => toggleAvailability(item.id)} 
                                    className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                                        item.available
                                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                    }`}
                                    >
                                        {item.available ? "Available" : "Unavailable"}
                                    </button>
                                </td>

                                <td className = "px-6 py-4 text-left">

                                    <div className="relative inline-block">

                                        <button
                                        type="button"
                                        title="Actions"
                                        onClick={() =>
                                            setOpenMenuId(
                                                openMenuId === item.id ? null :item.id
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">

                                            <MoreHorizontal size = {20}/>
                                        </button>
                                        
                                        {openMenuId === item.id && (
                                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                            <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setOpenMenuId(null)
                                            }}
                                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                View Details
                                            </button>

                                            <button
                                            type="button"
                                            onClick={() =>{
                                                onEdit(item);
                                                setOpenMenuId(null);
                                            }}
                                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                Edit
                                            </button>

                                            <button
                                            type="button"
                                            onClick = {() => {
                                                onDelete(item);
                                                setOpenMenuId(null);
                                            }}
                                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-60">
                                                Delete
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {items.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                    No menu items found.
                    </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                onClick={() => setSelectedItem(null)}>
                    
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {selectedItem.name}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Menu Item Details
                                </p>
                            </div>

                            <button
                            type="button"
                            onClick={() => setSelectedItem(null)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-orange-500 hover:text-slate-700">
                                <X size ={18}/>
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">

                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Name
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {selectedItem.name}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Category
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {selectedItem.category}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Price
                                </span>

                                <span className="text-sm font-semibold text-orange-600">
                                    ₹{selectedItem.price}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Status
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {selectedItem.available ? "Available" : "Unavailable"}
                                </span>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-slate-500">
                                    Description
                                </p>

                                <p className="text-sm text-slate-700">
                                    {selectedItem.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 px-6 py-4">

                            <button
                            type="button"
                            onClick={() =>  setSelectedItem(null)}
                            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MenuTable;