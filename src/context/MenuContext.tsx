import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
}from "react";

import type {MenuCategory, MenuItem} from "../types/menu";
import {getNextRecordId, normalizeRecordId} from "../utils/recordIds";

interface MenuContextType{
    items:MenuItem[];
    categories:MenuCategory[];

    addItem: (item:MenuItem) => boolean;
    updateItem: (item:MenuItem) => boolean;
    addCategory: (category:string) => boolean;
    deleteItem: (id: string) => void;
    toggleAvailability: (id: string) => void;
}

const MenuContext = createContext<MenuContextType |undefined>(
    undefined
)

const STORAGE_KEY = "restaurant_menu";
const CATEGORY_STORAGE_KEY = "restaurant_menu_categories";

const defaultCategories: MenuCategory[] = [
    "Starters",
    "Main Course",
    "Desserts",
    "Beverages",
];

const normalizeCategory = (category: string) =>
    category.trim().replace(/\s+/g, " ");

const uniqueCategories = (source: string[]): MenuCategory[] => {
    const unique = new Map<string, MenuCategory>();
    source.forEach((category) => {
        const normalized = normalizeCategory(category);
        const key = normalized.toLowerCase();
        if (normalized && !unique.has(key)) unique.set(key, normalized);
    });
    return Array.from(unique.values());
};

const initialItems:MenuItem[] = [
    {
    id: "MENU-1",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices",
    price: 280,
    category: "Starters",
    isAvailable: true,
  },
  {
    id: "MENU-2",
    name: "Butter Chicken",
    description: "Chicken cooked in creamy tomato gravy",
    price: 420,
    category: "Main Course",
    isAvailable: true,
  },
  {
    id: "MENU-3",
    name: "Gulab Jamun",
    description: "Traditional Indian sweet",
    price: 120,
    category: "Desserts",
    isAvailable: true,
  },
];

export const MenuProvider = ({children,}:{children:ReactNode;}) => {
    const [items, setItems] = useState<MenuItem[]>(()=> {
        const storedItems = localStorage.getItem(STORAGE_KEY);

        if (storedItems) {
            const parsedItems = JSON.parse(storedItems) as MenuItem[];
            const uniqueItems = new Map<string, MenuItem>();
            parsedItems.forEach((item) => {
                const normalizedName = item.name.trim();
                const key = normalizedName.toLowerCase();
                if (!key || uniqueItems.has(key)) return;
                uniqueItems.set(key, {
                    ...item,
                    id: normalizeRecordId(item.id, "MENU"),
                    name: normalizedName,
                    category: normalizeCategory(item.category),
                });
            });
            return Array.from(uniqueItems.values());
        }
        return initialItems;
    });

    const [categories, setCategories] = useState<MenuCategory[]>(() => {
        const storedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
        const savedCategories = storedCategories
            ? JSON.parse(storedCategories) as string[]
            : [];
        const allCategories = [
            ...defaultCategories,
            ...savedCategories,
            ...items.map((item) => item.category),
        ];
        return uniqueCategories(allCategories);
    });

    useEffect(()=> {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    },[items]);

    useEffect(() => {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    }, [categories]);

    const addCategory = (category: string): boolean => {
        const normalizedCategory = normalizeCategory(category);
        if (!normalizedCategory || categories.some((existingCategory) =>
            normalizeCategory(existingCategory).toLowerCase() === normalizedCategory.toLowerCase()
        )) {
            return false;
        }

        setCategories((prev) => [...prev, normalizedCategory]);
        return true;
    };

    const addItem = (item:MenuItem): boolean => {
        const normalizedName = item.name.trim().toLowerCase();
        if (items.some((existingItem) =>
            existingItem.name.trim().toLowerCase() === normalizedName
        )) {
            return false;
        }

        const normalizedCategory = normalizeCategory(item.category);
        setItems((prev) => [
            ...prev,
            {
                ...item,
                id: getNextRecordId("MENU", prev.map((existingItem) => existingItem.id)),
                name: item.name.trim(),
                category: normalizedCategory,
            },
        ]);
        addCategory(normalizedCategory);
        return true;
    };

    const updateItem = (updatedItem:MenuItem): boolean => {
        const normalizedName = updatedItem.name.trim().toLowerCase();
        if (items.some((item) =>
            item.id !== updatedItem.id &&
            item.name.trim().toLowerCase() === normalizedName
        )) {
            return false;
        }

        const normalizedCategory = normalizeCategory(updatedItem.category);
        setItems((prev) => 
        prev.map((item) =>
        item.id === updatedItem.id
        ?{...updatedItem, name: updatedItem.name.trim(), category: normalizedCategory} : item));
        addCategory(normalizedCategory);
        return true;
    };

    const deleteItem = (id: string) => {
        setItems((prev) => 
            prev.filter((item ) => item.id !== id)
        );
    };

    const toggleAvailability = (id:string) => {
        setItems((currentItems) => 
        currentItems.map((item) => 
        item.id === id
    ?{
        ...item,
        isAvailable:!item.isAvailable,
    }
     :item
    )
   );
};

return (
    <MenuContext.Provider
    value={{
        items,
        categories,
        addItem,
        updateItem,
        addCategory,
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