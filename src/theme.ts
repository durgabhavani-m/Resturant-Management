import { createTheme, type PaletteMode } from "@mui/material/styles";

const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: "#ea580c",
      dark: "#c2410c",
      light: "#fff7ed",
    },
    background: {
      default: mode === "dark" ? "#111827" : "#f1f5f9",
      paper: mode === "dark" ? "#1f2937" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#f8fafc" : "#0f172a",
      secondary: mode === "dark" ? "#cbd5e1" : "#64748b",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "1.5rem", fontWeight: 700 },
    h2: { fontSize: "1.25rem", fontWeight: 600 },
    h3: { fontSize: "1.1rem", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default createAppTheme;
