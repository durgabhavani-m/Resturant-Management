import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

export type AppThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: AppThemeMode;
  toggleTheme: () => void;
  setMode: (mode: AppThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "restaurant-app-theme";

export function AppThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<AppThemeMode>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((current) => (current === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#ed4b0b",
            light: "#ff7b45",
            dark: "#c83a05",
            contrastText: "#ffffff",
          },
          background:
            mode === "light"
              ? {
                  default: "#f3f4f6",
                  paper: "#ffffff",
                }
              : {
                  default: "#111827",
                  paper: "#1f2937",
                },
          text:
            mode === "light"
              ? {
                  primary: "#111827",
                  secondary: "#64748b",
                }
              : {
                  primary: "#f3f4f6",
                  secondary: "#cbd5e1",
                },
          divider: mode === "light" ? "#e5e7eb" : "#374151",
        },

        shape: {
          borderRadius: 10,
        },

        typography: {
          fontFamily: [
            "Inter",
            "Roboto",
            "Arial",
            "sans-serif",
          ].join(","),

          h1: {
            fontSize: "1.8rem",
            fontWeight: 700,
          },
          h2: {
            fontSize: "1.5rem",
            fontWeight: 700,
          },
          h4: {
            fontSize: "1.2rem",
            fontWeight: 700,
          },
          h5: {
            fontSize: "1rem",
            fontWeight: 700,
          },
          body1: {
            fontSize: "0.875rem",
          },
          body2: {
            fontSize: "0.8rem",
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },

        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                margin: 0,
                minHeight: "100vh",
                backgroundColor:
                  mode === "light" ? "#f3f4f6" : "#111827",
                transition:
                  "background-color 0.2s ease, color 0.2s ease",
              },
              "*": {
                boxSizing: "border-box",
              },
            },
          },

          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                border: `1px solid ${
                  mode === "light" ? "#e5e7eb" : "#374151"
                }`,
                boxShadow: "none",
              },
            },
          },

          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                border: `1px solid ${
                  mode === "light" ? "#e5e7eb" : "#374151"
                }`,
                boxShadow: "none",
              },
            },
          },

          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },

          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 9,
              },
              containedPrimary: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              },
            },
          },

          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside AppThemeProvider"
    );
  }

  return context;
}
