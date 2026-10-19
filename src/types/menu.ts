
export type MenuCategory = string;
export type MenuCategoryStatus = "Active" | "Inactive";

export interface MenuCategoryMetadata {
  description?: string;
  status?: MenuCategoryStatus;
}

export type FoodType = "Veg" | "Non-Veg";
export type MenuStockStatus = "Available" | "Out of Stock";

export interface MenuModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuModifierGroup {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  required?: boolean;
  options: MenuModifierOption[];
  isAvailable?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
  stockStatus?: MenuStockStatus;
  foodType?: FoodType;
  modifierGroupIds?: string[];
  modifierGroups?: MenuModifierGroup[];
}