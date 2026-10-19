import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
}from "react";

import type {
    MenuCategory,
    MenuCategoryMetadata,
    MenuCategoryStatus,
    MenuItem,
} from "../types/menu";
import {getNextRecordId, normalizeRecordId} from "../utils/recordIds";

interface MenuContextType{
    items:MenuItem[];
    categories:MenuCategory[];
    categoryMetadata: Record<string, MenuCategoryMetadata>;

    addItem: (item:MenuItem) => boolean;
    updateItem: (item:MenuItem) => boolean;
    addCategory: (category:string, metadata?: MenuCategoryMetadata) => boolean;
    updateCategory: (
        category: string,
        updatedCategory: string,
        metadata?: MenuCategoryMetadata
    ) => boolean;
    deleteCategory: (category: string, replacementCategory?: string) => boolean;
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

const categoryKey = (category: string) => normalizeCategory(category).toLowerCase();

interface StoredCategory {
    name: string;
    description?: string;
    status?: MenuCategoryStatus;
}

interface StoredCategoryData {
    version: 2;
    categories: StoredCategory[];
}

interface CategoryState {
    categories: MenuCategory[];
    metadata: Record<string, MenuCategoryMetadata>;
}

const isCategoryStatus = (status: unknown): status is MenuCategoryStatus =>
    status === "Active" || status === "Inactive";

const readCategoryState = (storedCategories: string | null): CategoryState => {
    if (storedCategories === null) {
        return { categories: [], metadata: {} };
    }

    const parsed: unknown = JSON.parse(storedCategories);
    const storedEntries: StoredCategory[] = [];

    if (Array.isArray(parsed)) {
        for (const category of parsed) {
            if (typeof category !== "string") {
                throw new Error("Invalid saved menu category data.");
            }
            storedEntries.push({ name: category });
        }
    } else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "version" in parsed &&
        parsed.version === 2 &&
        "categories" in parsed &&
        Array.isArray(parsed.categories)
    ) {
        for (const category of parsed.categories) {
            if (
                typeof category !== "object" ||
                category === null ||
                !("name" in category) ||
                typeof category.name !== "string" ||
                ("description" in category &&
                    category.description !== undefined &&
                    typeof category.description !== "string") ||
                ("status" in category &&
                    category.status !== undefined &&
                    !isCategoryStatus(category.status))
            ) {
                throw new Error("Invalid saved menu category data.");
            }
            storedEntries.push({
                name: category.name,
                ...("description" in category &&
                typeof category.description === "string"
                    ? { description: category.description }
                    : {}),
                ...("status" in category && isCategoryStatus(category.status)
                    ? { status: category.status }
                    : {}),
            });
        }
    } else {
        throw new Error("Invalid saved menu category data.");
    }

    const normalizedCategories = uniqueCategories(
        storedEntries.map((category) => category.name)
    );
    const metadata: Record<string, MenuCategoryMetadata> = {};
    storedEntries.forEach((category) => {
        const normalizedName = normalizeCategory(category.name);
        if (!normalizedName) return;
        const key = categoryKey(normalizedName);
        if (metadata[key]) return;
        metadata[key] = {
            ...(category.description !== undefined
                ? { description: category.description }
                : {}),
            ...(category.status !== undefined ? { status: category.status } : {}),
        };
    });

