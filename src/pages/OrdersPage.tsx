import { Search, X } from "lucide-react";
import {useState, useEffect} from "react";
import type {Order, OrderStatus} from "../types/order";

const ORDERS_STORAGE_KEY = "resturant_orders";

const initialOrders: Order[] = [
     {
    id: "1",
    orderNumber: "#1001",
    customerName: "Rahul Sharma",
    items: [
      {
        menuItemId: "1",
        name: "Paneer Tikka",
        quantity: 2,
        price: 280,
      },
    ],
    total: 560,
    status: "Completed",
    orderType: "Dine In",
    tableNumber: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    orderNumber: "#1002",
    customerName: "Priya Patel",
    items: [
      {
        menuItemId: "2",
        name: "Butter Chicken",
        quantity: 1,
        price: 420,
      },
    ],
    total: 420,
    status: "Preparing",
    orderType: "Dine In",
    tableNumber: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    orderNumber: "#1003",
    customerName: "Amit Kumar",
    items: [
      {
        menuItemId: "3",
        name: "Gulab Jamun",
        quantity: 2,
        price: 120,
      },
    ],
    total: 240,
    status: "Pending",
    orderType: "Takeaway",
    createdAt: new Date().toISOString(),
  },
];

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>(() => {
        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

        if(storedOrders) {

            return JSON.parse(storedOrders);
        }
        return initialOrders;
    });
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<OrderStatus | "All">("All");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        localStorage.setItem(
            ORDERS_STORAGE_KEY,
            JSON.stringify(orders)
        );
    },[orders]);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = 
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
        order.customerName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = status === "All" || order.status === status;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (newStatus: OrderStatus) => {
        if(!selectedOrder) return;

        const updatedOrder = {
            ...selectedOrder,
            status: newStatus,
        };
        setOrders((prev) => 
        prev.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
    ));
    setSelectedOrder(updatedOrder);
    }
    return (
        <div className="space-y-6">
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

            <div className="overflow-hidden  rounded-xl border border-slate-200 bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-225">

                  <thead className="border-b border-slate-200 bg-slate-50">

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
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredOrders.map((order) => (
                      <tr key={order.id}
                      onClick={() => setSelectedOrder(order)}
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
        </div>
    );
};

export default OrdersPage;

   