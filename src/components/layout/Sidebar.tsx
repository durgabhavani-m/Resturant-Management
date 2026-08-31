import type {ReactNode} from "react";
import {NavLink} from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  CalendarDays,
  Armchair,
  Users,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  path: string;
}

const Sidebar = () =>{
    return (
        <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">

            <div className="flex h-20 items-center border-b border-slate-800 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center jsutify-center rounded-xl bg-orange-600">
                        <Utensils size={22}/>
                    </div>

                    <div>
                        <h1 className="text-lg font-bold">
                            RestruHub
                        </h1>

                        <p className="text-xs text-slate-400">
                            Management System
                        </p>

                     </div>
                </div>
            </div>

                        <nav className="flex-1 px-4 py-6">
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Main
                            </p>

                            <SidebarItem
                            icon={<LayoutDashboard size={19}/>}
                            label="Dashboard"
                            path="/dashboard"
                            />

                            <SidebarItem 
                            icon={<Utensils size ={19}/>}
                            label = "Menu"
                            path="/menu"
                            />

                            <SidebarItem
                            icon={<ShoppingCart size={19}/>}
                            label = "Orders"
                            path="/orders"
                            />

                            <SidebarItem
                            icon={<CalendarDays size={19}/>}
                            label = "Reservations"
                            path="reservations"
                            />

                            <SidebarItem
                            icon={<Armchair size={19}/>}
                            label = "Tabels"
                            path="/tables"
                            />

                            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Management
                            </p>

                            <SidebarItem
                            icon={<Users size={19}/>}
                            label = "Customers"
                            path="/customers"
                            />

                            <SidebarItem
                            icon={<UserCog size={19}/>}
                            label="Users"
                            path="/users"
                            />

                            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                System
                            </p>

                            <SidebarItem
                            icon={<Settings size={19}/>}
                            label="Settings"
                            path ="/settings"
                            />
                        </nav>

                        <div className="border-t border-slate-800 p-4">
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 trasnition hover:bg-slate-800 hover:text-white">
                                <LogOut size={19}/>
                                <span>Logout</span>
                            </button>
                        </div>
        </aside>
    )
}
const SidebarItem = ({
  icon,
  label,
  path,
}: SidebarItemProps) => {
  return (
    <NavLink to ={path}
      className={({isActive}) => `mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition 
      ${
        isActive
          ? "bg-orange-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
    <span className="shrink-0">
        {icon}
    </span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
};
export default Sidebar;