import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EventIcon from "@mui/icons-material/Event";
import ChairIcon from "@mui/icons-material/Chair";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CategoryIcon from "@mui/icons-material/Category";

import { useAuth } from "../../context/AuthContext";
import type { Permission } from "../../types/permission";
import TuneIcon from "@mui/icons-material/Tune";
import { useAppPreferences } from "../../context/AppPreferencesContext";

interface NavigationItem {
  icon: ReactNode;
  label: string;
  path: string;
  permission: Permission;
}

const Sidebar = () => {
  const { user, hasPermission, logout } = useAuth();
  const { preferences } = useAppPreferences();
  const navigate = useNavigate();
  const expanded = preferences.sidebar === "expanded";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navigationItems: NavigationItem[] = [
    { icon: <DashboardIcon fontSize="small" />, label: "Dashboard", path: "/dashboard", permission: "dashboard" },
    { icon: <RestaurantMenuIcon fontSize="small" />, label: "Menu", path: "/menu", permission: "menu" },
    { icon: <CategoryIcon fontSize="small" />, label: "Categories", path: "/categories", permission: "menu" },
    { icon: <TuneIcon fontSize="small" />, label: "Modifier Group", path: "/modifiers", permission: "menu"},
    { icon: <ShoppingCartIcon fontSize="small" />, label: "Orders", path: "/orders", permission: "orders" },
    { icon: <EventIcon fontSize="small" />, label: "Reservations", path: "/reservations", permission: "reservations" },
    { icon: <ChairIcon fontSize="small" />, label: "Tables", path: "/tables", permission: "tables" },
    { icon: <ReceiptIcon fontSize="small" />, label: "Billing", path: "/billing", permission: "billing" },
    { icon: <ManageAccountsIcon fontSize="small" />, label: "Staff", path: "/staff", permission: "staff" },
    { icon: <SettingsIcon fontSize="small" />, label: "Settings", path: "/settings", permission: "settings" },
  ];

  const visibleItems = navigationItems.filter((item) => hasPermission(item.permission));

  const mainItems = visibleItems.filter((item) =>
    ["dashboard", "menu", "orders", "reservations", "tables"].includes(item.permission)
  );
  const managementItems = visibleItems.filter((item) =>
    ["staff", "billing"].includes(item.permission)
  );
  const systemItems = visibleItems.filter((item) => item.permission === "settings");
  const renderSection = (title: string, items: NavigationItem[]) => {
    if (items.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {expanded && (
          <Typography
            variant="caption"
            sx={{ px: 2, mb: 1, display: "block", color: "grey.500", fontWeight: 600, letterSpacing: 1 }}
          >
            {title}
          </Typography>
        )}
        <List dense disablePadding>
          {items.map((item) => (
            <Tooltip key={item.path} title={expanded ? "" : item.label} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                aria-label={expanded ? undefined : item.label}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  color: "grey.400",
                  justifyContent: expanded ? "initial" : "center",
                  px: expanded ? 2 : 1,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                  "&:hover": { bgcolor: "grey.800", color: "white" },
                }}
              >
                <ListItemIcon sx={{ minWidth: expanded ? 36 : 0, color: "inherit", justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {expanded && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        width: expanded ? 256 : 76,
        flexShrink: 0,
        height: "100dvh",
        bgcolor: "grey.900",
        color: "white",
        overflow: "hidden",
        transition: "width 180ms ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: expanded ? "flex-start" : "center", gap: 1.5, height: 80, px: expanded ? 3 : 1, borderBottom: "1px solid", borderColor: "grey.800" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RestaurantMenuIcon />
        </Box>
        {expanded && <Box>
          <Typography fontWeight={700}>RestruHub</Typography>
          <Typography variant="caption" color="grey.500">
            Management System
          </Typography>
        </Box>}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 3, px: expanded ? 1 : 0 }}>
        {renderSection("MAIN", mainItems)}
        {renderSection("MANAGEMENT", managementItems)}
        {renderSection("SYSTEM", systemItems)}
      </Box>

      <Box sx={{ p: expanded ? 2 : 1, borderTop: "1px solid", borderColor: "grey.800" }}>
        {user && expanded && (
          <Box sx={{ mb: 1.5, px: 1.5, py: 1.5, borderRadius: 1, bgcolor: "grey.800" }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="grey.500" noWrap>
              {user.role}
            </Typography>
          </Box>
        )}
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          aria-label="Logout"
          onClick={handleLogout}
          sx={{ justifyContent: expanded ? "flex-start" : "center", minWidth: 0, color: "grey.400", "& .MuiButton-startIcon": { mr: expanded ? 1 : 0 }, "&:hover": { bgcolor: "grey.800", color: "white" } }}
        >
          {expanded && "Logout"}
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
