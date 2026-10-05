import {useMemo, useRef, useState} from "react";
import {ArrowLeft, Banknote, CreditCard, Minus, Plus, ShoppingCart, Smartphone, Trash2, Wallet, X} from "lucide-react";
import {useNavigate, useParams} from "react-router-dom";

import {useTable} from "../context/TableContext";
import {useMenu} from "../context/MenuContext";
import {useOrder} from "../context/OrderContext";
import {useBilling} from "../context/BillingContext";

import type {Order} from "../types/order";
import type {Bill, PaymentMethod} from "../types/billing";
import {createRecordId, normalizeRecordId} from "../utils/recordIds";

interface CartItem {
    menuItemId : string;
    name : string;
    price : number;
    quantity : number;
}

const TableOrderPage = () => {
    const navigate = useNavigate();
    const{tableId} = useParams();

    const {tables, updateTableStatus} = useTable();
    const {items : menuItems} = useMenu();
    const {orders, addOrder, updateOrder, deleteOrder} = useOrder();
    const {bills, addBill, updateBill} = useBilling();

    const normalizedTableId = tableId
        ? normalizeRecordId(tableId, "TABLE")
        : undefined;
    const table = tables.find((item) =>
        item.id === tableId || item.id === normalizedTableId
    );

    const existingOrder = orders.find((order) => 
        order.tableNumber === table?.tableNumber &&
        order.tableSection === table?.section &&
        order.orderType === "Dine In"
    );

    const [cart, setCart] = useState<CartItem[]>(
        existingOrder?.items || []
    );

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
    const [paymentError, setPaymentError] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState<{
        billNumber: string;
        total: number;
        paymentMethod: PaymentMethod;
    } | null>(null);
    const paymentInProgress = useRef(false);

    const categories = useMemo(() => {
        const normalizedCategories = Array.from(
            new Set(menuItems.map((item) => 
            item.category.trim().toLowerCase()
            )
           )
         );
            return[
                "All",
                ...normalizedCategories.map((Category) => 
                Category.split(" ").map((word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
            )
        .join(" ")
       ),
    ]
    },[menuItems]);
    

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            if(!item.available) return false;

            if(selectedCategory === "All") {
                return true;
            }
            return(
                item.category.trim().toLowerCase() === 
                selectedCategory.trim().toLowerCase()
            )
        });
    },[menuItems,selectedCategory]);


   const addToCart = (
    menuItemId: string,
    name: string,
    price: number
   ) => {
  if (!table) return;

  setCart((prev) => {
    const existingItem = prev.find(
      (item) => item.menuItemId === menuItemId
    );

    if (existingItem) {
      return prev.map((item) =>
        item.menuItemId === menuItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    }

    return [
      ...prev,
      {
        menuItemId,
        name,
        price,
        quantity: 1,
      },
    ];
  });

  if (table.status === "Available") {
    updateTableStatus(table.id, "Reserved");
  }
};


    const increaseQuantity = (menuItemId : string) => {
        const updatedCart = cart.map((item) => 
        item.menuItemId === menuItemId
        ? {...item, quantity: item .quantity + 1}
        : item 
    );
    setCart(updatedCart);

    if(existingOrder){
        const updatedTotal = updatedCart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        updateOrder({
            ...existingOrder,
            items: updatedCart,
            total: updatedTotal
        })
    }
    };


    const decreaseQuantity = (menuItemId:string) => {
        if(!table) return;

        const updatedCart = cart.map((item) => 
        item.menuItemId === menuItemId
    ? {...item, quantity: item.quantity -1}
    : item
    )
    .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    if(existingOrder) {
        if(updatedCart.length === 0){
            deleteOrder(existingOrder.id);
        }else{
            const updatedTotal = updatedCart.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            );

            updateOrder({
                ...existingOrder,
                items: updatedCart,
                total: updatedTotal,
            });
         }
       }
    };


    const removeFromCart = (menuItemId : string) => {
        if(!table) return;

        const updatedCart = cart.filter((item) => 
        item.menuItemId !== menuItemId);

        setCart(updatedCart);

        if(existingOrder){
            if(updatedCart.length === 0){
                deleteOrder(existingOrder.id);
            }else{
                const updatedTotal = updatedCart.reduce(
                    (sum,item) => sum + item.price * item.quantity, 0
                );

                updateOrder({
                    ...existingOrder,
                    items:updatedCart,
                    total:updatedTotal,
                });
            }
        }
    };


    const total = cart.reduce(
        (sum,item) => sum + item.price * item.quantity, 0
    );

    const handleCompletePayment = (paymentTimestamp: number) => {
        if (paymentInProgress.current) return;
        if (!paymentMethod) {
            setPaymentError("Please select a payment method.");
            return;
        }
        if (!table || cart.length === 0) return;

        paymentInProgress.current = true;
        setIsProcessingPayment(true);
        setPaymentError("");

        const order: Order = existingOrder
            ? {
                ...existingOrder,
                customerName: existingOrder.customerName || "Walk-in Customer",
                items: cart,
                total,
                status: "Completed",
                orderStatus: "Completed",
                orderType: "Dine In",
                paymentStatus: "Paid",
            }
            : {
                id: createRecordId("ORDER"),
                orderNumber: `ORD-${paymentTimestamp}`,
                customerName: "Walk-in Customer",
                tableNumber: table.tableNumber,
                tableSection: table.section,
                items: cart,
                total,
                status: "Completed",
                orderStatus: "Completed",
                orderType: "Dine In",
                paymentStatus: "Paid",
                createdAt: new Date().toISOString(),
            };

        const existingBill = bills.find((bill) => bill.orderId === order.id);
        if (existingBill?.paymentStatus === "Paid") {
            setPaymentError("This order already has a paid bill.");
            paymentInProgress.current = false;
            setIsProcessingPayment(false);
            return;
        }

        const paidAt = new Date().toISOString();
        const bill: Bill = {
            id: existingBill?.id ?? createRecordId("BILL"),
            billNumber: existingBill?.billNumber ?? `BILL-${paymentTimestamp}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            subtotal: total,
            tax: 0,
            discount: 0,
            total,
            paymentMethod,
            paymentStatus: "Paid",
            createdAt: existingBill?.createdAt ?? paidAt,
            paidAt,
        };

        if (existingOrder) {
            updateOrder(order);
        } else {
            addOrder(order);
        }

        if (existingBill) {
            updateBill(bill);
        } else {
            addBill(bill);
        }

        updateTableStatus(table.id, "Cleaning");
        sessionStorage.setItem(
            "restaurant_table_notice",
            `Billing completed for Table ${table.tableNumber}. Table is now cleaning.`
        );
        setCart([]);
        setIsBillingOpen(false);
        setPaymentReceipt({
            billNumber: bill.billNumber,
            total,
            paymentMethod,
        });
        setTimeout(() => navigate("/tables"), 1000);
    };

    const paymentOptions = [
        {method: "Cash" as const, icon: <Banknote size={20}/>},
        {method: "UPI" as const, icon: <Smartphone size={20}/>},
        {method: "Card" as const, icon: <CreditCard size={20}/>},
        {method: "Other" as const, icon: <Wallet size={20}/>},
    ];

    if(!table){
        return(
            <div className="flex min-h-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-smeibold text-slate-900">
                        Table not found
                    </h2>

                    <button
                    type="button"
                    onClick={() => navigate("/tables")}
                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                        Back to Tables
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="flex min-h-full flex-col bg-linear-to-br from-orange-50 via-slate-50 to-amber-50 lg:h-full lg:min-h-0">
            <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                <button 
                type="button"
                onClick={() => navigate("/tables")}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100">
                    <ArrowLeft size={20}/>
                </button>

                <div>
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        Dine-In Order
                    </span>

                    <h1 className="text-2xl font-bold text-slate-900">
                        {table.section} - Table {table.tableNumber}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Capacity: {table.capacity}quests
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">
                    Current Total
                </p>

                <p className="text-xl font-bold text-slate-900">
                     ₹{total.toFixed(2)}
                </p>
            </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-6 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:flex lg:min-h-0 lg:flex-col">
                <div className="mb-5 shrink-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Menu
                    </h2>

                    <p className="text-sm text-slate-500">
                        Select items to add to this table's order. 
                    </p>
                </div>

                <div className="mb-6 flex shrink-0 flex-wrap gap-3">
                    {categories.map((category) => (
                        <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full x-4 py-2 text-sm font-medium transition ${
                            selectedCategory === category
                            ? "bg-orange-900 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-200"
                        }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:content-start lg:overflow-y-auto xl:grid-cols-3">
                    {filteredMenuItems.map((item) => {
                        const cartItem = cart.find(
                            (cartItem) =>
                                cartItem.menuItemId === item.id
                        );

                        return(
                            <div 
                            key={item.id}
                            className=" group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-slate-900">
                                        {item.name}
                                    </h3>

                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-orange-900">
                                        ₹{item.price}
                                    </span>

                                    <button
                                    type="button"
                                    onClick={() => 
                                        addToCart(
                                            item.id,
                                            item.name,
                                            item.price
                                        )
                                    }
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 active:scale-95">
                                        {cartItem ? "Add More" : "Add"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {filteredMenuItems.length === 0 && (
                    <div className="rounded-xl border border-dashed-slate-200 py-12 text-center">
                        <p className="text-sm text-slate-500">
                             No available menu items in this category.
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <ShoppingCart size={20} className="text-slate-700"/>
                    </div>

                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Current Order
                        </h2>

                        <p className="text-xs text-slate-500">
                            Table {table.tableNumber} · {cart.reduce(
                                (sum,item) => sum + item.quantity,0
                            )} item(s)
                        </p>
                    </div>
                </div>
                {cart.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                        <ShoppingCart size={32}
                        className="mx-auto text-slate-300"/>

                        <p className="mt-3 text-sm font-medium text-slate-600">
                            No items added
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Select items from the menu.
                        </p>
                    </div>
                ):(
                    <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                        {cart.map((item) =>(
                            <div
                            key={item.menuItemId}
                            className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {item.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-900">
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </p>

                                    <button 
                                    type="button"
                                    onClick={() => 
                                        removeFromCart(item.menuItemId)
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                    title = "Remove item"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white">
                                        <button
                                        type="button"
                                        onClick={() => 
                                            decreaseQuantity(item.menuItemId)
                                        }
                                        className="p-2 text-slate-500 hover:bg-slate-50">
                                            <Minus size={14}/>
                                        </button>

                                        <span className="w-6 text-center text-sm font-semibold">
                                            {item.quantity}
                                        </span>

                                        <button
                                        type="button"
                                        onClick={() => 
                                            increaseQuantity(item.menuItemId)
                                        }
                                        className="p-2 text-slate-500 hover:bg-slate-50">
                                            <Plus size={14}/>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 lg:shrink-0">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-700">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tax</span>
                        <span className="text-slate-700">₹0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Discount</span>
                        <span className="text-slate-700">₹0</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="font-semibold text-slate-900">Grand Total</span>
                        <span className="text-xl font-bold text-slate-900">
                            ₹{total.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => {
                        setPaymentError("");
                        setPaymentMethod("");
                        setIsBillingOpen(true);
                    }}
                    className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40">
                        Proceed to Billing
                    </button>
                </div>
            </div>
        </div>

        {isBillingOpen && (
            <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !isProcessingPayment && setIsBillingOpen(false)}>
                <div
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}>
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Billing</h2>
                            <p className="mt-1 text-sm text-slate-500">Complete payment for this order</p>
                        </div>
                        <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => setIsBillingOpen(false)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        aria-label="Close billing">
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-slate-500">Table</span>
                                <span className="font-medium text-slate-900">{table.section} - Table {table.tableNumber}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-slate-500">Order</span>
                                <span className="font-medium text-slate-900">{existingOrder?.orderNumber ?? "New order"}</span>
                            </div>
                            <div className="space-y-2 border-t border-slate-200 pt-3">
                                {cart.map((item) => (
                                    <div key={item.menuItemId} className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-600">{item.name} × {item.quantity}</span>
                                        <span className="font-medium text-slate-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Discount</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        <fieldset>
                            <legend className="mb-3 text-sm font-medium text-slate-700">Payment Method</legend>
                            <div className="grid grid-cols-2 gap-3">
                                {paymentOptions.map((option) => (
                                    <button
                                    key={option.method}
                                    type="button"
                                    aria-pressed={paymentMethod === option.method}
                                    onClick={() => {
                                        setPaymentMethod(option.method);
                                        setPaymentError("");
                                    }}
                                    className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium transition ${
                                        paymentMethod === option.method
                                        ? "border-orange-600 bg-orange-50 text-orange-700"
                                        : "border-slate-200 text-slate-700 hover:border-orange-300"
                                    }`}>
                                        {option.icon}
                                        {option.method}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                        {paymentError && (
                            <p role="alert" className="text-sm font-medium text-red-600">
                                {paymentError}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => setIsBillingOpen(false)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => handleCompletePayment(Date.now())}
                        className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
                            {isProcessingPayment ? "Processing..." : "Pay & Complete Order"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {paymentReceipt && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CreditCard size={22}/>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Payment Successful</h2>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                        ₹{paymentReceipt.total.toLocaleString("en-IN")} Paid
                    </p>
                    <p className="mt-3 text-sm text-slate-500">
                        Payment Method: {paymentReceipt.paymentMethod}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Bill: {paymentReceipt.billNumber}</p>
                </div>
            </div>
        )}
    </div>    
    );
};
export default TableOrderPage;