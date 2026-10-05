import {createContext, useContext, useEffect, useState} from "react";
import type {Order} from "../types/order";
import {normalizeRecordId} from "../utils/recordIds";

const ORDER_STORAGE_KEY = "restaurant_orders";

const initialOrders: Order[] = [
  {
    id: "ORDER-1",
    orderNumber: "ORD-001",
    customerName: "Teja",
    tableNumber: 4,
    tableSection : "Indoor",

    items: [
      {
        menuItemId: "MENU-1",
        name: "Chicken Biryani",
        price: 250,
        quantity: 2,
      },
      {
        menuItemId: "MENU-2",
        name: "Coke",
        price: 50,
        quantity: 2,
      },
    ],

    total: 600,

    status: "Preparing",
    orderStatus: "Preparing",
    orderType: "Dine In",

    paymentStatus: "Paid",
    createdAt: new Date().toISOString(),
  },

  {
    id: "ORDER-2",
    orderNumber: "ORD-002",
    customerName: "Rahul",
    tableNumber: 2,
    tableSection : "Indoor",

    items: [
      {
        menuItemId: "MENU-3",
        name: "Paneer Butter Masala",
        price: 220,
        quantity: 1,
      },
    ],

    total: 220,

    status: "Pending",
    orderStatus: "Pending",
    orderType: "Dine In",

    paymentStatus: "Pending",
    createdAt: new Date().toISOString(),
  },
];
interface OrderContextType{
    orders:Order[];
    setOrders : React.Dispatch<React.SetStateAction<Order[]>>;
    addOrder: (order:Order) => void;
    updateOrder: (order:Order) => void;
    deleteOrder: (orderId:string) =>void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({
    children,
} : {
    children:React.ReactNode;
}) => {
    const [orders, setOrders] = useState<Order[]>(() => {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
 
        if(storedOrders) {
          const parsedOrders = JSON.parse(storedOrders) as Order[];
          return parsedOrders.map((order) => ({
            ...order,
            id: normalizeRecordId(order.id, "ORDER"),
            items: order.items.map((item) => ({
              ...item,
              menuItemId: normalizeRecordId(item.menuItemId, "MENU"),
            })),
          }));
        }
        return initialOrders;
    });

    useEffect(() => {
        localStorage.setItem(ORDER_STORAGE_KEY,JSON.stringify(orders));
    },[orders]);

    const addOrder = (order:Order) => {
      setOrders((prev) => [
        ...prev,
        {
          ...order,
          id: normalizeRecordId(order.id, "ORDER"),
          items: order.items.map((item) => ({
            ...item,
            menuItemId: normalizeRecordId(item.menuItemId, "MENU"),
          })),
        },
      ]);
    };

    const updateOrder = (updatedOrder:Order) => {
        setOrders((prev) => 
        prev.map((order) => 
        order.id === updatedOrder.id
        ? updatedOrder
        : order))
    };

    const deleteOrder = (orderId:string) => {
        setOrders((prev) => 
        prev.filter((order) => order.id !== orderId))
    };

    return(
        <OrderContext.Provider value = {{
            orders,
            setOrders,
            addOrder,
            updateOrder,
            deleteOrder,
        }}>
            {children}
        </OrderContext.Provider>
    )
};

export const useOrder = () => {
    const context = useContext(OrderContext);

    if(!context){
        throw new Error(
            "useOrder must be used inside OrderProvider"
        )
    }
    return context;
}