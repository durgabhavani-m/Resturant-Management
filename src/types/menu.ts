export type MenuCategory = string;

export interface MenuItem{
    id:string;
    name:string;
    description:string;
    price:number;
    category:MenuCategory;
    isAvailable:boolean;
}