    return { categories: normalizedCategories, metadata };
};

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
    stockStatus: "Available",
  },
  {
    id: "MENU-2",
    name: "Butter Chicken",
    description: "Chicken cooked in creamy tomato gravy",
    price: 420,
    category: "Main Course",
    isAvailable: true,
    stockStatus: "Available",
  },
  {
    id: "MENU-3",
    name: "Gulab Jamun",
    description: "Traditional Indian sweet",
    price: 120,
    category: "Desserts",
    isAvailable: true,
    stockStatus: "Available",
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
                    stockStatus:
                        item.stockStatus === "Out of Stock"
                            ? "Out of Stock"
                            : "Available",
                });
            });
            return Array.from(uniqueItems.values());
        }
        return initialItems;
    });

    const [categoryState, setCategoryState] = useState<CategoryState>(() => {
        const storedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
        const storedState = readCategoryState(storedCategories);
        const allCategories = [
            ...(storedCategories === null
                ? defaultCategories
                : storedState.categories),
            ...items.map((item) => item.category),
        ];
        return {
            categories: uniqueCategories(allCategories),
            metadata: storedState.metadata,
        };
    });
    const { categories, metadata: categoryMetadata } = categoryState;

    useEffect(()=> {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    },[items]);

    useEffect(() => {
        const storedCategories: StoredCategoryData = {
            version: 2,
            categories: categories.map((name) => ({
                name,
                ...categoryMetadata[categoryKey(name)],
            })),
        };
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(storedCategories));
    }, [categories, categoryMetadata]);

    const addCategory = (
        category: string,
        metadata?: MenuCategoryMetadata
    ): boolean => {
        const normalizedCategory = normalizeCategory(category);
        if (!normalizedCategory || categories.some((existingCategory) =>
            normalizeCategory(existingCategory).toLowerCase() === normalizedCategory.toLowerCase()
        )) {
            return false;
        }

        setCategoryState((previous) => ({
            categories: [...previous.categories, normalizedCategory],
            metadata: metadata
                ? {
                    ...previous.metadata,
                    [categoryKey(normalizedCategory)]: metadata,
                }
                : previous.metadata,
        }));
        return true;
    };

    const updateCategory = (
        category: string,
        updatedCategory: string,
        metadata?: MenuCategoryMetadata
    ): boolean => {
        const normalizedCategory = normalizeCategory(category);
        const normalizedUpdatedCategory = normalizeCategory(updatedCategory);
        const categoryLookupKey = normalizedCategory.toLowerCase();
        const updatedCategoryKey = normalizedUpdatedCategory.toLowerCase();

        if (
            !normalizedUpdatedCategory ||
            !categories.some(
                (existingCategory) =>
                    normalizeCategory(existingCategory).toLowerCase() === categoryLookupKey
            ) ||
            categories.some(
                (existingCategory) =>
                    normalizeCategory(existingCategory).toLowerCase() !== categoryLookupKey &&
                    normalizeCategory(existingCategory).toLowerCase() === updatedCategoryKey
            )
        ) {
            return false;
        }

        setCategoryState((previous) => {
            const previousMetadata = previous.metadata[categoryLookupKey];
            const nextMetadata = { ...previous.metadata };
            delete nextMetadata[categoryLookupKey];
            const renamedMetadata = metadata ?? previousMetadata;
            if (renamedMetadata) {
                nextMetadata[updatedCategoryKey] = renamedMetadata;
            }
            return {
                categories: uniqueCategories(
                    previous.categories.map((existingCategory) =>
                        normalizeCategory(existingCategory).toLowerCase() === categoryLookupKey
                            ? normalizedUpdatedCategory
                            : existingCategory
                    )
                ),
                metadata: nextMetadata,
            };
        });
        setItems((previous) =>
            previous.map((item) =>
                normalizeCategory(item.category).toLowerCase() === categoryLookupKey
                    ? { ...item, category: normalizedUpdatedCategory }
                    : item
            )
        );
        return true;
    };

    const deleteCategory = (
        category: string,
        replacementCategory?: string
    ): boolean => {
        const normalizedCategory = normalizeCategory(category);
        const categoryKey = normalizedCategory.toLowerCase();
        const itemsInCategory = items.filter(
            (item) =>
                normalizeCategory(item.category).toLowerCase() === categoryKey
        );
        const normalizedReplacement = replacementCategory
            ? normalizeCategory(replacementCategory)
            : "";

        if (
            !categories.some(
                (existingCategory) =>
                    normalizeCategory(existingCategory).toLowerCase() === categoryKey
            ) ||
            (itemsInCategory.length > 0 &&
                (!normalizedReplacement ||
                    normalizedReplacement.toLowerCase() === categoryKey ||
                    !categories.some(
                        (existingCategory) =>
                            normalizeCategory(existingCategory).toLowerCase() ===
                            normalizedReplacement.toLowerCase()
                    )))
        ) {
            return false;
        }

        setCategoryState((previous) => {
            const nextMetadata = { ...previous.metadata };
            delete nextMetadata[categoryKey];
            return {
                categories: previous.categories.filter(
                    (existingCategory) =>
                        normalizeCategory(existingCategory).toLowerCase() !== categoryKey
                ),
                metadata: nextMetadata,
            };
        });
        if (itemsInCategory.length > 0) {
            setItems((previous) =>
                previous.map((item) =>
                    normalizeCategory(item.category).toLowerCase() === categoryKey
                        ? { ...item, category: normalizedReplacement }
                        : item
                )
            );
        }
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
        categoryMetadata,
        addItem,
        updateItem,
        addCategory,
        updateCategory,
        deleteCategory,
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