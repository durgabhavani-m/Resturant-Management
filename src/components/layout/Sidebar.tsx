import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Receipt,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import type { Permission } from "../../types/permission";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  path: string;
  permission: Permission;
}

interface NavigationItem {
  icon: ReactNode;
  label: string;
  path: string;
  permission: Permission;
}

const Sidebar = () => {
  const { user, hasPermission, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", {replace:true});
  }

  const navigationItems: NavigationItem[] = [
    {
      icon: <LayoutDashboard size={19} />,
      label: "Dashboard",
      path: "/dashboard",
      permission: "dashboard",
    },
    {
      icon: <Utensils size={19} />,
      label: "Menu",
      path: "/menu",
      permission: "menu",
    },
    {
      icon: <ShoppingCart size={19} />,
      label: "Orders",
      path: "/orders",
      permission: "orders",
    },
    {
      icon: <CalendarDays size={19} />,
      label: "Reservations",
      path: "/reservations",
      permission: "reservations",
    },
    {
      icon: <Armchair size={19} />,
      label: "Tables",
      path: "/tables",
      permission: "tables",
    },
    {
      icon: <Users size={19} />,
      label: "Customers",
      path: "/customers",
      permission: "customers",
    },
    {
      icon: <Receipt size={19} />,
      label: "Billing",
      path: "/billing",
      permission: "billing",
    },
    {
      icon: <UserCog size={19} />,
      label: "Staff",
      path: "/staff",
      permission: "staff",
    },
    {
      icon: <Settings size={19} />,
      label: "Settings",
      path: "/settings",
      permission: "settings",
    },
  ];

  const visibleNavigationItems = navigationItems.filter((item) =>
    hasPermission(item.permission)
  );

  const mainItems = visibleNavigationItems.filter((item) =>
    [
      "dashboard",
      "menu",
      "orders",
      "reservations",
      "tables",
    ].includes(item.permission)
  );

  const managementItems = visibleNavigationItems.filter((item) =>
    ["customers", "staff", "billing"].includes(item.permission)
  );

  const systemItems = visibleNavigationItems.filter(
    (item) => item.permission === "settings"
  );

  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col overflow-hidden bg-slate-900 text-white md:flex">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600">
            <Utensils size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold">RestruHub</h1>

            <p className="text-xs text-slate-400">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
        {/* Main */}
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main
        </p>

        {mainItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            permission={item.permission}
          />
        ))}

        {/* Management */}
        {managementItems.length > 0 && (
          <>
            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Management
            </p>

            {managementItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                permission={item.permission}
              />
            ))}
          </>
        )}

        {/* System */}
        {systemItems.length > 0 && (
          <>
            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              System
            </p>

            {systemItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                permission={item.permission}
              />
            ))}
          </>
        )}
      </nav>

      {/* Current User + Logout */}
      <div className="shrink-0 border-t border-slate-800 p-4">
        {user && (
          <div className="mb-3 rounded-lg bg-slate-800 px-3 py-3">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user.role}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  path,
}: SidebarItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-orange-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate">{label}</span>
    </NavLink>
  );
};

export default Sidebar;