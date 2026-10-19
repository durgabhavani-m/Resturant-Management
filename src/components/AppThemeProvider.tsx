import type { ReactNode } from "react";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";
import createAppTheme from "../theme";

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { preferences } = useAppPreferences();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const mode = preferences.theme === "system"
    ? (prefersDarkMode ? "dark" : "light")
    : preferences.theme;

  return <ThemeProvider theme={createAppTheme(mode)}>{children}</ThemeProvider>;
};

export default AppThemeProvider;
