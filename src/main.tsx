import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";

import App from "./App";
import { migrateStoredRecordIds } from "./utils/recordIds";
import { AppPreferencesProvider } from "./context/AppPreferencesContext";
import AppThemeProvider from "./components/AppThemeProvider";

import "./index.css";

migrateStoredRecordIds();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppPreferencesProvider>
      <AppThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppThemeProvider>
    </AppPreferencesProvider>
  </StrictMode>
);
