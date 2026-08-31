export type MenuCategory = 
|"Starters"
|"Main Course"
|"Desserts"
|"Beverages"

export interface MenuItem{
    id:string;
    name:string;
    description:string;
    price:number;
    category:MenuCategory;
    available:boolean;
}