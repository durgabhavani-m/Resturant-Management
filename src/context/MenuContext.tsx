import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
}from "react";

import type {MenuItem} from "../types/menu";

interface MenuContextType{
    items:MenuItem[];

    addItem: (item:MenuItem) => void;
    updateItem: (item:MenuItem) => void;
    deleteItem: (id: string) => void;
    toggleAvailability: (id: string) => void;
}

const MenuContext = createContext<MenuContextType |undefined>(
    undefined
)

const STORAGE_KEY = "restaurant_menu";

const initialItems:MenuItem[] = [
    {
    id: "1",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices",
    price: 280,
    category: "Starters",
    available: true,
  },
  {
    id: "2",
    name: "Butter Chicken",
    description: "Chicken cooked in creamy tomato gravy",
    price: 420,
    category: "Main Course",
    available: true,
  },
  {
    id: "3",
    name: "Gulab Jamun",
    description: "Traditional Indian sweet",
    price: 120,
    category: "Desserts",
    available: true,
  },
];

export const MenuProvider = ({children,}:{children:ReactNode;}) => {
    const [items, setItems] = useState<MenuItem[]>(()=> {
        const storedItems = localStorage.getItem(STORAGE_KEY);

        if (storedItems) {
            return JSON.parse(storedItems);
        }
        return initialItems;
    });

    useEffect(()=> {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    },[items]);

    const addItem = (item:MenuItem) => {
        setItems((prev) => [...prev,item]);
    };

    const updateItem = (updatedItem:MenuItem) => {
        setItems((prev) => 
        prev.map((item) =>
        item.id === updatedItem.id
        ?updatedItem : item));
    };

    const deleteItem = (id: string) => {
        setItems((prev) => 
            prev.filter((item ) => item.id !== id)
        );
    };

    const toggleAvailability = (id:string) => {
        setItems((prev) => 
        prev.map((item) => 
        item.id === id
    ?{
        ...item,
        available:!item.available,
    }
     :item
    )
   );
};

return (
    <MenuContext.Provider
    value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        toggleAvailability,
    }}
    >
        {children}
    </MenuContext.Provider>
)
};

export const useMenu = () => {
    const context = useContext(MenuContext);

    if(!context){
        throw new Error(
            "useMenu must be used inside MenuProvider"
        )
    }
    return context;
};