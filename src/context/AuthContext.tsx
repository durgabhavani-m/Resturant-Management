import { createContext, useContext, useState } from "react";
import type { StaffRole } from "../types/staff";
import type { Permission } from "../types/permission";
import { rolePermissions } from "../config/rolePermission";
import {normalizeRecordId} from "../utils/recordIds";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("restaurant_current_user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as AuthUser;
      const normalizedUser = {
        ...parsedUser,
        id: normalizeRecordId(parsedUser.id, "STAFF"),
      };
      if (normalizedUser.id !== parsedUser.id) {
        localStorage.setItem("restaurant_current_user", JSON.stringify(normalizedUser));
      }
      return normalizedUser;
    }

    return null;
  });

  const login = (loggedInUser: AuthUser) => {
    const normalizedUser = {
      ...loggedInUser,
      id: normalizeRecordId(loggedInUser.id, "STAFF"),
    };
    setUser(normalizedUser);

    localStorage.setItem(
      "restaurant_current_user",
      JSON.stringify(normalizedUser)
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("restaurant_current_user");
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;

    return rolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};