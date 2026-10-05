import { Search, X, MoreHorizontal,Eye,Pencil,Trash2 } from "lucide-react";
import {useState,} from "react";
import {useOrder} from "../context/OrderContext";
import type {Order, OrderStatus} from "../types/order";
import {useTable} from "../context/TableContext";

const OrdersPage = () => {
    const {
      orders, 
      updateOrder,
      deleteOrder,
    } = useOrder();
    const { tables, updateTableStatus } = useTable();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<OrderStatus | "All">("All");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const filteredOrders = orders.filter((order) => {
        const matchesSearch = 
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
        order.customerName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = status === "All" || order.status === status;

        return matchesSearch && matchesStatus;
    }); 

    const handleStatusChange = (newStatus: OrderStatus) => {
        if(!selectedOrder) return;

        const updatedOrder:Order = {
            ...selectedOrder,
            status: newStatus,
            orderStatus:newStatus,
        };
        updateOrder(updatedOrder);
        setSelectedOrder(updatedOrder);
     };
     const handleViewOrder = (order:Order) => {
      setSelectedOrder(order);
      setOpenMenuId(null);
     };

     const handleEditOrder = (order:Order) => {
      setEditingOrder(order);
      setOpenMenuId(null);
     };

     const handleDeleteOrder = (orderId:string) => {
      deleteOrder(orderId);
      setOpenMenuId(null);

      if(selectedOrder?.id === orderId){
        setSelectedOrder(null);
      }
     };
    return (
        <div className="flex h-full min-h-0 flex-col gap-6">
            <div>
            <h1 className="text-2xl font-bold text-slate-900">
                Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                Manage Resturant Orders
            </p>
            </div>

             <div className = "rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row">

                    <div className="relative max-w-md flex-1">

                        <Search size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                        <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                    </div>
                    
                    <select
                    value={status}
                    onChange={(e)=>setStatus(e.target.value as OrderStatus | "All")}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500">

                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
             </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="min-h-0 flex-1 overflow-auto">

                <table className="w-full min-w-225">

                  <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                        Order
                      </th>

                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                        Customer
                      </th>

                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                        Type
                      </th>

                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                        Items
                      </th>

                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                        Total
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

                    {filteredOrders.map((order) => (
                      <tr key={order.id}
                      onClick={() => handleViewOrder(order)}
                      className="cursor-pointer transition hover:bg-slate-50">

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {order.customerName}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-400">
                             {order.orderType}
                          </p>

                          {order.tableNumber && (
                            <p className="mt-1 text-xs text-slate-400">
                              Table {order.tableNumber}
                            </p>
                          )}
                        </td>

                         <td className="px-6 py-4 text-sm text-slate-600">

                          {order.items.reduce(
                            (total,item) => total+item.quantity,0
                          )}
                         </td>

                         <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                           ₹{order.total}
                         </td>

                         <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${
                            order.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : order.status === "Cancelled"
                            ? "bg-red-50 text-red-600"
                            : order.status === "Preparing"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                          }`}
                          >
                            {order.status}
                          </span>
                         </td>

                         <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === order.id ? null : order.id
                              );
                            }}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                              <MoreHorizontal size={20}/>
                            </button>

                            {openMenuId === order.id && (
                              <div className="absolute right-0 z-30 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                                <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrder(order);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                  <Eye size={16}/>
                                  View Details
                                </button>

                                <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOrder(order);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                  <Pencil size={16}/>
                                  Edit
                                </button>

                                <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order.id);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 size={16}/>
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

              {filteredOrders.length === 0 && (

                <div className="py-12 text-center text-sm text-slate-400">
                  No orders found
                </div>
              )}
              </div>  

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                onClick={() => setSelectedOrder(null)}>

                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            
                            <div>
                                 <h2 className="text-lg font-semibold text-slate-900">
                                    Order {selectedOrder.orderNumber}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                            </div>

                             <button
                             type="button"
                             onClick={() => setSelectedOrder(null)}
                             className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
                              <X size = {20}/>
                            </button>

                        </div>

                        <div className="space-y-3 border-b border-slate-200 px-6 py-5">

                           <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                     Customer
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                     {selectedOrder.customerName}
                                </span>
                            </div>

                             <div className="flex justify-between">
                                 <span className="text-sm text-slate-500">
                                    Order Type
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                     {selectedOrder.orderType}
                                </span>
                            </div>

                               {selectedOrder.tableNumber && (
                                
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">
                                        Table
                                    </span>

                                    <span className="text-sm font-medium text-slate-900">
                                         {selectedOrder.tableNumber}
                                    </span>
                                </div>
                                )}
                                
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">
                                        Status
                                    </span>

                                    <select value={selectedOrder.status}
                                    onChange={(e) =>  handleStatusChange(e.target.value as OrderStatus)}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">

                                        <option value="Pending">Pending</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                             </div>
                             
                             <div className="px-6 py-5">

                                <h3 className="mb-4 font-semibold text-slate-900">
                                    Order Items
                                </h3>
                                
                                <div className="space-y-3">

                                    {selectedOrder.items.map((item) => (
                                        <div
                                        key={item.menuItemId}
                                        className="flex items-center justify-between">
                                            
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {item.name}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {item.quantity} × ₹{item.price}
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-900">
                                                ₹{item.quantity * item.price}
                                            </p>

                                        </div>
                                       ))}

                                    </div>
                                    
                                    <div className="mt-5 flex justify-between border-t border-slate-200 pt-4">

                                        <span className="font-semibold text-slate-900">
                                            Total
                                        </span>

                                        <span className="text-lg font-bold text-orange-600">
                                            ₹{selectedOrder.total}
                                        </span>

                                    </div>

                                </div>
                                
                                <div className="flex justify-end border-t border-slate-100 px-6 py-4">

                                    <button
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                                        Close
                                    </button>

                                </div>

                            </div>
                        </div>
                       )}  
                       {editingOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onClick={() => setEditingOrder(null)}>
                          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                          onClick={(e) => e.stopPropagation()}>

                            <div className="flex item-center justify-between border-b border-slate-200 px-6 py-5">

                              <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                  Edit Order
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                  {editingOrder.orderNumber}
                                </p>
                              </div>

                              <button 
                              type="button"
                              onClick={() => setEditingOrder(null)}
                              className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
                                <X size = {20}/>
                              </button>
                            </div>

                            <div className="space-y-5 px-6 py-6">

                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  Customer Name
                                </label>

                                <input
                                type="text"
                                value={editingOrder.customerName}
                                onChange={(e) => setEditingOrder({
                                  ...editingOrder,customerName:e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm  outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                              </div>
                              
                              {editingOrder.orderType === "Dine In" && (
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  Table Number
                                </label>

                                <select
                                value={editingOrder.tableNumber && editingOrder.tableSection
                                  ? `${editingOrder.tableSection}::${editingOrder.tableNumber}`
                                  : ""
                                }

                                onChange ={(e) => {
                                  if(!e.target.value) {
                                    setEditingOrder({
                                      ...editingOrder,
                                      tableNumber:undefined,
                                      tableSection:undefined,
                                    });
                                    return;
                                  }
                                  const [selectedSection, selectedNumber] = e.target.value.split("::");

                                  setEditingOrder({
                                    ...editingOrder,
                                    tableSection : selectedSection,
                                    tableNumber : Number(selectedNumber),
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                 
                                 <option value="">Select table</option>

                                 {tables.filter((table) => 
                                table.status === "Available" ||
                                (table.tableNumber === editingOrder.tableNumber && 
                                  table.section === editingOrder.tableSection
                                ))
                                .sort((a,b) => {
                                  if(a.section === b.section){
                                    return a.tableNumber - b.tableNumber;
                                  }
                                  return a.section.localeCompare(b.section);
                                })
                                .map((table) => (
                                  <option key={table.id}
                                  value={`${table.section}::${table.tableNumber}`}>
                                    {table.section} - Table{table.tableNumber}
                                  </option>
                                ))
                                }
                                </select>
                              </div>
                              )}

                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  Order Type 
                                </label>

                                <select
                                value={editingOrder.orderType}
                                onChange={(e) => {
                                  const newOrderType = e.target.value as Order["orderType"];
                                  setEditingOrder({
                                  ...editingOrder,
                                  orderType:newOrderType,
                                  tableNumber :newOrderType === "Dine In" ? editingOrder.tableNumber : undefined,
                                  tableSection:newOrderType === "Dine In" ? editingOrder.tableSection : undefined,
                                })
                              }}
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                <option value="Dine In">Dine In</option>
                                <option value="Takeaway">Takeaway</option>
                                <option value="Delivery">Delivery</option>
                              </select>
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  Status
                                </label>

                                <select
                                value={editingOrder.status}
                                onChange={(e) => setEditingOrder({
                                  ...editingOrder,
                                  status:e.target.value as OrderStatus,
                                  orderStatus: e.target.value as OrderStatus,
                                })
                              }
                              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                                <option value="Pending">Pending</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready">Ready</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                              <button
                              type="button"
                              onClick={() => setEditingOrder(null)}
                              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-meidum text-slate-700 hover:bg-slate-50">
                                Cancel
                              </button>

                              <button
                              type="button"
                              onClick={() => {
                                  const originalOrder = orders.find(
                                    (order) => order.id === editingOrder.id
                                  );
                                  if(
                                    originalOrder?.tableNumber && 
                                    originalOrder?.tableSection &&
                                   (
                                    editingOrder.orderType !== "Dine In" ||
                                    originalOrder.tableNumber != editingOrder.tableNumber ||
                                    originalOrder.tableSection !== editingOrder.tableSection
                                  )
                                  ) {
                                    const oldTable = tables.find(
                                      (table) => 
                                        table.tableNumber === originalOrder.tableNumber &&
                                        table.section === originalOrder.tableSection
                                    );
                                    if(oldTable) {
                                      updateTableStatus(oldTable.id,"Available");
                                    }
                                  }
                                  if(
                                    editingOrder.orderType === "Dine In" &&
                                    editingOrder.tableNumber &&
                                    editingOrder.tableSection
                                  ){
                                  const newTable = tables.find(
                                    (table) => 
                                      table.tableNumber === editingOrder.tableNumber && 
                                    table.section === editingOrder.tableSection
                                  );
                                  if(newTable){
                                    updateTableStatus(newTable.id,"Reserved");
                                  }
                                }
                                updateOrder(editingOrder);
                                setEditingOrder(null);
                              }}
                              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600">
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                       )}
        </div>
    );
};

export default OrdersPage;

   
