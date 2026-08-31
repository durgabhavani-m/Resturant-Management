import {Pencil, Trash2} from "lucide-react";
import type {MenuItem} from "../../types/menu";
import {useMenu} from "../../context/MenuContext";

interface MenuTableProps{
    items:MenuItem[];
    onEdit:(item:MenuItem) => void;
    onDelete:(item:MenuItem) => void;

}

const MenuTable = ({items, onEdit, onDelete} : MenuTableProps) => {
    const {toggleAvailability} = useMenu();

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

                                    <div className="inline-flex item-center gap-1">

                                        <button 
                                        type="button"
                                        onClick={()=>onEdit(item)}
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                                        title="Edit">
                                            <Pencil size={17}/>
                                        </button>

                                        <button
                                        type="button"
                                        onClick={()=> onDelete(item)}
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                          title="Delete">
                                            <Trash2 size = {17}/>
                                        </button>
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
        </div>
    );
};
export default MenuTable;