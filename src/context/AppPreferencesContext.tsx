import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const APP_PREFERENCES_KEY = "restaurant_app_preferences";

export type ThemePreference = "light" | "dark" | "system";
export type SidebarPreference = "expanded" | "collapsed";
export type HistoryDateRange = "Today" | "Last 7 Days" | "Last 30 Days";

export interface AppPreferences {
  theme: ThemePreference;
  sidebar: SidebarPreference;
  confirmBeforeDelete: boolean;
  defaultHistoryDateRange: HistoryDateRange;
}

interface AppPreferencesContextValue {
  preferences: AppPreferences;
  updatePreferences: (preferences: AppPreferences) => void;
}

const defaultPreferences: AppPreferences = {
  theme: "light",
  sidebar: "expanded",
  confirmBeforeDelete: true,
  defaultHistoryDateRange: "Today",
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined);

export const AppPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const stored = localStorage.getItem(APP_PREFERENCES_KEY);
    return stored
      ? { ...defaultPreferences, ...JSON.parse(stored) as Partial<AppPreferences> }
      : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (updatedPreferences: AppPreferences) => {
    setPreferences(updatedPreferences);
  };

  return (
    <AppPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </AppPreferencesContext.Provider>
  );
};


export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
  }

  return context;
};
