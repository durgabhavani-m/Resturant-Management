
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { MenuModifierGroup } from "../types/menu";

interface ModifierContextType {
  modifierGroups: MenuModifierGroup[];
  addModifierGroup: (group: MenuModifierGroup) => boolean;
  updateModifierGroup: (group: MenuModifierGroup) => boolean;
  deleteModifierGroup: (id: string) => void;
}

const ModifierContext = createContext<ModifierContextType | undefined>(
  undefined
);

const STORAGE_KEY = "restaurant_modifier_groups";

export const ModifierProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [modifierGroups, setModifierGroups] = useState<MenuModifierGroup[]>(
    () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as MenuModifierGroup[])
        : [];
    }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modifierGroups));
  }, [modifierGroups]);

  const addModifierGroup = (group: MenuModifierGroup): boolean => {
    const name = group.name.trim().toLowerCase();

    if (
      !name ||
      modifierGroups.some(
        (existing) => existing.name.trim().toLowerCase() === name
      )
    ) {
      return false;
    }

    setModifierGroups((previous) => [...previous, group]);
    return true;
  };

  const updateModifierGroup = (
    updatedGroup: MenuModifierGroup
  ): boolean => {
    const name = updatedGroup.name.trim().toLowerCase();

    if (
      !name ||
      modifierGroups.some(
        (group) =>
          group.id !== updatedGroup.id &&
          group.name.trim().toLowerCase() === name
      )
    ) {
      return false;
    }

    setModifierGroups((previous) =>
      previous.map((group) =>
        group.id === updatedGroup.id ?
        {
          ...group,
          ...updatedGroup,
        }
        :group
      )
    );

    return true;
  };

  const deleteModifierGroup = (id: string) => {
    setModifierGroups((previous) =>
      previous.filter((group) => group.id !== id)
    );
  };

  return (
    <ModifierContext.Provider
      value={{
        modifierGroups,
        addModifierGroup,
        updateModifierGroup,
        deleteModifierGroup,
      }}
    >
      {children}
    </ModifierContext.Provider>
  );
};

export const useModifiers = () => {
  const context = useContext(ModifierContext);

  if (!context) {
    throw new Error("useModifiers must be used inside ModifierProvider");
  }

  return context;
};