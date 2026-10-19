import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "../types/role";

const ROLE_STORAGE_KEY = "restaurant_roles";

const initialRoles: Role[] = [
  {
    id: "ROLE-1",
    name: "Admin",
    permissions: [
      "dashboard",
      "tables",
      "orders",
      "reservations",
      "billing",
      "menu",
      "reports",
      "staff",
      "settings",
    ],
    isSystemRole: true,
  },
  {
    id: "ROLE-2",
    name: "Dine-in Staff",
    permissions: [
      "dashboard",
      "tables",
      "orders",
    ],
    isSystemRole: true,
  },
  {
    id: "ROLE-3",
    name: "Counter Staff",
    permissions: [
      "dashboard",
      "reservations",
      "billing",
      "orders",
    ],
    isSystemRole: true,
  },
];

const getNextRoleId = (roles: Role[]) => {
  const highestId = roles.reduce((highest, role) => {
    const match = /^ROLE-(\d+)$/.exec(role.id);

    return match
      ? Math.max(highest, Number(match[1]))
      : highest;
  }, 0);

  return `ROLE-${highestId + 1}`;
};

interface RoleContextType {
  roles: Role[];
  addRole: (
    name: string,
    permissions: Role["permissions"]
  ) => boolean;
  updateRole: (updatedRole: Role) => boolean;
  deleteRole: (roleId: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(
  undefined
);

export const RoleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [roles, setRoles] = useState<Role[]>(() => {
    const storedRoles = localStorage.getItem(ROLE_STORAGE_KEY);

    if (storedRoles) {
      try {
        return JSON.parse(storedRoles) as Role[];
      } catch {
        return initialRoles;
      }
    }

    return initialRoles;
  });

  useEffect(() => {
    localStorage.setItem(
      ROLE_STORAGE_KEY,
      JSON.stringify(roles)
    );
  }, [roles]);

  const addRole = (
    name: string,
    permissions: Role["permissions"]
  ): boolean => {
    const normalizedName = name.trim().toLowerCase();

    if (
      !normalizedName ||
      roles.some(
        (role) =>
          role.name.trim().toLowerCase() === normalizedName
      )
    ) {
      return false;
    }

    setRoles((previousRoles) => [
      ...previousRoles,
      {
        id: getNextRoleId(previousRoles),
        name: name.trim(),
        permissions,
        isSystemRole: false,
      },
    ]);

    return true;
  };

  const updateRole = (updatedRole: Role): boolean => {
    const duplicateName = roles.some(
      (role) =>
        role.id !== updatedRole.id &&
        role.name.trim().toLowerCase() ===
          updatedRole.name.trim().toLowerCase()
    );

    if (duplicateName) {
      return false;
    }

    setRoles((previousRoles) =>
      previousRoles.map((role) =>
        role.id === updatedRole.id
          ? updatedRole
          : role
      )
    );

    return true;
  };

  const deleteRole = (roleId: string): boolean => {
    const role = roles.find((item) => item.id === roleId);

    if (!role || role.isSystemRole) {
      return false;
    }

    setRoles((previousRoles) =>
      previousRoles.filter((role) => role.id !== roleId)
    );

    return true;
  };

  return (
    <RoleContext.Provider
      value={{
        roles,
        addRole,
        updateRole,
        deleteRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRoles = () => {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error(
      "useRoles must be used inside RoleProvider"
    );
  }

  return context;
};