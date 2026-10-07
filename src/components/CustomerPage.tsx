import {Search,Plus, X} from "lucide-react";
import {useState, useEffect} from "react";
import type {Customer} from "../types/customer";
import {getNextRecordId, normalizeRecordId} from "../utils/recordIds";

const CUSTOMER_STORAGE_KEY = "restaurant_customers";

const initialCustomers : Customer[] = [
     {
    id: "CUSTOMER-1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    totalOrders: 12,
    totalSpent: 4560,
    createdAt: new Date().toISOString(),
  },
  {
    id: "CUSTOMER-2",
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "9876543211",
    totalOrders: 8,
    totalSpent: 3240,
    createdAt: new Date().toISOString(),
  },
  {
    id: "CUSTOMER-3",
    name: "Amit Kumar",
    email: "amit@gmail.com",
    phone: "9876543212",
    totalOrders: 5,
    totalSpent: 1860,
    createdAt: new Date().toISOString(),
  },
];

const CustomerPage = () => {

    const [name,setName] =useState("");
    const [email,setEmail] =useState("");
    const [phone,setPhone] = useState("");
    const[customers, setCustomers] = useState<Customer[]>(() => {
        const storedCustomers = localStorage.getItem(CUSTOMER_STORAGE_KEY);

        if(storedCustomers) {
            const parsedCustomers = JSON.parse(storedCustomers) as Customer[];
            return parsedCustomers.map((customer) => ({
                ...customer,
                id: normalizeRecordId(customer.id, "CUSTOMER"),
            }));
        }
        return initialCustomers;
    });

    const [search,setSearch] = useState("");
    const [ showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [openActionsId, setOpenActionsId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(
            CUSTOMER_STORAGE_KEY,
            JSON.stringify(customers)
        );
    },[customers]) 

    const filteredCustomers = customers.filter((customer) => 
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) || 
    customer.phone.includes(search)
   );

   const handleSubmitCustomer = (e:React.FormEvent) => {
    e.preventDefault();

    if(!name.trim() || !email.trim() || !phone.trim()) {
        return;
    }

    if(editingCustomer) {
        const updatedCustomer: Customer = {
            ...editingCustomer,
            name:name.trim(),
            email:email.trim(),
            phone:phone.trim(),
        };

        setCustomers((prev) => 
        prev.map((customer) => 
        customer.id === updatedCustomer.id
        ? updatedCustomer
        :customer))

        setEditingCustomer(null);
    }else{
    const newCustomer : Customer ={
        id: getNextRecordId("CUSTOMER", customers.map((customer) => customer.id)),
        name:name.trim(),
        email:email.trim(),
        phone:phone.trim(),
        totalOrders:0,
        totalSpent:0,
        createdAt :new Date().toISOString(),
    };

    setCustomers((prev) => [...prev, newCustomer]);

    setName("");
    setEmail("");
    setPhone("");
    setShowForm(false);
   };
};

   const handleDeleteCustomer = (customerId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this customer?"
  );

  if (!confirmed) return;

  setCustomers((prev) =>
    prev.filter((customer) => customer.id !== customerId)
  );
};

   return(

    <div className="flex h-full min-h-0 flex-col gap-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

            <h1 className="text-2xl font-bold text-slate-900">
                Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                Manage your restaurant customers
            </p>
        </div>

        <button type="submit"
        onClick={() => {
            setEditingCustomer(null);
            setName("");
            setEmail("");
            setPhone("");
            setShowForm(true)}}
        className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700">
            <Plus size={18}/>
            {editingCustomer ? "UpdateCustomer" : "Add Customer"}
        </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">

            <div className="relative max-w-md">

                <Search size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
            </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="min-h-0 flex-1 overflow-auto">

                <table className="w-full min-w-225">

                    <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
                        <tr>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Customer
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Phone
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                               Orders
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                               Total Spent
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate=100">

                        {filteredCustomers.map((customer) => (

                            <tr key={customer.id}
                            className="transition hover:bg-slate-50">

                                <td className="px-6 py-4">

                                    <p className="font-medium text-slate-900">
                                        {customer.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {customer.email}
                                    </p>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {customer.phone}
                                </td>

                                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                    {customer.totalOrders}
                                </td>

                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                    ₹{customer.totalSpent}
                                </td>

                                <td className="px-6 py-4 text-left">
                                    <div className="relative">

                                        <button type="button"
                                        onClick = {() => 
                                            setOpenActionsId(
                                                openActionsId === customer.id ? null :customer.id
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            Actions
                                        </button>

                                        {openActionsId === customer.id && (
                                            <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">

                                           <button 
                                           type="button"
                                           onClick={() => {
                                            setViewingCustomer(customer);
                                            setOpenActionsId(null);
                                           }} 
                                           className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                            View Details
                                            </button>  

                                            <button 
                                            type="button"
                                            onClick={() => {
                                                setEditingCustomer(customer);
                                                setName(customer.name);
                                                setEmail(customer.email)
                                                setPhone(customer.phone);
                                                setOpenActionsId(null);
                                            }}  
                                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                                Edit
                                            </button>

                                            <button
                                            type="button"
                                            onClick={() => {
                                                handleDeleteCustomer(customer.id);
                                                setOpenActionsId(null);
                                            }}
                                            className="block w-fu;; px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
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

            {filteredCustomers.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                    No customer found
                </div>
            )}
        </div>

        {(showForm || editingCustomer)  && (
            <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => {
                setShowForm(false);
                setEditingCustomer(null)}}>
                
                <div
                className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}>

                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                     <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                           {editingCustomer ? "Edit Customer" : "Add Customer"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                           { editingCustomer ? "updated customer information" : "Add a new restaurant customer"}
                        </p>
                    </div>

                    <button
                    type="button"
                    onClick={() => {
                    setShowForm(false)
                    setEditingCustomer(null)}}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X size={20} />
                    </button>

                </div>

                <form
                onSubmit={handleSubmitCustomer}
                 className="space-y-5 p-6">

                   <div>
                       <label className="mb-2 block text-sm font-medium text-slate-700">
                            Name
                        </label>

                        <input
                        type="text"
                        value={name}
                        placeholder="Enter customer name"
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email
                        </label>

                        <input
                        type="email"
                        value={email}
                        placeholder="Enter customer email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Phone
                        </label>

                        <input
                        type="tel"
                        value={phone}
                        placeholder="Enter phone number"
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                  </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                    <button
                    type="button"
                    onClick={() => {
                    setShowForm(false)
                    setEditingCustomer(null)}}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Cancel
                    </button>

                    <button
                    type="submit"
                    className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700">
                        Add Customer
                    </button>

                   </div>

                </form>

            </div>
        </div>
    )}

    {viewingCustomer && (
        <div className="fixed inset-0 x-50 flex items-center justify-center bg-slate-900/50 p-4"
        onClick = {() => setViewingCustomer(null)}>

            <div className = "w-full max-w-lg rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900" >
                            Customer Details
                        </h2>
                         
                        <p className="mt-1 text-sm text-slate-500">
                            Customer information
                        </p>
                    </div>

                    <button
                    type="button"
                    onClick={() => setViewingCustomer(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <X size = {20}/>
                    </button>
                </div>

                <div className="space-y-4 p-6">

                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                            Name
                        </span>

                        <span className="text-sm font-medium text-slate-900">
                            {viewingCustomer.name}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                            Email
                        </span>

                        <span className="text-sm font-medium text-slate-900">
                            {viewingCustomer.email}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                            Phone
                        </span>

                        <span className="text-sm font-medium text-slate-900">
                            {viewingCustomer.phone}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                            Total Orders
                        </span>

                        <span className="text-sm font-medium text-slate-900">
                            {viewingCustomer.totalOrders}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                            Total Spent
                        </span>

                        <span className="text-sm font-semibold text-orange-600">
                             ₹{viewingCustomer.totalSpent}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 px-6 py-4">

                    <button 
                    type="button"
                    onClick={() => setViewingCustomer(null)}
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
export default CustomerPage;